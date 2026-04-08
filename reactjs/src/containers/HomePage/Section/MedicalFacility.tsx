import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// @ts-ignore - react-slick doesn't have type definitions
import Slider from 'react-slick';
// @ts-ignore - react-slick doesn't have type definitions
import type { Settings } from 'react-slick';

import { getAllClinic, type IApiResponse } from '../../../services/userService';

interface Clinic {
  id: string | number;
  name: string;
  image: string;
}

interface Props {
  settings?: Settings;
}

const MedicalFacility = ({ settings = {} }: Props) => {
  const navigate = useNavigate();

  const [dataClinics, setDataClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClinicData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = (await getAllClinic()) as unknown as IApiResponse<
          Clinic[]
        >;

        if (response?.errCode === 0 && response?.data) {
          setDataClinics(response.data);
        } else {
          setDataClinics([]);
        }
      } catch (err) {
        setError('Không thể tải dữ liệu cơ sở y tế');
        setDataClinics([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClinicData();
  }, []);

  const handleViewDetailClinic = (clinic: Clinic) => {
    navigate(`/detail-clinic/${clinic.id}`);
  };

  return (
    <section className="section-share section-medical-facility">
      <div className="section-container">
        <div className="section-header">
          <span className="title-section">Cơ sở y tế nổi bật</span>
          <button className="btn-section">Xem thêm</button>
        </div>
        <div className="section-body">
          {loading ? (
            <div className="loading-state">Đang tải...</div>
          ) : error ? (
            <div className="error-state">{error}</div>
          ) : dataClinics.length > 0 ? (
            <Slider {...settings}>
              {dataClinics.map((clinic) => (
                <div
                  key={clinic.id}
                  className="section-customize clinic-child"
                  onClick={() => handleViewDetailClinic(clinic)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleViewDetailClinic(clinic);
                    }
                  }}
                >
                  <div
                    className="bg-image section-medical-facility"
                    style={{ backgroundImage: `url(${clinic.image})` }}
                    aria-label={clinic.name}
                  />
                  <div className="clinic-name">{clinic.name}</div>
                </div>
              ))}
            </Slider>
          ) : (
            <div className="empty-state">Không có cơ sở y tế nào</div>
          )}
        </div>
      </div>
    </section>
  );
};

export default MedicalFacility;
