import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import './ManagePatient.scss';
import DatePicker from '../../../components/Input/DatePicker';
import {
  getAllPatientForDoctor,
  postSendRemedy,
  postSendCancel,
  IApiResponse,
} from '../../../services/userService';
import moment from 'moment';
import { toast } from 'react-toastify';
import { LANGUAGES } from '../../../utils';
import RemedyModal from './RemedyModal';
import DayScheduleModal from './DayScheduleModal';
import ScheduleCalendar from './ScheduleCalendar';
import DetailDoctorModal from './DetailDoctorModal';
import CustomLoadingOverlay from '../../../components/CustomLoadingOverlay/CustomLoadingOverlay';

// Interfaces
interface PatientData {
  doctorId: number;
  patientId: number;
  date: number;
  timeType: string;
  reason?: string;
  patientData?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    address?: string;
    genderData?: {
      valueVi: string;
      valueEn: string;
    };
  };
  timeTypeDataPatient?: {
    valueVi: string;
    valueEn: string;
  };
}

interface ModalData {
  doctorId?: number;
  patientId?: number;
  email?: string;
  timeType?: string;
  patientName?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  gender?: string;
  time?: string;
  bookingDate?: number;
  reason?: string;
}

interface CalendarBooking {
  [key: string]: ModalData[];
}

interface UserInfo {
  id: number;
  [key: string]: any;
}

interface DetailPatient extends ModalData {
  patientId?: number;
  doctorId?: number;
  email?: string;
  timeType?: string;
}

const ManagePatient: React.FC = () => {
  const language = useSelector((state: any) => state.app.language);
  const user = useSelector((state: any) => state.user.userInfo) as UserInfo;

  // State
  const [currentDate, setCurrentDate] = useState<number>(
    moment(new Date()).startOf('day').valueOf()
  );
  const [dataPatient, setDataPatient] = useState<PatientData[]>([]);
  const [isOpenRemedyModal, setIsOpenRemedyModal] = useState<boolean>(false);
  const [dataModal, setDataModal] = useState<ModalData>({});
  const [isShowLoading, setIsShowLoading] = useState<boolean>(false);
  const [showScheduleCalendar, setShowScheduleCalendar] =
    useState<boolean>(false);
  const [calendarBookings, setCalendarBookings] = useState<CalendarBooking>({});
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [detailPatient, setDetailPatient] = useState<DetailPatient | null>(
    null
  );
  const [showDayModal, setShowDayModal] = useState<boolean>(false);
  const [dayPatients, setDayPatients] = useState<ModalData[]>([]);

  // Get current date info
  const dateInfo = useMemo(() => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth(),
      today: now.getDate(),
    };
  }, []);

  // Load calendar bookings from localStorage
  const loadCalendarBookings = useCallback(() => {
    if (user && user.id) {
      const key = `calendarBookings_${user.id}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const bookings = JSON.parse(saved);
          setCalendarBookings(bookings);
        } catch (e) {
          console.log('Error loading calendar bookings:', e);
        }
      }
    }
  }, [user]);

  // Save calendar bookings to localStorage
  const saveCalendarBookings = useCallback(
    (bookings: CalendarBooking) => {
      if (user && user.id) {
        const key = `calendarBookings_${user.id}`;
        try {
          localStorage.setItem(key, JSON.stringify(bookings));
        } catch (e) {
          console.warn('Failed to save calendar bookings to localStorage:', e);
        }
      }
    },
    [user]
  );

  // Fetch patient data for selected date
  const getDataPatient = useCallback(
    async (date?: number) => {
      if (!user || !user.id) return;

      const targetDate = date ?? currentDate;
      const formattedDate = new Date(targetDate).getTime().toString();

      try {
        const res = (await getAllPatientForDoctor({
          doctorId: user.id,
          date: formattedDate,
        })) as unknown as IApiResponse<PatientData[]>;

        if (res && res.errCode === 0 && res.data) {
          setDataPatient(res.data);
        } else {
          setDataPatient([]);
        }
      } catch (error) {
        console.error('Error fetching patient data:', error);
        setDataPatient([]);
      }
    },
    [user, currentDate]
  );

  // Initialize on component mount
  useEffect(() => {
    getDataPatient();
    loadCalendarBookings();
  }, []);

  // Handle date picker change
  const handleOnChangeDatePicker = useCallback(
    (date: number[]) => {
      const newDate = date[0];
      setCurrentDate(newDate);
      getDataPatient(newDate);
    },
    [getDataPatient]
  );

  // Handle confirm button click
  const handleBtnConfirm = useCallback((item: PatientData) => {
    const data: ModalData = {
      doctorId: item.doctorId,
      patientId: item.patientId,
      email: item.patientData?.email || '',
      timeType: item.timeType,
      patientName: (
        (item.patientData?.firstName || '') +
        ' ' +
        (item.patientData?.lastName || '')
      ).trim(),
      firstName: item.patientData?.firstName || '',
      lastName: item.patientData?.lastName || '',
      address: item.patientData?.address || '',
      gender: item.patientData?.genderData?.valueVi || 'N/A',
      time: item.timeTypeDataPatient?.valueVi || 'N/A',
      bookingDate: item.date,
      reason: item.reason || '',
    };
    setDataModal(data);
    setIsOpenRemedyModal(true);
  }, []);

  // Handle cancel button click
  const handleBtnCancel = useCallback(
    async (item: PatientData) => {
      const ok = window.confirm('Bạn có chắc muốn huỷ lịch khám này?');
      if (!ok) return;

      setIsShowLoading(true);
      try {
        const res = (await postSendCancel({
          email: item.patientData?.email || '',
          doctorId: item.doctorId,
          patientId: item.patientId,
          timeType: item.timeType,
          language,
          patientName: (
            (item.patientData?.firstName || '') +
            ' ' +
            (item.patientData?.lastName || '')
          ).trim(),
        })) as unknown as IApiResponse;

        if (res && res.errCode === 0) {
          toast.success('Huỷ lịch và gửi email thành công');
          await getDataPatient();
        } else {
          toast.error('Huỷ không thành công');
          console.log('error cancel:', res);
        }
      } catch (e) {
        console.log(e);
        toast.error('Có lỗi khi huỷ lịch');
      } finally {
        setIsShowLoading(false);
      }
    },
    [language, getDataPatient]
  );

  // Send remedy
  const sendRemedy = useCallback(
    async (dataChild: { email: string; imgBase64: string }) => {
      setIsShowLoading(true);
      try {
        const res = (await postSendRemedy({
          email: dataChild.email,
          imgBase64: dataChild.imgBase64,
          doctorId: dataModal.doctorId,
          patientId: dataModal.patientId,
          timeType: dataModal.timeType,
          language,
          patientName: dataModal.patientName,
        })) as unknown as IApiResponse;

        if (res && res.errCode === 0) {
          // Save to calendar bookings
          const bookingDate = new Date(currentDate);
          const dateKey = `${bookingDate.getFullYear()}-${String(bookingDate.getMonth() + 1).padStart(2, '0')}-${String(bookingDate.getDate()).padStart(2, '0')}`;
          const patientInfo: ModalData = {
            ...dataModal,
            email: dataChild.email,
          };

          setCalendarBookings((prev) => {
            const updated = { ...prev };
            if (!updated[dateKey]) updated[dateKey] = [];

            // Check duplicate before pushing - prevent double booking
            const isDuplicate = updated[dateKey].some(
              (p) =>
                p.patientId === dataModal.patientId &&
                p.timeType === dataModal.timeType
            );

            if (!isDuplicate) {
              updated[dateKey].push(patientInfo);
              saveCalendarBookings(updated);
            }
            return updated;
          });

          // Remove patient from table to prevent clicking again
          setDataPatient((prev) =>
            prev.filter(
              (item) =>
                !(
                  item.patientId === dataModal.patientId &&
                  item.timeType === dataModal.timeType
                )
            )
          );

          toast.success('Send Remedy succeeds!');
          setIsOpenRemedyModal(false);
        } else {
          toast.error('Something wrongs...');
          console.log('error send remedy:', res);
        }
      } catch (error) {
        console.error('Error sending remedy:', error);
        toast.error('Failed to send remedy');
      } finally {
        setIsShowLoading(false);
      }
    },
    [dataModal, language, currentDate, saveCalendarBookings]
  );

  // Close remedy modal
  const closeRemedyModal = useCallback(() => {
    setIsOpenRemedyModal(false);
  }, []);

  // Handle cancel from modal
  const handleCancelFromModal = useCallback(
    async (patient: DetailPatient) => {
      const ok = window.confirm('Bạn có chắc muốn huỷ lịch khám này?');
      if (!ok) return;

      setIsShowLoading(true);
      try {
        const res = (await postSendCancel({
          email: patient.email || '',
          doctorId: patient.doctorId,
          patientId: patient.patientId,
          timeType: patient.timeType,
          date: patient.bookingDate,
          language,
          patientName: (
            (patient.firstName || '') +
            ' ' +
            (patient.lastName || '')
          ).trim(),
        })) as unknown as IApiResponse;

        if (res && res.errCode === 0) {
          toast.success('Huỷ lịch và gửi email thành công');
          await getDataPatient();

          // Update calendar bookings
          setCalendarBookings((prev) => {
            const updated = { ...prev };
            const dateKey = Object.keys(updated).find((key) =>
              updated[key].some(
                (p) =>
                  p.patientId === patient.patientId &&
                  p.timeType === patient.timeType
              )
            );

            if (dateKey && updated[dateKey]) {
              updated[dateKey] = updated[dateKey].filter(
                (p) =>
                  !(
                    p.patientId === patient.patientId &&
                    p.timeType === patient.timeType
                  )
              );
              if (updated[dateKey].length === 0) {
                delete updated[dateKey];
              }
            }

            saveCalendarBookings(updated);
            return updated;
          });

          setShowDetailModal(false);
        } else {
          toast.error('Huỷ không thành công');
          console.log('error cancel:', res);
        }
      } catch (e) {
        console.log(e);
        toast.error('Có lỗi khi huỷ lịch');
      } finally {
        setIsShowLoading(false);
      }
    },
    [language, getDataPatient, saveCalendarBookings]
  );

  // Handle select time from day modal
  const handleSelectTime = useCallback((patient: ModalData) => {
    setShowDetailModal(true);
    setDetailPatient(patient as DetailPatient);
    setShowDayModal(false);
    setDayPatients([]);
  }, []);

  // Handle day click on calendar
  const handleDayClick = useCallback(
    (dateStr: string) => {
      const patients = calendarBookings[dateStr];
      if (patients && patients.length > 0) {
        setShowDayModal(true);
        setDayPatients(patients);
      }
    },
    [calendarBookings]
  );

  // Table data processing
  const tableRows = useMemo(() => {
    return dataPatient.map((item, index) => {
      const time =
        language === LANGUAGES.VI
          ? item.timeTypeDataPatient?.valueVi || 'N/A'
          : item.timeTypeDataPatient?.valueEn || 'N/A';
      const gender =
        language === LANGUAGES.VI
          ? item.patientData?.genderData?.valueVi || 'N/A'
          : item.patientData?.genderData?.valueEn || 'N/A';
      const fullName =
        `${item.patientData?.firstName || ''} ${item.patientData?.lastName || ''}`.trim() ||
        'N/A';
      const address = item.patientData?.address || 'N/A';
      const dateTime =
        item.date && moment(item.date).isValid()
          ? moment(item.date).format('DD/MM/YYYY') + ' ' + time
          : time;

      return { dateTime, fullName, address, gender, item, index };
    });
  }, [dataPatient, language]);

  return (
    <>
      <CustomLoadingOverlay active={isShowLoading} text={'Đang xử lý...'} />
      <div className="manage-patient-container">
        <div className="m-p-title">Quản lý bệnh nhân khám bệnh</div>

        {/* Calendar Toggle Button */}
        <div style={{ marginBottom: 16 }}>
          <button
            className="mp-btn-calendar"
            style={{
              minWidth: '180px',
              height: '40px',
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '16px',
              marginRight: '12px',
            }}
            onClick={() => setShowScheduleCalendar(!showScheduleCalendar)}
          >
            Lịch Trình Khám bệnh
          </button>
        </div>

        {/* Calendar Component */}
        {showScheduleCalendar && (
          <div style={{ marginBottom: 24 }}>
            <ScheduleCalendar
              year={dateInfo.year}
              month={dateInfo.month}
              today={dateInfo.today}
              calendarBookings={calendarBookings}
              onDayClick={handleDayClick}
            />
          </div>
        )}

        {/* Day Schedule Modal */}
        {showDayModal && (
          <DayScheduleModal
            patients={dayPatients}
            onClose={() => {
              setShowDayModal(false);
              setDayPatients([]);
            }}
            onSelectTime={handleSelectTime}
          />
        )}

        {/* Detail Doctor Modal */}
        {showDetailModal && (
          <DetailDoctorModal
            patient={detailPatient}
            onClose={() => {
              setShowDetailModal(false);
              setDetailPatient(null);
            }}
            onCancel={handleCancelFromModal}
          />
        )}

        {/* Date Picker and Table */}
        <div className="manage-patient-body row">
          <div className="col-4 form-group">
            <label>Chọn ngày khám</label>
            <DatePicker
              onChange={handleOnChangeDatePicker}
              className="form-control"
              value={currentDate}
            />
          </div>

          <div className="col-12 table-manage-patient">
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th
                    style={{ width: 60, textAlign: 'center', paddingLeft: 0 }}
                  >
                    STT
                  </th>
                  <th style={{ width: 160, paddingLeft: 10 }}>Thời gian</th>
                  <th style={{ width: 280, paddingLeft: 15 }}>Họ và tên</th>
                  <th style={{ width: 220, paddingLeft: 15 }}>Địa chỉ</th>
                  <th style={{ width: 120, textAlign: 'center' }}>Giới tính</th>
                  <th style={{ width: 140, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.length > 0 ? (
                  tableRows.map(
                    ({ dateTime, fullName, address, gender, item, index }) => (
                      <tr key={index}>
                        <td style={{ textAlign: 'center' }}>{index + 1}</td>
                        <td style={{ paddingLeft: 10 }}>{dateTime}</td>
                        <td style={{ paddingLeft: 15 }}>{fullName}</td>
                        <td style={{ paddingLeft: 15 }}>{address}</td>
                        <td style={{ textAlign: 'center' }}>{gender}</td>
                        <td
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                          }}
                        >
                          <button
                            className="mp-btn-confirm"
                            style={{ minWidth: '90px', height: '36px' }}
                            onClick={() => handleBtnConfirm(item)}
                          >
                            Xác nhận
                          </button>
                          <button
                            className="mp-btn-cancel"
                            style={{ minWidth: '90px', height: '36px' }}
                            onClick={() => handleBtnCancel(item)}
                          >
                            Huỷ
                          </button>
                        </td>
                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center' }}>
                      no data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Remedy Modal */}
      <RemedyModal
        isOpenModal={isOpenRemedyModal}
        dataModal={dataModal}
        closeRemedyModal={closeRemedyModal}
        sendRemedy={sendRemedy}
      />
    </>
  );
};

export default ManagePatient;
