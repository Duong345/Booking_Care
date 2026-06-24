import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import moment from 'moment';

import {
  getBookingHistoryForPatient,
  postPatientCancelBooking,
  type IApiResponse,
} from '../../services/userService';
import './BookingHistoryModal.scss';

interface TimeTypeData {
  valueVi?: string;
  valueEn?: string;
}

interface DoctorData {
  firstName?: string;
  lastName?: string;
  positionData?: {
    valueVi?: string;
    valueEn?: string;
  };
}

interface BookingHistoryItem {
  id: number;
  statusId: 'S1' | 'S2' | 'S3' | 'S4' | string;
  doctorId: number;
  patientId: number;
  date: string;
  timeType: string;
  reason?: string;
  createdAt?: string;
  timeTypeDataPatient?: TimeTypeData;
  doctorData?: DoctorData | null;
}

interface BookingHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId?: number;
  patientEmail?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  S1: { label: 'Chờ xác nhận', className: 'pending' },
  S2: { label: 'Đã xác nhận', className: 'confirmed' },
  S3: { label: 'Đã khám', className: 'completed' },
  S4: { label: 'Đã hủy', className: 'canceled' },
};

const BookingHistoryModal = ({
  isOpen,
  onClose,
  patientId,
  patientEmail,
}: BookingHistoryModalProps) => {
  const navigate = useNavigate();
  const [lookupEmail, setLookupEmail] = useState(patientEmail || '');
  const [bookings, setBookings] = useState<BookingHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLookupEmail(patientEmail || '');
    }
  }, [isOpen, patientEmail]);

  const queryPayload = useMemo(
    () => ({
      patientId,
      email: patientEmail || lookupEmail.trim(),
    }),
    [patientId, patientEmail, lookupEmail]
  );

  const fetchBookingHistory = useCallback(async () => {
    if (!queryPayload.patientId && !queryPayload.email) {
      setError('Vui lòng nhập email để tra cứu lịch khám');
      setBookings([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = (await getBookingHistoryForPatient(
        queryPayload
      )) as unknown as IApiResponse<BookingHistoryItem[]>;

      if (res?.errCode === 0) {
        setBookings(res.data || []);
      } else {
        setBookings([]);
        setError(res?.errMessage || 'Không thể tải lịch khám');
      }
    } catch {
      setBookings([]);
      setError('Không thể tải lịch khám');
    } finally {
      setLoading(false);
    }
  }, [queryPayload]);

  useEffect(() => {
    if (isOpen && (patientId || patientEmail)) {
      fetchBookingHistory();
    }
  }, [isOpen, patientId, patientEmail, fetchBookingHistory]);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const canCancelBooking = (booking: BookingHistoryItem) => {
    if (booking.statusId !== 'S1' && booking.statusId !== 'S2') return false;

    const today = moment().startOf('day').valueOf();
    const bookingDate = Number(booking.date);
    return Number.isFinite(bookingDate) && bookingDate >= today;
  };

  const canRebookBooking = (booking: BookingHistoryItem) => {
    return booking.statusId === 'S4';
  };

  const handleCancelBooking = async (booking: BookingHistoryItem) => {
    const ok = window.confirm('Bạn có chắc muốn hủy lịch khám này?');
    if (!ok) return;

    try {
      const res = (await postPatientCancelBooking({
        bookingId: booking.id,
        patientId,
        email: patientEmail || lookupEmail.trim(),
      })) as unknown as IApiResponse;

      if (res?.errCode === 0) {
        setBookings((prev) =>
          prev.map((item) =>
            item.id === booking.id ? { ...item, statusId: 'S4' } : item
          )
        );
        window.dispatchEvent(
          new CustomEvent('patientBookingChanged', {
            detail: {
              action: 'cancel',
              bookingId: booking.id,
              doctorId: booking.doctorId,
              date: booking.date,
              timeType: booking.timeType,
            },
          })
        );
        toast.success('Hủy lịch khám thành công');
      } else {
        toast.error(res?.errMessage || 'Không thể hủy lịch khám');
      }
    } catch {
      toast.error('Không thể hủy lịch khám');
    }
  };

  const handleRebookBooking = (booking: BookingHistoryItem) => {
    sessionStorage.setItem(
      'pendingRebookAppointment',
      JSON.stringify({
        bookingId: booking.id,
        doctorId: booking.doctorId,
        patientId: booking.patientId,
        email: patientEmail || lookupEmail.trim(),
      })
    );
    window.dispatchEvent(
      new CustomEvent('pendingRebookAppointmentChanged', {
        detail: {
          bookingId: booking.id,
          doctorId: booking.doctorId,
          patientId: booking.patientId,
          email: patientEmail || lookupEmail.trim(),
        },
      })
    );
    toast.info('Chọn khung giờ mới để gửi email xác nhận đặt lại lịch');
    onClose();
    navigate(`/detail-doctor/${booking.doctorId}`);
  };

  const getDoctorName = (booking: BookingHistoryItem) => {
    const doctor = booking.doctorData;
    if (!doctor) return `Bác sĩ #${booking.doctorId}`;

    const position = doctor.positionData?.valueVi || '';
    const fullName = `${doctor.lastName || ''} ${doctor.firstName || ''}`.trim();
    return [position, fullName].filter(Boolean).join(', ');
  };

  const getTimeText = (booking: BookingHistoryItem) => {
    return booking.timeTypeDataPatient?.valueVi || booking.timeType;
  };

  const getDateText = (booking: BookingHistoryItem) => {
    const bookingDate = Number(booking.date);
    if (!Number.isFinite(bookingDate)) return '';

    return moment(bookingDate).format('DD/MM/YYYY');
  };

  if (!isOpen) return null;

  return (
    <div className="booking-history-overlay" onClick={onClose}>
      <div
        className="booking-history-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-history-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="booking-history-header">
          <div>
            <h2 id="booking-history-title">Lịch khám của tôi</h2>
            <span>Theo dõi trạng thái đặt lịch và hủy lịch còn hiệu lực</span>
          </div>
          <button
            className="booking-history-close"
            onClick={onClose}
            aria-label="Đóng"
          >
            ×
          </button>
        </div>

        <div className="booking-history-lookup">
          <input
            type="email"
            value={lookupEmail}
            onChange={(event) => setLookupEmail(event.target.value)}
            placeholder="Nhập email đã đặt lịch"
            disabled={Boolean(patientEmail)}
          />
          <button onClick={fetchBookingHistory} disabled={loading}>
            {loading ? 'Đang tải...' : 'Tra cứu'}
          </button>
        </div>

        <div className="booking-history-body">
          {error && <div className="booking-history-message">{error}</div>}

          {!error && loading && (
            <div className="booking-history-message">Đang tải lịch khám...</div>
          )}

          {!error && !loading && bookings.length === 0 && (
            <div className="booking-history-message">
              Chưa có lịch khám nào cho email này
            </div>
          )}

          {!loading && bookings.length > 0 && (
            <div className="booking-history-list">
              {bookings.map((booking) => {
                const status = statusConfig[booking.statusId] || {
                  label: booking.statusId,
                  className: 'unknown',
                };

                return (
                  <div className="booking-history-item" key={booking.id}>
                    <div className="booking-history-main">
                      <div className="booking-history-doctor">
                        {getDoctorName(booking)}
                      </div>
                      <div className="booking-history-meta">
                        <span>
                          <i className="far fa-calendar-alt"></i>
                          {getDateText(booking)}
                        </span>
                        <span>
                          <i className="far fa-clock"></i>
                          {getTimeText(booking)}
                        </span>
                      </div>
                      {booking.reason && (
                        <div className="booking-history-reason">
                          Lý do khám: {booking.reason}
                        </div>
                      )}
                    </div>

                    <div className="booking-history-actions">
                      <span className={`booking-status ${status.className}`}>
                        {status.label}
                      </span>
                      {canCancelBooking(booking) && (
                        <button onClick={() => handleCancelBooking(booking)}>
                          Hủy lịch
                        </button>
                      )}
                      {canRebookBooking(booking) && (
                        <button
                          className="btn-rebook"
                          onClick={() => handleRebookBooking(booking)}
                        >
                          Đặt lại
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingHistoryModal;
