import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FormattedMessage } from 'react-intl';
// @ts-ignore
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';

import { LANGUAGES, CommonUtils } from '../../utils';
import * as actions from '../../store/actions';
import './PatientProfile.scss';

interface Gender {
  keyMap: string;
  valueVi: string;
  valueEn: string;
}

interface UserInfo {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  phonenumber?: string;
  address?: string;
  gender?: string;
  image?: string;
}

interface ProfileFormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  gender: string;
  avatar: string;
  previewImgURL: string;
  email: string;
}

interface RootState {
  admin: {
    genders: Gender[];
  };
  app: {
    language: string;
  };
  user: {
    userInfo: UserInfo;
  };
}

const PatientProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const genderRedux = useSelector((state: RootState) => state.admin.genders);
  const language = useSelector((state: RootState) => state.app.language);
  const userInfo = useSelector((state: RootState) => state.user.userInfo);

  // Local state
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    gender: '',
    avatar: '',
    previewImgURL: '',
    email: '',
  });

  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Initialize component - load user data and genders
  useEffect(() => {
    dispatch(actions.fetchGenderStart() as any);

    if (userInfo) {
      // Load from localStorage if exists and matches current user
      const savedProfile = localStorage.getItem('patientProfile');
      let loadedData = {
        firstName: userInfo.firstName || '',
        lastName: userInfo.lastName || '',
        phoneNumber: userInfo.phonenumber || '',
        address: userInfo.address || '',
        gender: userInfo.gender || '',
        avatar: userInfo.image || '',
        previewImgURL: userInfo.image || '',
        email: userInfo.email || '',
      };

      if (savedProfile) {
        try {
          const profileData = JSON.parse(savedProfile);
          if (profileData.email === userInfo.email) {
            loadedData = {
              firstName: profileData.firstName || userInfo.firstName || '',
              lastName: profileData.lastName || userInfo.lastName || '',
              phoneNumber:
                profileData.phoneNumber || userInfo.phonenumber || '',
              address: profileData.address || userInfo.address || '',
              gender: profileData.gender || userInfo.gender || '',
              avatar: profileData.avatar || userInfo.image || '',
              previewImgURL: profileData.previewImgURL || userInfo.image || '',
              email: userInfo.email || '',
            };
          }
        } catch (err) {
          console.error('Error parsing localStorage data:', err);
        }
      }

      setFormData(loadedData);
    }
  }, [userInfo, dispatch]);

  // Set default gender if not set
  useEffect(() => {
    if (genderRedux?.length > 0 && !formData.gender) {
      setFormData((prev) => ({
        ...prev,
        gender: genderRedux[0].keyMap,
      }));
    }
  }, [genderRedux]);

  // Handle image upload
  const handleImageChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        const base64 = await CommonUtils.getBase64(file);
        const objectUrl = URL.createObjectURL(file);
        setFormData((prev) => ({
          ...prev,
          previewImgURL: objectUrl,
          avatar: base64 as string,
        }));
        setError(null);
      } catch (err) {
        setError('Lỗi tải hình ảnh');
        console.error('Error loading image:', err);
      }
    },
    []
  );

  // Handle input change
  const handleInputChange = useCallback(
    (
      event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
      fieldName: string
    ) => {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: event.target.value,
      }));
      setError(null);
    },
    []
  );

  // Validate form
  const validateForm = (): boolean => {
    const fields = [
      { name: 'firstName', label: 'Tên' },
      { name: 'lastName', label: 'Họ' },
      { name: 'phoneNumber', label: 'Số điện thoại' },
      { name: 'address', label: 'Địa chỉ' },
    ];

    for (const field of fields) {
      if (!formData[field.name as keyof ProfileFormData]) {
        setError(`${field.label} là bắt buộc`);
        return false;
      }
    }

    // Validate phone number format
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      setError('Số điện thoại không hợp lệ (10-11 chữ số)');
      return false;
    }

    return true;
  };

  // Handle save profile
  const handleSaveProfile = useCallback(() => {
    if (!validateForm()) return;

    if (!userInfo?.id) {
      setError('Thông tin người dùng không hợp lệ');
      return;
    }

    dispatch(
      actions.editAUser({
        id: userInfo.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        phonenumber: formData.phoneNumber,
        gender: formData.gender,
        avatar: formData.avatar,
      }) as any
    );

    // Save to localStorage
    const profileData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: formData.phoneNumber,
      address: formData.address,
      gender: formData.gender,
      avatar: formData.avatar,
      previewImgURL: formData.previewImgURL,
      email: userInfo.email,
    };
    localStorage.setItem('patientProfile', JSON.stringify(profileData));

    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }, [formData, userInfo, dispatch]);

  // Handle go home
  const handleGoHome = useCallback(() => {
    navigate('/home');
  }, [navigate]);

  // Handle preview image
  const openPreviewImage = useCallback(() => {
    if (formData.previewImgURL) {
      setIsOpen(true);
    }
  }, [formData.previewImgURL]);

  return (
    <div className="patient-profile-container">
      <div className="patient-profile-content">
        <div className="patient-profile-header">
          <button
            className="btn-back"
            onClick={handleGoHome}
            aria-label="Go back"
          >
            <i className="fas fa-arrow-left"></i>
            <FormattedMessage id="patient.profile.back" />
          </button>
          <h2>
            <FormattedMessage id="patient.profile.title" />
          </h2>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success" role="alert">
            <FormattedMessage id="patient.profile.save-success" />
          </div>
        )}

        <div className="patient-profile-body">
          <div className="patient-profile-form">
            {/* Avatar Upload */}
            <div className="form-group">
              <label>
                <FormattedMessage id="manage-user.image" />
              </label>
              <div className="preview-img-container">
                <input
                  id="previewImg"
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                  aria-label="Upload avatar"
                />
                <label htmlFor="previewImg" className="label-upload">
                  <i className="fas fa-cloud-upload-alt"></i>
                  <FormattedMessage id="manage-user.upload" />
                </label>
                <div
                  className="preview-image"
                  style={{
                    backgroundImage: `url(${formData.previewImgURL})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                  onClick={openPreviewImage}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      openPreviewImage();
                    }
                  }}
                  aria-label="Preview image"
                />
              </div>
            </div>

            {/* First Name & Last Name */}
            <div className="row">
              <div className="col-6">
                <div className="form-group">
                  <label htmlFor="firstName">
                    <FormattedMessage id="manage-user.first-name" />
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    className="form-control"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange(e, 'firstName')}
                    placeholder="Nhập tên"
                    required
                  />
                </div>
              </div>
              <div className="col-6">
                <div className="form-group">
                  <label htmlFor="lastName">
                    <FormattedMessage id="manage-user.last-name" />
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    className="form-control"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange(e, 'lastName')}
                    placeholder="Nhập họ"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">Email (Tên đăng nhập)</label>
              <input
                id="email"
                type="email"
                className="form-control"
                value={formData.email}
                readOnly
              />
            </div>

            {/* Phone & Gender */}
            <div className="row">
              <div className="col-6">
                <div className="form-group">
                  <label htmlFor="phoneNumber">
                    <FormattedMessage id="manage-user.phone-number" />
                  </label>
                  <input
                    id="phoneNumber"
                    type="tel"
                    className="form-control"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange(e, 'phoneNumber')}
                    placeholder="Nhập số điện thoại"
                    required
                  />
                </div>
              </div>
              <div className="col-6">
                <div className="form-group">
                  <label htmlFor="gender">
                    <FormattedMessage id="manage-user.gender" />
                  </label>
                  <select
                    id="gender"
                    className="form-control"
                    value={formData.gender}
                    onChange={(e) => handleInputChange(e, 'gender')}
                    required
                  >
                    <option value="">-- Chọn giới tính --</option>
                    {genderRedux?.length > 0 &&
                      genderRedux.map((item) => (
                        <option key={item.keyMap} value={item.keyMap}>
                          {language === LANGUAGES.VI
                            ? item.valueVi
                            : item.valueEn}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="form-group">
              <label htmlFor="address">
                <FormattedMessage id="manage-user.address" />
              </label>
              <input
                id="address"
                type="text"
                className="form-control"
                value={formData.address}
                onChange={(e) => handleInputChange(e, 'address')}
                placeholder="Nhập địa chỉ"
                required
              />
            </div>

            {/* Save Button */}
            <div className="form-group button-group">
              <button className="btn btn-save" onClick={handleSaveProfile}>
                <i className="fas fa-save"></i>
                <FormattedMessage id="manage-user.save" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Lightbox Preview */}
      {isOpen && (
        <Lightbox
          mainSrc={formData.previewImgURL}
          onCloseRequest={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default PatientProfile;
