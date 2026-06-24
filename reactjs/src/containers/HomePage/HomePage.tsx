import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeHeader from './HomeHeader';
import Specialty from './Section/Specialty';
import MedicalFacility from './Section/MedicalFacility';
import OutStandingDoctor from './Section/OutStandingDoctor';
import { getAllClinic, getAllSpecialty } from '../../services/userService';
import './HomePage.scss';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

interface SliderSettings {
  dots: boolean;
  infinite: boolean;
  speed: number;
  slidesToShow: number;
  slideToScroll: number;
}

interface QuickBookingItem {
  id: string | number;
  name: string;
  image?: string;
  address?: string;
}

interface ApiResponse<T> {
  errCode: number;
  data?: T;
  errMessage?: string;
}

type QuickBookingTab = 'specialty' | 'clinic';

const HomePage = () => {
  const navigate = useNavigate();
  const [isQuickBookingOpen, setIsQuickBookingOpen] = useState(false);
  const [activeBookingTab, setActiveBookingTab] =
    useState<QuickBookingTab>('specialty');
  const [specialties, setSpecialties] = useState<QuickBookingItem[]>([]);
  const [clinics, setClinics] = useState<QuickBookingItem[]>([]);
  const [bookingSearch, setBookingSearch] = useState('');
  const [isLoadingBookingData, setIsLoadingBookingData] = useState(false);
  const [bookingError, setBookingError] = useState('');

  const settings: SliderSettings = useMemo(
    () => ({
      dots: false,
      infinite: false,
      speed: 500,
      slidesToShow: 4,
      slideToScroll: 1,
    }),
    []
  );

  useEffect(() => {
    if (!isQuickBookingOpen || (specialties.length > 0 && clinics.length > 0)) {
      return;
    }

    let isMounted = true;

    const fetchQuickBookingData = async () => {
      setIsLoadingBookingData(true);
      setBookingError('');

      try {
        const [specialtyRes, clinicRes] = await Promise.all([
          getAllSpecialty() as unknown as Promise<
            ApiResponse<QuickBookingItem[]>
          >,
          getAllClinic() as unknown as Promise<ApiResponse<QuickBookingItem[]>>,
        ]);

        if (!isMounted) return;

        if (specialtyRes?.errCode === 0) {
          setSpecialties(specialtyRes.data || []);
        }

        if (clinicRes?.errCode === 0) {
          setClinics(clinicRes.data || []);
        }

        if (specialtyRes?.errCode !== 0 || clinicRes?.errCode !== 0) {
          setBookingError('Không tải được đầy đủ dữ liệu đặt lịch');
        }
      } catch (e) {
        if (isMounted) {
          setBookingError('Không tải được dữ liệu đặt lịch');
        }
      } finally {
        if (isMounted) {
          setIsLoadingBookingData(false);
        }
      }
    };

    fetchQuickBookingData();

    return () => {
      isMounted = false;
    };
  }, [clinics.length, isQuickBookingOpen, specialties.length]);

  const activeBookingItems = useMemo(() => {
    const source = activeBookingTab === 'specialty' ? specialties : clinics;
    const keyword = bookingSearch.trim().toLowerCase();

    if (!keyword) return source;

    return source.filter((item) =>
      `${item.name || ''} ${item.address || ''}`.toLowerCase().includes(keyword)
    );
  }, [activeBookingTab, bookingSearch, clinics, specialties]);

  const handleChooseBookingItem = useCallback(
    (item: QuickBookingItem) => {
      const route =
        activeBookingTab === 'specialty'
          ? `/detail-specialty/${item.id}`
          : `/detail-clinic/${item.id}`;

      setIsQuickBookingOpen(false);
      setBookingSearch('');
      navigate(route);
    },
    [activeBookingTab, navigate]
  );

  const closeQuickBookingModal = useCallback(() => {
    setIsQuickBookingOpen(false);
    setBookingSearch('');
  }, []);

  return (
    <div>
      <HomeHeader isShowBanner={true} />
      <Specialty settings={settings} />
      <MedicalFacility settings={settings} />
      <OutStandingDoctor settings={settings} />

      <button
        className="quick-booking-fab"
        onClick={() => setIsQuickBookingOpen(true)}
        aria-label="Mở đặt lịch khám"
      >
        <i className="far fa-calendar-check"></i>
        <span>Đặt Lịch</span>
      </button>

      {isQuickBookingOpen && (
        <div
          className="quick-booking-modal-overlay"
          onClick={closeQuickBookingModal}
        >
          <div
            className="quick-booking-modal"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="quick-booking-modal-header">
              <div>
                <h2>Đặt lịch khám</h2>
                <span>Chọn chuyên khoa hoặc cơ sở y tế để bắt đầu</span>
              </div>
              <button
                className="quick-booking-modal-close"
                onClick={closeQuickBookingModal}
                aria-label="Đóng đặt lịch"
              >
                ×
              </button>
            </div>

            <div className="quick-booking-tabs">
              <button
                className={activeBookingTab === 'specialty' ? 'active' : ''}
                onClick={() => setActiveBookingTab('specialty')}
              >
                <i className="fas fa-stethoscope"></i>
                Chuyên khoa
              </button>
              <button
                className={activeBookingTab === 'clinic' ? 'active' : ''}
                onClick={() => setActiveBookingTab('clinic')}
              >
                <i className="far fa-hospital"></i>
                Cơ sở y tế
              </button>
            </div>

            <div className="quick-booking-search">
              <i className="fas fa-search"></i>
              <input
                value={bookingSearch}
                onChange={(event) => setBookingSearch(event.target.value)}
                placeholder={
                  activeBookingTab === 'specialty'
                    ? 'Tìm chuyên khoa'
                    : 'Tìm cơ sở y tế'
                }
              />
            </div>

            <div className="quick-booking-modal-body">
              {isLoadingBookingData ? (
                <div className="quick-booking-state">Đang tải dữ liệu...</div>
              ) : bookingError ? (
                <div className="quick-booking-state error">{bookingError}</div>
              ) : activeBookingItems.length > 0 ? (
                <div className="quick-booking-grid">
                  {activeBookingItems.map((item) => (
                    <button
                      key={`${activeBookingTab}-${item.id}`}
                      className="quick-booking-card"
                      onClick={() => handleChooseBookingItem(item)}
                    >
                      <div
                        className="quick-booking-card-image"
                        style={{
                          backgroundImage: item.image
                            ? `url(${item.image})`
                            : 'none',
                        }}
                      >
                        {!item.image && <i className="far fa-hospital"></i>}
                      </div>
                      <div className="quick-booking-card-content">
                        <strong>{item.name}</strong>
                        {activeBookingTab === 'clinic' && item.address && (
                          <span>{item.address}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="quick-booking-state">
                  Không tìm thấy dữ liệu phù hợp
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
