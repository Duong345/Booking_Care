import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
// @ts-ignore
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import {
  getAllSpecialty,
  type IApiResponse,
} from '../../../services/userService';

interface Specialty {
  id: string | number;
  name: string;
  image: string;
}

interface SliderSettings {
  [key: string]: any;
}

interface RootState {
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

const Specialty = ({ settings = {} }: Props) => {
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);

  const [dataSpecialty, setDataSpecialty] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = (await getAllSpecialty()) as unknown as IApiResponse<
          Specialty[]
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

  const handleViewDetailSpecialty = (specialty: Specialty) => {
    navigate(`/detail-specialty/${specialty.id}`);
  };

  return (
    <section className="section-share section-specialty">
      <div className="section-container">
        <div className="section-header">
          <span className="title-section">Chuyên khoa phổ biến</span>
          <button className="btn-section">Xem thêm</button>
        </div>

        <div className="section-body">
          {loading ? (
            <div className="loading-state">Đang tải...</div>
          ) : error ? (
            <div className="error-state">{error}</div>
          ) : dataSpecialty.length > 0 ? (
            <Slider {...settings}>
              {dataSpecialty.map((specialty) => (
                <div
                  key={specialty.id}
                  className="section-customize specialty-child"
                  onClick={() => handleViewDetailSpecialty(specialty)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
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
              ))}
            </Slider>
          ) : (
            <div className="empty-state">Không có chuyên khoa nào</div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Specialty;
