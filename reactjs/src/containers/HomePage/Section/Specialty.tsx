import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// @ts-ignore
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import {
  getAllSpecialty,
  type IApiResponse,
} from '../../../services/userService';

interface SpecialtyItem {
  id: string | number;
  name: string;
  image: string;
}

interface SliderSettings {
  [key: string]: any;
}

interface Props {
  settings?: SliderSettings;
}

const Specialty = ({ settings = {} }: Props) => {
  const navigate = useNavigate();

  const [dataSpecialty, setDataSpecialty] = useState<SpecialtyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = (await getAllSpecialty()) as unknown as IApiResponse<
          SpecialtyItem[]
        >;

        if (response?.errCode === 0 && response?.data) {
          setDataSpecialty(response.data);
        } else {
          setDataSpecialty([]);
        }
      } catch (err) {
        setError('Không thể tải dữ liệu chuyên khoa');
        setDataSpecialty([]);
        console.error('Error fetching specialties:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleViewDetailSpecialty = (specialty: SpecialtyItem) => {
    navigate(`/detail-specialty/${specialty.id}`);
  };

  const visibleSpecialties = useMemo(() => {
    return dataSpecialty.slice(0, 10);
  }, [dataSpecialty]);

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

  const renderSpecialtyCard = (specialty: SpecialtyItem) => (
    <div
      key={specialty.id}
      className="section-customize specialty-child"
      onClick={() => handleViewDetailSpecialty(specialty)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleViewDetailSpecialty(specialty);
        }
      }}
    >
      <div
        className="bg-image section-specialty"
        style={{ backgroundImage: `url(${specialty.image})` }}
        aria-label={specialty.name}
      />
      <div className="specialty-name">{specialty.name}</div>
    </div>
  );

  return (
    <section className="section-share section-specialty">
      <div className="section-container">
        <div className="section-header">
          <span className="title-section">Chuyên khoa phổ biến</span>
          <button
            className="btn-section"
            onClick={handleOpenModal}
            disabled={loading || dataSpecialty.length === 0}
          >
            Xem thêm
          </button>
        </div>

        <div className="section-body">
          {loading ? (
            <div className="loading-state">Đang tải...</div>
          ) : error ? (
            <div className="error-state">{error}</div>
          ) : visibleSpecialties.length > 0 ? (
            <Slider {...settings}>
              {visibleSpecialties.map((specialty) =>
                renderSpecialtyCard(specialty)
              )}
            </Slider>
          ) : (
            <div className="empty-state">Không có chuyên khoa nào</div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="home-section-modal-overlay" onClick={handleCloseModal}>
          <div
            className="home-section-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="specialty-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="home-section-modal-header">
              <div>
                <h2 id="specialty-modal-title">Tất cả chuyên khoa</h2>
                <span>{dataSpecialty.length} chuyên khoa</span>
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
              {dataSpecialty.length === 0 ? (
                <div className="empty-state">Không có chuyên khoa nào</div>
              ) : (
                <div className="home-section-modal-grid">
                  {dataSpecialty.map((specialty) =>
                    renderSpecialtyCard(specialty)
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

export default Specialty;
