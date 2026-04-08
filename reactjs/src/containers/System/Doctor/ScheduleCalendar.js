import React, { useState } from "react";
import "./ScheduleCalendar.scss";

const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfWeek = (year, month) => {
  return new Date(year, month, 1).getDay();
};


const ScheduleCalendar = ({ year, month, today, calendarBookings = {}, onDayClick }) => {
  const [curYear, setCurYear] = useState(year);
  const [curMonth, setCurMonth] = useState(month);

  const daysInMonth = getDaysInMonth(curYear, curMonth);
  const firstDayOfWeek = getFirstDayOfWeek(curYear, curMonth);

  const weeks = [];
  let day = 1;

  for (let i = 0; i < 6; i++) {
    const week = [];
    for (let j = 0; j < 7; j++) {
      if ((i === 0 && j < firstDayOfWeek) || day > daysInMonth) {
        week.push(null);
      } else {
        week.push(day);
        day++;
      }
    }
    weeks.push(week);
    if (day > daysInMonth) break;
  }

  const weekDays = ["Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy", "Chủ nhật"];

  const handlePrevMonth = () => {
    if (curMonth === 0) {
      setCurMonth(11);
      setCurYear(curYear - 1);
    } else {
      setCurMonth(curMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (curMonth === 11) {
      setCurMonth(0);
      setCurYear(curYear + 1);
    } else {
      setCurMonth(curMonth + 1);
    }
  };

  // Xác định ngày có lịch
  const getDateKey = (d) => {
    if (!d) return null;
    const mm = (curMonth + 1).toString().padStart(2, '0');
    const dd = d.toString().padStart(2, '0');
    return `${curYear}-${mm}-${dd}`;
  };

  return (
    <div className="schedule-calendar">
      <div className="calendar-header">
        <button className="calendar-nav-btn" onClick={handlePrevMonth}>&lt; Tháng trước</button>
        <span style={{ margin: "0 16px" }}>{`Tháng ${curMonth + 1}, ${curYear}`}</span>
        <button className="calendar-nav-btn" onClick={handleNextMonth}>Tháng sau &gt;</button>
      </div>
      <table className="calendar-table">
        <thead>
          <tr>
            {weekDays.map((wd, idx) => (
              <th key={idx}>{wd}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, i) => (
            <tr key={i}>
              {week.map((d, j) => {
                const dateKey = getDateKey(d);
                const hasBooking = dateKey && calendarBookings[dateKey] && calendarBookings[dateKey].length > 0;
                return (
                  <td
                    key={j}
                    className={
                      curYear === year && curMonth === month && d === today
                        ? "calendar-today"
                        : hasBooking
                          ? "calendar-booked"
                          : "calendar-day"
                    }
                    style={{ cursor: hasBooking ? 'pointer' : 'default', position: 'relative' }}
                    onClick={() => hasBooking && onDayClick && onDayClick(dateKey)}
                  >
                    {d ? d : ""}
                    {hasBooking && <span className="calendar-booking-dot"></span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScheduleCalendar;
