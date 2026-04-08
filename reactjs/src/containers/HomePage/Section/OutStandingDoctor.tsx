import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
// @ts-ignore
import Slider from 'react-slick';

import * as actions from '../../../store/actions';
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

  // Load top doctors on mount
  useEffect(() => {
    setLoading(true);
    try {
      dispatch(actions.fetchTopDoctor() as any);
    } catch (err) {
      setError('Không thể tải dữ liệu bác sĩ nổi bật');
      console.error('Error loading top doctors:', err);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  // Convert image to base64 format
  const formatImage = (image: string | { data: any } | undefined): string => {
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
  };

  // Get specialty name with fallback
  const getSpecialtyName = (doctor: Doctor): string => {
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
  };

  // Memoize formatted doctors to avoid unnecessary recalculations
  const formattedDoctors = useMemo(() => {
    return (topDoctorsRedux || []).map((doctor) => ({
      ...doctor,
      imageBase64: formatImage(doctor.image),
      nameVi: `${doctor.positionData?.valueVi || ''}, ${doctor.lastName} ${doctor.firstName}`,
      nameEn: `${doctor.positionData?.valueEn || ''}, ${doctor.firstName} ${doctor.lastName}`,
      specialty: getSpecialtyName(doctor),
    }));
  }, [topDoctorsRedux, language]);

  const handleViewDetailDoctor = (doctor: Doctor) => {
    navigate(`/detail-doctor/${doctor.id}`);
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
          <button className="btn-section">Xem thêm</button>
        </div>

        <div className="section-body">
          {loading || !formattedDoctors || formattedDoctors.length === 0 ? (
            <div className="loading-state">
              {loading ? 'Đang tải...' : 'Không có bác sĩ nào'}
            </div>
          ) : (
            <Slider {...settings}>
              {formattedDoctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="section-customize"
                  onClick={() => handleViewDetailDoctor(doctor)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
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
                      <div className="doctor-name">
                        {language === LANGUAGES.VI
                          ? doctor.nameVi
                          : doctor.nameEn}
                      </div>
                      <div className="doctor-specialty">{doctor.specialty}</div>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          )}
        </div>
      </div>
    </section>
  );
};

export default OutStandingDoctor;
