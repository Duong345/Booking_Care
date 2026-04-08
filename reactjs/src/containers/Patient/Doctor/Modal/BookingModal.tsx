import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Modal } from 'reactstrap';
import Select from 'react-select';
import { toast } from 'react-toastify';
import moment from 'moment';
import _ from 'lodash';

import ProfileDoctor from '../ProfileDoctor';
import DatePicker from '../../../../components/Input/DatePicker';
import { fetchGenderStart } from '../../../../store/actions';
import { postPatientBookAppointment } from '../../../../services/userService';
import { LANGUAGES } from '../../../../utils';
import './BookingModal.scss';

interface GenderOption {
  value: string;
  label: string;
}

interface Gender {
  keyMap: string;
  valueVi: string;
  valueEn: string;
}

interface TimeTypeData {
  valueVi: string;
  valueEn: string;
}

interface DoctorData {
  firstName: string;
  lastName: string;
}

interface BookingData {
  doctorId: string | number;
  timeType: string;
  date: number;
  timeTypeData: TimeTypeData;
  doctorData: DoctorData;
}

interface FormData {
  fullName: string;
  phoneNumber: string;
  email: string;
  address: string;
  reason: string;
  birthday: string;
  selectedGender: GenderOption | null;
  doctorId: string | number;
  genders: GenderOption[];
  timeType: string;
}

interface RootState {
  app: {
    language: string;
  };
  admin: {
    genders: Gender[];
  };
  user: {
    userInfo?: {
      email?: string;
    };
  };
}

interface BookingModalProps {
  isOpenModal: boolean;
  closeBookingClose: () => void;
  dataTime?: BookingData;
  onBookingSuccess?: (dataTime: BookingData) => void;
}

const BookingModal = ({
  isOpenModal,
  closeBookingClose,
  dataTime,
  onBookingSuccess,
}: BookingModalProps) => {
  const dispatch = useDispatch();
  const language = useSelector((state: RootState) => state.app.language);
  const gendersData = useSelector((state: RootState) => state.admin.genders);
  const userInfo = useSelector((state: RootState) => state.user.userInfo);

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phoneNumber: '',
    email: '',
    address: '',
    reason: '',
    birthday: '',
    selectedGender: null,
    doctorId: '',
    genders: [],
    timeType: '',
  });

  // Build gender options based on language
  const genderOptions = useMemo(() => {
    const result: GenderOption[] = [];
    if (gendersData && gendersData.length > 0) {
      gendersData.forEach((item) => {
        result.push({
          label: language === LANGUAGES.VI ? item.valueVi : item.valueEn,
          value: item.keyMap,
        });
      });
    }
    return result;
  }, [gendersData, language]);

  // Initialize data on mount
  useEffect(() => {
    dispatch(fetchGenderStart() as any);

    // Load patient profile from localStorage
    const savedProfile = localStorage.getItem('patientProfile');
    if (savedProfile) {
      try {
        const profileData = JSON.parse(savedProfile);
        const genderValue = profileData.gender
          ? { value: profileData.gender, label: '' }
          : null;

        setFormData((prev) => ({
          ...prev,
          fullName: `${profileData.firstName} ${profileData.lastName}`.trim(),
          phoneNumber: profileData.phoneNumber || '',
          address: profileData.address || '',
          selectedGender: genderValue,
        }));
      } catch (e) {}
    }

    // Load email from userInfo if available
    if (userInfo?.email) {
      setFormData((prev) => ({
        ...prev,
        email: userInfo.email || '',
      }));
    }
  }, [dispatch, userInfo]);

  // Update genders when language changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      genders: genderOptions,
    }));
  }, [genderOptions]);

  // Update doctorId and timeType when dataTime changes
  useEffect(() => {
    if (dataTime && !_.isEmpty(dataTime)) {
      setFormData((prev) => ({
        ...prev,
        doctorId: dataTime.doctorId,
        timeType: dataTime.timeType,
      }));
    }
  }, [dataTime]);

  // Build formatted time booking
  const timeBookingString = useCallback(() => {
    if (!dataTime || _.isEmpty(dataTime)) return '';

    const time =
      language === LANGUAGES.VI
        ? dataTime.timeTypeData.valueVi
        : dataTime.timeTypeData.valueEn;
    const date =
      language === LANGUAGES.VI
        ? moment.unix(+dataTime.date / 1000).format('dddd - DD/MM/YYYY')
        : moment
            .unix(+dataTime.date / 1000)
            .locale('en')
            .format('ddd - MM/DD/YYYY');

    return `${time} - ${date}`;
  }, [dataTime, language]);

  // Build doctor name
  const doctorNameString = useCallback(() => {
    if (!dataTime || _.isEmpty(dataTime)) return '';

    return language === LANGUAGES.VI
      ? `${dataTime.doctorData.lastName} ${dataTime.doctorData.firstName}`
      : `${dataTime.doctorData.firstName} ${dataTime.doctorData.lastName}`;
  }, [dataTime, language]);

  // Handle input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof FormData) => {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: e.target.value,
      }));
    },
    []
  );

  // Handle date change
  const handleDateChange = useCallback((date: Date[]) => {
    setFormData((prev) => ({
      ...prev,
      birthday: date[0] ? date[0].toISOString() : '',
    }));
  }, []);

  // Handle gender select change
  const handleGenderChange = useCallback(
    (selectOption: GenderOption | null) => {
      setFormData((prev) => ({
        ...prev,
        selectedGender: selectOption,
      }));
    },
    []
  );

  // Handle confirm booking
  const handleConfirmBooking = useCallback(async () => {
    if (!formData.selectedGender) {
      toast.error('Please select gender');
      return;
    }

    if (!formData.fullName || !formData.phoneNumber || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const date = new Date(formData.birthday).getTime();
      const timeString = timeBookingString();
      const doctorName = doctorNameString();

      const res = (await postPatientBookAppointment({
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        address: formData.address,
        reason: formData.reason,
        date: dataTime?.date,
        birthday: date,
        selectedGender: formData.selectedGender.value,
        doctorId: formData.doctorId,
        timeType: formData.timeType,
        language,
        timeString,
        doctorName,
      })) as unknown as { errCode: number };

      if (res?.errCode === 0) {
        toast.success('Booking a new appointment succeed');
        closeBookingClose();
        if (onBookingSuccess && dataTime) {
          onBookingSuccess(dataTime);
        }
      } else {
        toast.error('Booking a new appointment error');
      }
    } catch (error) {
      console.log('Booking error:', error);
      toast.error('Booking a new appointment error');
    }
  }, [
    formData,
    dataTime,
    language,
    timeBookingString,
    doctorNameString,
    closeBookingClose,
    onBookingSuccess,
  ]);

  const doctorId = useMemo(() => {
    if (dataTime && !_.isEmpty(dataTime)) {
      return dataTime.doctorId;
    }
    return '';
  }, [dataTime]);

  return (
    <Modal
      isOpen={isOpenModal}
      className="booking-modal-container"
      size="lg"
      centered
    >
      <div className="booking-modal-content">
        {/* Header */}
        <div className="booking-modal-header">
          <span className="left">
            <FormattedMessage id="patient.booking-modal.title" />
          </span>
          <span className="right" onClick={closeBookingClose}>
            <i className="fas fa-times"></i>
          </span>
        </div>

        {/* Body */}
        <div className="booking-modal-body">
          <div className="doctor-infor">
            <ProfileDoctor
              doctorId={doctorId}
              isShowDescriptionDoctor={false}
              dataTime={dataTime}
              isShowLinkDetail={false}
              isShowPrice={true}
            />
          </div>

          <div className="row">
            {/* Full Name */}
            <div className="col-6 form-group">
              <label>
                <FormattedMessage id="patient.booking-modal.fullName" />
              </label>
              <input
                className="form-control"
                value={formData.fullName}
                onChange={(e) => handleInputChange(e, 'fullName')}
              />
            </div>

            {/* Phone Number */}
            <div className="col-6 form-group">
              <label>
                <FormattedMessage id="patient.booking-modal.phoneNumber" />
              </label>
              <input
                className="form-control"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange(e, 'phoneNumber')}
              />
            </div>

            {/* Email */}
            <div className="col-6 form-group">
              <label>
                <FormattedMessage id="patient.booking-modal.email" />
              </label>
              <input
                className="form-control"
                value={formData.email}
                onChange={(e) => handleInputChange(e, 'email')}
              />
            </div>

            {/* Address */}
            <div className="col-6 form-group">
              <label>
                <FormattedMessage id="patient.booking-modal.address" />
              </label>
              <input
                className="form-control"
                value={formData.address}
                onChange={(e) => handleInputChange(e, 'address')}
              />
            </div>

            {/* Reason */}
            <div className="col-12 form-group">
              <label>
                <FormattedMessage id="patient.booking-modal.reason" />
              </label>
              <input
                className="form-control"
                value={formData.reason}
                onChange={(e) => handleInputChange(e, 'reason')}
              />
            </div>

            {/* Birthday */}
            <div className="col-6 form-group">
              <label>
                <FormattedMessage id="patient.booking-modal.birthday" />
              </label>
              <DatePicker
                className="form-control"
                value={formData.birthday}
                onChange={handleDateChange}
              />
            </div>

            {/* Gender */}
            <div className="col-6 form-group">
              <label>
                <FormattedMessage id="patient.booking-modal.gender" />
              </label>
              <Select
                value={formData.selectedGender}
                onChange={handleGenderChange}
                options={formData.genders}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="booking-modal-footer">
          <button
            className="btn-booking-confirm"
            onClick={handleConfirmBooking}
          >
            <FormattedMessage id="patient.booking-modal.btnConfirm" />
          </button>
          <button className="btn-booking-cancel" onClick={closeBookingClose}>
            <FormattedMessage id="patient.booking-modal.btnCancel" />
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default BookingModal;
