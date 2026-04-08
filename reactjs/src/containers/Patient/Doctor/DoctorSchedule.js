import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import './DoctorSchedule.scss';
import moment from 'moment';
import localization from 'moment/locale/vi';
import { LANGUAGES } from '../../../utils';
import { getScheduleDoctorByDate } from '../../../services/userService';
import { FormattedMessage } from 'react-intl';
import BookingModal from './Modal/BookingModal';

const DoctorSchedule = ({ doctorIdFromParent }) => {
  const language = useSelector((state) => state.app.language);

  // State
  const [allDays, setAllDays] = useState([]);
  const [allAvailableTime, setAllAvailableTime] = useState([]);
  const [isOpenModalBooking, setIsOpenModalBooking] = useState(false);
  const [dataScheduleTimeModal, setDataScheduleTimeModal] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);

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

  // Handle booking time click
  const handleClickScheduleTime = useCallback((time) => {
    setDataScheduleTimeModal(time);
    setIsOpenModalBooking(true);
  }, []);

  // Handle booking success
  const handleBookingSuccess = useCallback((bookedTime) => {
    setAllAvailableTime((prev) =>
      prev.filter((item) => item.timeType !== bookedTime.timeType)
    );
  }, []);

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
                    return (
                      <button
                        key={index}
                        className={
                          language === LANGUAGES.VI ? 'btn-vie' : 'btn-en'
                        }
                        onClick={() => handleClickScheduleTime(item)}
                      >
                        {timeDisplay}
                      </button>
                    );
                  })}
                </div>
                <div className="book-free">
                  <span>
                    <FormattedMessage id="patient.detail-doctor.choose" />
                    <i className="far fa-hand-point-up"></i>
                    <FormattedMessage id="patient.detail-doctor.book-free" />
                  </span>
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
