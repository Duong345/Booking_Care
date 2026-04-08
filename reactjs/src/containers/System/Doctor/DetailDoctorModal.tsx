import React from 'react';
import './DetailDoctorModal.scss';
import moment from 'moment';

interface DetailPatient {
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

interface DetailDoctorModalProps {
  patient: DetailPatient | null;
  onClose: () => void;
  onCancel: (patient: DetailPatient) => void;
}

const DetailDoctorModal: React.FC<DetailDoctorModalProps> = ({
  patient,
  onClose,
  onCancel,
}) => {
  if (!patient) return null;

  const fullName =
    ((patient.firstName || '') + ' ' + (patient.lastName || '')).trim() ||
    'N/A';
  const formattedDateTime =
    patient.bookingDate && moment(patient.bookingDate).isValid()
      ? moment(patient.bookingDate).format('DD/MM/YYYY') +
        ' ' +
        (patient.time || '')
      : patient.time || 'N/A';

  return (
    <div className="detail-doctor-modal-overlay" onClick={onClose}>
      <div className="detail-doctor-modal" onClick={(e) => e.stopPropagation()}>
        <div className="detail-doctor-modal-header">
          <div className="left">Thông tin bệnh nhân</div>
          <div className="right" onClick={onClose}>
            <span>&times;</span>
          </div>
        </div>
        <div className="detail-doctor-modal-body">
          <div className="patient-info">
            <div className="info-row">
              <label>Họ tên:</label>
              <span>{fullName}</span>
            </div>
            <div className="info-row">
              <label>Email:</label>
              <span>{patient.email || 'N/A'}</span>
            </div>
            <div className="info-row">
              <label>Địa chỉ:</label>
              <span>{patient.address || 'N/A'}</span>
            </div>
            <div className="info-row">
              <label>Giới tính:</label>
              <span>{patient.gender || 'N/A'}</span>
            </div>
            <div className="info-row">
              <label>Thời gian:</label>
              <span>{formattedDateTime}</span>
            </div>
            <div className="info-row">
              <label>Lý do khám:</label>
              <span>{patient.reason || 'Không có'}</span>
            </div>
          </div>
        </div>
        <div className="detail-doctor-modal-footer">
          <button className="btn-cancel" onClick={() => onCancel(patient)}>
            Huỷ Lịch
          </button>
          <button className="btn-close" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailDoctorModal;
