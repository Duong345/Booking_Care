import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
// @ts-ignore
import Slider from 'react-slick';

import * as actions from '../../../store/actions';
import { getTopDoctorHomeService } from '../../../services/userService';
import { LANGUAGES } from '../../../utils';

interface SpecialtyData {
  nameVi?: string;
  nameEn?: string;
  name?: string;
}

interface DoctorInfo {
  specialtyData?: SpecialtyData;
}

interface Doctor {
  id: string | number;
  firstName: string;
  lastName: string;
  image?: string | { data: any };
  positionData: {
    valueVi: string;
    valueEn: string;
  };
  Doctor_Infor?: DoctorInfo;
  specialtyData?: SpecialtyData;
  specialty?: string;
}

interface FormattedDoctor extends Doctor {
  imageBase64: string;
  nameVi: string;
  nameEn: string;
  specialty: string;
}

interface SliderSettings {
  [key: string]: any;
}

interface RootState {
  admin: {
    topDoctors: Doctor[];
  };
  app: {
    language: string;
  };
  user: {
    isLoggedIn: boolean;
  };
}

interface Props {
  settings?: SliderSettings;
}

const OutStandingDoctor = ({ settings = {} }: Props) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const topDoctorsRedux = useSelector(
    (state: RootState) => state.admin.topDoctors
  );
  const language = useSelector((state: RootState) => state.app.language);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Load top doctors on mount
  useEffect(() => {
    setLoading(true);
    try {
      dispatch(actions.fetchTopDoctor(10) as any);
    } catch (err) {
      setError('Không thể tải dữ liệu bác sĩ nổi bật');
      console.error('Error loading top doctors:', err);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  // Convert image to base64 format
  const formatImage = useCallback((image: string | { data: any } | undefined): string => {
    if (!image) return '';

    // Handle object with data array
    if (typeof image === 'object' && 'data' in image) {
      try {
        const bytes = new Uint8Array(image.data);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);
        return `data:image/jpeg;base64,${base64}`;
      } catch (err) {
        console.error('Error converting image data:', err);
        return '';
      }
    }

    // Handle string
    if (typeof image === 'string') {
      if (image.startsWith('data')) {
        return image;
      }
      return `data:image/jpeg;base64,${image}`;
    }

    return '';
  }, []);

  // Get specialty name with fallback
  const getSpecialtyName = useCallback((doctor: Doctor): string => {
    if (doctor.Doctor_Infor?.specialtyData) {
      return language === LANGUAGES.VI
        ? doctor.Doctor_Infor.specialtyData.nameVi ||
            doctor.Doctor_Infor.specialtyData.name ||
            ''
        : doctor.Doctor_Infor.specialtyData.nameEn ||
            doctor.Doctor_Infor.specialtyData.name ||
            '';
    }

    if (doctor.specialtyData) {
      return language === LANGUAGES.VI
        ? doctor.specialtyData.nameVi || doctor.specialtyData.name || ''
        : doctor.specialtyData.nameEn || doctor.specialtyData.name || '';
    }

    return doctor.specialty || '';
  }, [language]);

  const buildFormattedDoctor = useCallback(
    (doctor: Doctor): FormattedDoctor => ({
      ...doctor,
      imageBase64: formatImage(doctor.image),
      nameVi: `${doctor.positionData?.valueVi || ''}, ${doctor.lastName} ${doctor.firstName}`,
      nameEn: `${doctor.positionData?.valueEn || ''}, ${doctor.firstName} ${doctor.lastName}`,
      specialty: getSpecialtyName(doctor),
    }),
    [formatImage, getSpecialtyName]
  );

  // Memoize formatted doctors to avoid unnecessary recalculations
  const formattedDoctors = useMemo(() => {
    return (topDoctorsRedux || []).map(buildFormattedDoctor);
  }, [topDoctorsRedux, buildFormattedDoctor]);

  const formattedAllDoctors = useMemo(() => {
    return (allDoctors || []).map(buildFormattedDoctor);
  }, [allDoctors, buildFormattedDoctor]);

  const handleViewDetailDoctor = (doctor: Doctor) => {
    navigate(`/detail-doctor/${doctor.id}`);
  };

  const handleViewMoreDoctors = async () => {
    setIsDoctorModalOpen(true);
    setModalLoading(true);
    setModalError(null);

    try {
      const res = (await getTopDoctorHomeService(
        'ALL'
      )) as unknown as { errCode: number; data?: Doctor[] };

      if (res && res.errCode === 0 && Array.isArray(res.data)) {
        setAllDoctors(res.data);
      } else {
        setModalError('Không thể tải toàn bộ danh sách bác sĩ');
      }
    } catch (err) {
      setModalError('Không thể tải toàn bộ danh sách bác sĩ');
      console.error('Error loading all doctors:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseDoctorModal = useCallback(() => {
    setIsDoctorModalOpen(false);
  }, []);

  useEffect(() => {
    if (!isDoctorModalOpen) return;

    const originalOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseDoctorModal();
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDoctorModalOpen, handleCloseDoctorModal]);

  const renderDoctorCard = (doctor: FormattedDoctor) => {
    const doctorDisplayName =
      language === LANGUAGES.VI ? doctor.nameVi : doctor.nameEn;

    return (
      <div
        key={doctor.id}
        className="section-customize"
        onClick={() => handleViewDetailDoctor(doctor)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleViewDetailDoctor(doctor);
          }
        }}
      >
        <div className="customize-border">
          <div className="outer-bg">
            <div
              className="bg-image section-outstanding-doctor"
              style={{
                backgroundImage: `url(${doctor.imageBase64})`,
              }}
              aria-label={`${doctor.firstName} ${doctor.lastName}`}
            />
          </div>
          <div className="position text-center">
            <div className="doctor-name">{doctorDisplayName}</div>
            <div className="doctor-specialty">{doctor.specialty}</div>
          </div>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <section className="section-share section-outstanding-doctor">
        <div className="section-container">
          <div className="error-state">{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-share section-outstanding-doctor">
      <div className="section-container">
        <div className="section-header">
          <span className="title-section">Bác sĩ nổi bật</span>
          <button
            className="btn-section"
            onClick={handleViewMoreDoctors}
            disabled={loading}
          >
            Xem thêm
          </button>
        </div>

        <div className="section-body">
          {loading || !formattedDoctors || formattedDoctors.length === 0 ? (
            <div className="loading-state">
              {loading ? 'Đang tải...' : 'Không có bác sĩ nào'}
            </div>
          ) : (
            <Slider {...settings}>
              {formattedDoctors.map((doctor) => renderDoctorCard(doctor))}
            </Slider>
          )}
        </div>
      </div>

      {isDoctorModalOpen && (
        <div
          className="outstanding-doctor-modal-overlay"
          onClick={handleCloseDoctorModal}
        >
          <div
            className="outstanding-doctor-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="outstanding-doctor-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="outstanding-doctor-modal-header">
              <div>
                <h2 id="outstanding-doctor-modal-title">Tất cả bác sĩ</h2>
                <span>{formattedAllDoctors.length} bác sĩ</span>
              </div>
              <button
                className="outstanding-doctor-modal-close"
                onClick={handleCloseDoctorModal}
                aria-label="Đóng"
              >
                ×
              </button>
            </div>

            <div className="outstanding-doctor-modal-body">
              {modalLoading ? (
                <div className="loading-state">Đang tải...</div>
              ) : modalError ? (
                <div className="error-state">{modalError}</div>
              ) : formattedAllDoctors.length === 0 ? (
                <div className="loading-state">Không có bác sĩ nào</div>
              ) : (
                <div className="outstanding-doctor-modal-grid">
                  {formattedAllDoctors.map((doctor) =>
                    renderDoctorCard(doctor)
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default OutStandingDoctor;
