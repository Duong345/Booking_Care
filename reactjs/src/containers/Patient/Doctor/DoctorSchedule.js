import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import './DoctorSchedule.scss';
import moment from 'moment';
import localization from 'moment/locale/vi';
import { LANGUAGES } from '../../../utils';
import {
  getScheduleDoctorByDate,
  postPatientRebookCanceledAppointment,
} from '../../../services/userService';
import { FormattedMessage } from 'react-intl';
import { toast } from 'react-toastify';
import BookingModal from './Modal/BookingModal';

const DoctorSchedule = ({ doctorIdFromParent }) => {
  const language = useSelector((state) => state.app.language);

  // State
  const [allDays, setAllDays] = useState([]);
  const [allAvailableTime, setAllAvailableTime] = useState([]);
  const [isOpenModalBooking, setIsOpenModalBooking] = useState(false);
  const [dataScheduleTimeModal, setDataScheduleTimeModal] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [pendingRebook, setPendingRebook] = useState(null);
  const [isRebooking, setIsRebooking] = useState(false);

  // Capitalize first letter utility
  const capitalizeFirstLetter = useCallback((string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }, []);

  // Generate array of 7 days
  const getArrDays = useCallback(
    (lang) => {
      const days = [];
      for (let i = 0; i < 7; i++) {
        const obj = {};
        if (lang === LANGUAGES.VI) {
          if (i === 0) {
            const ddMM = moment(new Date()).format('DD/MM');
            obj.label = `Hôm nay - ${ddMM}`;
          } else {
            const labelVi = moment(new Date())
              .add(i, 'days')
              .format('dddd - DD/MM');
            obj.label = capitalizeFirstLetter(labelVi);
          }
        } else {
          if (i === 0) {
            const ddMM = moment(new Date()).format('DD/MM');
            obj.label = `Today - ${ddMM}`;
          } else {
            obj.label = moment(new Date())
              .add(i, 'days')
              .locale('en')
              .format('ddd - DD/MM');
          }
        }
        obj.value = moment(new Date()).add(i, 'days').startOf('day').valueOf();
        days.push(obj);
      }
      return days;
    },
    [capitalizeFirstLetter]
  );

  // Sort schedule times chronologically
  const sortAvailableTimes = useCallback((arr, lang) => {
    if (!arr || arr.length === 0) return [];

    const parseTimeValue = (timeStr) => {
      if (!timeStr) return 0;
      const m = timeStr.match(/(\d{1,2}):(\d{2})/);
      if (m) return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
      return 0;
    };

    const extractKeyNum = (key) => {
      if (!key) return null;
      const m = key.match(/(\d+)/);
      return m ? parseInt(m[0], 10) : null;
    };

    const copy = [...arr];
    copy.sort((a, b) => {
      const aNum = extractKeyNum(a.keyMap);
      const bNum = extractKeyNum(b.keyMap);
      if (aNum !== null && bNum !== null) return aNum - bNum;

      const aTime = parseTimeValue(
        lang === LANGUAGES.VI ? a.timeTypeData.valueVi : a.timeTypeData.valueEn
      );
      const bTime = parseTimeValue(
        lang === LANGUAGES.VI ? b.timeTypeData.valueVi : b.timeTypeData.valueEn
      );
      return aTime - bTime;
    });
    return copy;
  }, []);

  // Initialize days on component mount or language change
  useEffect(() => {
    const days = getArrDays(language);
    setAllDays(days);
    setSelectedDate(days[0].value);
  }, [language, getArrDays]);

  const loadPendingRebook = useCallback(() => {
    try {
      const rawRebook = sessionStorage.getItem('pendingRebookAppointment');
      if (!rawRebook) {
        setPendingRebook(null);
        return;
      }

      const parsedRebook = JSON.parse(rawRebook);
      if (
        parsedRebook?.bookingId &&
        String(parsedRebook.doctorId) === String(doctorIdFromParent)
      ) {
        setPendingRebook(parsedRebook);
      } else {
        setPendingRebook(null);
      }
    } catch {
      sessionStorage.removeItem('pendingRebookAppointment');
      setPendingRebook(null);
    }
  }, [doctorIdFromParent]);

  useEffect(() => {
    loadPendingRebook();

    const handlePendingRebookChanged = () => {
      loadPendingRebook();
    };

    window.addEventListener(
      'pendingRebookAppointmentChanged',
      handlePendingRebookChanged
    );

    return () => {
      window.removeEventListener(
        'pendingRebookAppointmentChanged',
        handlePendingRebookChanged
      );
    };
  }, [loadPendingRebook]);

  useEffect(() => {
    const handlePatientBookingChanged = (event) => {
      const detail = event.detail || {};
      if (
        detail.action !== 'cancel' ||
        String(detail.doctorId) !== String(doctorIdFromParent) ||
        String(detail.date) !== String(selectedDate)
      ) {
        return;
      }

      setAllAvailableTime((prev) =>
        prev.map((item) => {
          if (item.timeType !== detail.timeType) return item;

          const bookedCount = Math.max(
            (item.bookedCount || item.currentNumber || 1) - 1,
            0
          );

          return {
            ...item,
            bookedCount,
            currentNumber: bookedCount,
            isBooked: bookedCount > 0,
            isFull: bookedCount >= (item.maxNumber || 1),
          };
        })
      );
    };

    window.addEventListener('patientBookingChanged', handlePatientBookingChanged);

    return () => {
      window.removeEventListener(
        'patientBookingChanged',
        handlePatientBookingChanged
      );
    };
  }, [doctorIdFromParent, selectedDate]);

  // Fetch schedule when doctor ID or selected date changes
  useEffect(() => {
    let isMounted = true;

    const fetchSchedule = async () => {
      if (!doctorIdFromParent || selectedDate === null) {
        if (isMounted) setAllAvailableTime([]);
        return;
      }

      try {
        const res = await getScheduleDoctorByDate(
          doctorIdFromParent,
          selectedDate
        );
        if (isMounted && res && res.errCode === 0) {
          setAllAvailableTime(sortAvailableTimes(res.data || [], language));
        } else if (isMounted) {
          setAllAvailableTime([]);
        }
      } catch {
        if (isMounted) setAllAvailableTime([]);
      }
    };

    fetchSchedule();

    return () => {
      isMounted = false;
    };
  }, [doctorIdFromParent, selectedDate, language, sortAvailableTimes]);

  // Handle date selection change
  const handleOnChangeSelect = useCallback(async (event) => {
    const newDate = event.target.value;
    setSelectedDate(newDate);
  }, []);

  // Handle booking success
  const handleBookingSuccess = useCallback((bookedTime) => {
    setAllAvailableTime((prev) =>
      prev.map((item) => {
        if (item.timeType !== bookedTime.timeType) return item;

        const bookedCount = (item.bookedCount || item.currentNumber || 0) + 1;
        return {
          ...item,
          bookedCount,
          currentNumber: bookedCount,
          isBooked: true,
          isFull: true,
        };
      })
    );
  }, []);

  const buildTimeString = useCallback(
    (time) => {
      const timeText =
        language === LANGUAGES.VI
          ? time.timeTypeData.valueVi
          : time.timeTypeData.valueEn;
      const dateText =
        language === LANGUAGES.VI
          ? moment.unix(+time.date / 1000).format('dddd - DD/MM/YYYY')
          : moment.unix(+time.date / 1000).locale('en').format('ddd - MM/DD/YYYY');

      return `${timeText} - ${dateText}`;
    },
    [language]
  );

  const buildDoctorName = useCallback(
    (time) => {
      if (!time?.doctorData) return '';

      return language === LANGUAGES.VI
        ? `${time.doctorData.lastName} ${time.doctorData.firstName}`.trim()
        : `${time.doctorData.firstName} ${time.doctorData.lastName}`.trim();
    },
    [language]
  );

  // Handle booking time click
  const handleClickScheduleTime = useCallback(
    async (time) => {
      if (time?.isBooked || time?.isFull || isRebooking) return;

      if (pendingRebook?.bookingId) {
        setIsRebooking(true);
        try {
          const res = await postPatientRebookCanceledAppointment({
            bookingId: pendingRebook.bookingId,
            patientId: pendingRebook.patientId,
            email: pendingRebook.email,
            doctorId: time.doctorId,
            date: time.date,
            timeType: time.timeType,
            language,
            timeString: buildTimeString(time),
            doctorName: buildDoctorName(time),
          });

          if (res && res.errCode === 0) {
            sessionStorage.removeItem('pendingRebookAppointment');
            setPendingRebook(null);
            handleBookingSuccess(time);
            toast.success('Đã gửi email xác nhận lịch mới');
          } else {
            toast.error(res?.errMessage || 'Không thể đặt lại lịch');
          }
        } catch {
          toast.error('Không thể đặt lại lịch');
        } finally {
          setIsRebooking(false);
        }
        return;
      }

      setDataScheduleTimeModal(time);
      setIsOpenModalBooking(true);
    },
    [
      buildDoctorName,
      buildTimeString,
      handleBookingSuccess,
      isRebooking,
      language,
      pendingRebook,
    ]
  );

  // Close booking modal
  const closeBookingModal = useCallback(() => {
    setIsOpenModalBooking(false);
  }, []);

  return (
    <>
      <div className="doctor-schedule-container">
        <div className="all-schedule">
          <select value={selectedDate || ''} onChange={handleOnChangeSelect}>
            {allDays.map((item, index) => (
              <option value={item.value} key={index}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div className="all-available-time">
          <div className="text-calendar">
            <i className="fas fa-calendar-alt">
              <span>
                <FormattedMessage id="patient.detail-doctor.schedule" />
              </span>
            </i>
          </div>
          <div className="time-content">
            {allAvailableTime && allAvailableTime.length > 0 ? (
              <>
                <div className="time-content-btns">
                  {allAvailableTime.map((item, index) => {
                    const timeDisplay =
                      language === LANGUAGES.VI
                        ? item.timeTypeData.valueVi
                        : item.timeTypeData.valueEn;
                    const isDisabled = item.isBooked || item.isFull || isRebooking;
                    return (
                      <button
                        key={index}
                        className={`${language === LANGUAGES.VI ? 'btn-vie' : 'btn-en'} ${
                          isDisabled ? 'btn-booked' : ''
                        }`}
                        disabled={isDisabled}
                        onClick={() => handleClickScheduleTime(item)}
                        title={
                          item.isBooked || item.isFull
                            ? 'Khung giờ này đã được đặt'
                            : ''
                        }
                      >
                        {isRebooking ? 'Đang xử lý...' : timeDisplay}
                      </button>
                    );
                  })}
                </div>
                <div className="book-free">
                  {pendingRebook ? (
                    <span className="rebook-hint">
                      <i className="far fa-calendar-check"></i>
                      Chọn khung giờ mới để gửi email xác nhận đặt lại lịch
                    </span>
                  ) : (
                    <span>
                      <FormattedMessage id="patient.detail-doctor.choose" />
                      <i className="far fa-hand-point-up"></i>
                      <FormattedMessage id="patient.detail-doctor.book-free" />
                    </span>
                  )}
                </div>
              </>
            ) : (
              <div className="no-schedule">
                <FormattedMessage id="patient.detail-doctor.no-schedule" />
              </div>
            )}
          </div>
        </div>
      </div>
      <BookingModal
        isOpenModal={isOpenModalBooking}
        closeBookingClose={closeBookingModal}
        dataTime={dataScheduleTimeModal}
        onBookingSuccess={handleBookingSuccess}
      />
    </>
  );
};

export default DoctorSchedule;
