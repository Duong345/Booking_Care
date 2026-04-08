import React, { useMemo } from 'react';
import './DayScheduleModal.scss';

interface DayScheduleModalData {
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

interface DayScheduleModalProps {
  patients: DayScheduleModalData[];
  onClose: () => void;
  onSelectTime: (patient: DayScheduleModalData) => void;
}

const DayScheduleModal: React.FC<DayScheduleModalProps> = ({
  patients,
  onClose,
  onSelectTime,
}) => {
  const validPatients = useMemo(() => {
    return Array.isArray(patients) && patients.length > 0 ? patients : [];
  }, [patients]);

  if (validPatients.length === 0) return null;

  return (
    <div className="day-schedule-modal-overlay" onClick={onClose}>
      <div className="day-schedule-modal" onClick={(e) => e.stopPropagation()}>
        <div className="day-schedule-modal-header">
          <div className="left">Danh sách khám bệnh</div>
          <div className="right" onClick={onClose}>
            <span>&times;</span>
          </div>
        </div>
        <div className="day-schedule-modal-body">
          <ul className="schedule-list">
            {validPatients.map((patient, index) => (
              <li
                key={index}
                className="schedule-item"
                onClick={() => onSelectTime(patient)}
              >
                <div className="time">{patient.time || 'N/A'}</div>
                <div className="patient-name">
                  {patient.patientName || 'N/A'}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DayScheduleModal;
