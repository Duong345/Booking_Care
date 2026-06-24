import { useState, useEffect, useMemo, useCallback } from 'react';
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
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const visibleClinics = useMemo(() => {
    return dataClinics.slice(0, 10);
  }, [dataClinics]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  useEffect(() => {
    if (!isModalOpen) return;

    const originalOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseModal();
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen, handleCloseModal]);

  const renderClinicCard = (clinic: Clinic) => (
    <div
      key={clinic.id}
      className="section-customize clinic-child"
      onClick={() => handleViewDetailClinic(clinic)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
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
  );

  return (
    <section className="section-share section-medical-facility">
      <div className="section-container">
        <div className="section-header">
          <span className="title-section">Cơ sở y tế nổi bật</span>
          <button
            className="btn-section"
            onClick={handleOpenModal}
            disabled={loading || dataClinics.length === 0}
          >
            Xem thêm
          </button>
        </div>
        <div className="section-body">
          {loading ? (
            <div className="loading-state">Đang tải...</div>
          ) : error ? (
            <div className="error-state">{error}</div>
          ) : visibleClinics.length > 0 ? (
            <Slider {...settings}>
              {visibleClinics.map((clinic) => renderClinicCard(clinic))}
            </Slider>
          ) : (
            <div className="empty-state">Không có cơ sở y tế nào</div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="home-section-modal-overlay" onClick={handleCloseModal}>
          <div
            className="home-section-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="clinic-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="home-section-modal-header">
              <div>
                <h2 id="clinic-modal-title">Tất cả cơ sở y tế</h2>
                <span>{dataClinics.length} cơ sở y tế</span>
              </div>
              <button
                className="home-section-modal-close"
                onClick={handleCloseModal}
                aria-label="Đóng"
              >
                ×
              </button>
            </div>

            <div className="home-section-modal-body">
              {dataClinics.length === 0 ? (
                <div className="empty-state">Không có cơ sở y tế nào</div>
              ) : (
                <div className="home-section-modal-grid">
                  {dataClinics.map((clinic) => renderClinicCard(clinic))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default MedicalFacility;
