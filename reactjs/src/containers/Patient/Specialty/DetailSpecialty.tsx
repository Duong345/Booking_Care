import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
// @ts-ignore
import Slider from 'react-slick';

import HomeHeader from '../../HomePage/HomeHeader';
import DoctorSchedule from '../Doctor/DoctorSchedule';
import DoctorExtraInfor from '../Doctor/DoctorExtraInfor';
import ProfileDoctor from '../Doctor/ProfileDoctor';
import {
  getAllDetailSpecialtyById,
  getAllCodeService,
  type IApiResponse,
} from '../../../services/userService';
import { LANGUAGES } from '../../../utils';
import './DetailSpecialty.scss';

interface DoctorSpecialty {
  doctorId: string | number;
}

interface Specialty {
  id: string | number;
  name: string;
  descriptionHTML: string;
  doctorSpecialty: DoctorSpecialty[];
}

interface Province {
  createdAt: string | null;
  keyMap: string;
  type: string;
  valueEn: string;
  valueVi: string;
}

interface TimeSlot {
  createdAt: string | null;
  keyMap: string;
  type: string;
  valueEn: string;
  valueVi: string;
}

interface RootState {
  app: {
    language: string;
  };
}

const DetailSpecialty = () => {
  const { id } = useParams<{ id: string }>();
  const language = useSelector((state: RootState) => state.app.language);

  const [arrDoctorId, setArrDoctorId] = useState<(string | number)[]>([]);
  const [dataDetailSpecialty, setDataDetailSpecialty] =
    useState<Specialty | null>(null);
  const [listProvince, setListProvince] = useState<Province[]>([]);
  const [listTime, setListTime] = useState<TimeSlot[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('ALL');
  const [selectedTimeType, setSelectedTimeType] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateDoctorsFromSpecialty = (specialtyData: Specialty) => {
    const doctorIds: (string | number)[] = [];
    if (
      specialtyData.doctorSpecialty &&
      Array.isArray(specialtyData.doctorSpecialty)
    ) {
      specialtyData.doctorSpecialty.forEach((item) => {
        doctorIds.push(item.doctorId);
      });
    }
    setArrDoctorId(doctorIds);
  };

  const fetchSpecialtyWithFilters = async (
    location: string,
    timeType: string,
    errorMessage: string
  ) => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const response = (await getAllDetailSpecialtyById({
        id: Number(id),
        location,
        timeType,
      })) as unknown as IApiResponse<Specialty>;

      if (response?.errCode === 0 && response?.data) {
        setDataDetailSpecialty(response.data);
        updateDoctorsFromSpecialty(response.data);
      }
    } catch (err) {
      setError(errorMessage);
      setArrDoctorId([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const [specialtyRes, provinceRes, timeRes] = await Promise.all([
          getAllDetailSpecialtyById({
            id: Number(id),
            location: 'ALL',
            timeType: 'ALL',
          }) as Promise<unknown>,
          getAllCodeService('PROVINCE') as Promise<unknown>,
          getAllCodeService('TIME') as Promise<unknown>,
        ]);

        const specialtyData =
          specialtyRes as unknown as IApiResponse<Specialty>;
        const provinceData = provinceRes as unknown as IApiResponse<Province[]>;
        const timeData = timeRes as unknown as IApiResponse<TimeSlot[]>;

        if (specialtyData?.errCode === 0 && specialtyData?.data) {
          setDataDetailSpecialty(specialtyData.data);
          updateDoctorsFromSpecialty(specialtyData.data);
        }

        if (provinceData?.errCode === 0 && provinceData?.data) {
          let provinces = [...provinceData.data];
          if (Array.isArray(provinces)) {
            provinces.unshift({
              createdAt: null,
              keyMap: 'ALL',
              type: 'PROVINCE',
              valueEn: 'All',
              valueVi: 'Toàn quốc',
            });
            setListProvince(provinces);
          }
        }

        if (timeData?.errCode === 0 && timeData?.data) {
          let times = [...timeData.data];
          if (Array.isArray(times)) {
            times.unshift({
              createdAt: null,
              keyMap: 'ALL',
              type: 'TIME',
              valueEn: 'All time slots',
              valueVi: 'Tất cả khung giờ',
            });
            setListTime(times);
          }
        }
      } catch (err) {
        setError('Không thể tải dữ liệu chuyên khoa');
        setDataDetailSpecialty(null);
        setArrDoctorId([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Handle location filter change
  const handleOnChangeLocation = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const location = event.target.value;
    setSelectedLocation(location);
    await fetchSpecialtyWithFilters(
      location,
      selectedTimeType,
      'Không thể tải dữ liệu theo địa điểm'
    );
  };

  const handleOnChangeTimeType = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const timeType = event.target.value;
    setSelectedTimeType(timeType);
    await fetchSpecialtyWithFilters(
      selectedLocation,
      timeType,
      'Không thể tải dữ liệu theo khung giờ'
    );
  };

  if (loading && !dataDetailSpecialty) {
    return (
      <>
        <HomeHeader />
        <div className="detail-specialty-container">
          <div className="detail-specialty-body">
            <p>Đang tải...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <HomeHeader />
        <div className="detail-specialty-container">
          <div className="detail-specialty-body">
            <p className="error-message">{error}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <HomeHeader />
      <div className="detail-specialty-container">
        <div className="detail-specialty-body">
          <div className="description-specialty">
            {dataDetailSpecialty ? (
              <div
                className="specialty-description"
                dangerouslySetInnerHTML={{
                  __html: dataDetailSpecialty.descriptionHTML || '',
                }}
              />
            ) : (
              <p>Không có dữ liệu chuyên khoa</p>
            )}
          </div>

          <div className="search-sp-doctor">
            <div className="filter-control">
              <label>Tỉnh thành</label>
              <select
                value={selectedLocation}
                onChange={handleOnChangeLocation}
              >
                {listProvince.length > 0 ? (
                  listProvince.map((item) => (
                    <option key={item.keyMap} value={item.keyMap}>
                      {language === LANGUAGES.VI ? item.valueVi : item.valueEn}
                    </option>
                  ))
                ) : (
                  <option value="ALL">Đang tải...</option>
                )}
              </select>
            </div>
            <div className="filter-control">
              <label>Khung giờ</label>
              <select
                value={selectedTimeType}
                onChange={handleOnChangeTimeType}
              >
                {listTime.length > 0 ? (
                  listTime.map((item) => (
                    <option key={item.keyMap} value={item.keyMap}>
                      {language === LANGUAGES.VI ? item.valueVi : item.valueEn}
                    </option>
                  ))
                ) : (
                  <option value="ALL">Đang tải...</option>
                )}
              </select>
            </div>
          </div>

          {arrDoctorId.length > 0 ? (
            arrDoctorId.map((doctorId) => (
              <div className="each-doctor" key={doctorId}>
                <div className="dt-content-left">
                  <div className="profile-doctor">
                    <ProfileDoctor
                      doctorId={doctorId}
                      isShowDescriptionDoctor={true}
                      isShowLinkDetail={true}
                      isShowPrice={false}
                    />
                  </div>
                </div>
                <div className="dt-content-right">
                  <div className="doctor-schedule">
                    <DoctorSchedule doctorIdFromParent={doctorId} />
                  </div>
                  <div className="doctor-extra-infor">
                    <DoctorExtraInfor doctorIdFromParent={doctorId} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="no-doctors">
              Không có bác sĩ nào cho chuyên khoa này
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default DetailSpecialty;
