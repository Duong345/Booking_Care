import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
// @ts-ignore
import Slider from 'react-slick';

import HomeHeader from '../../HomePage/HomeHeader';
import DoctorSchedule from '../Doctor/DoctorSchedule';
import DoctorExtraInfor from '../Doctor/DoctorExtraInfor';
import ProfileDoctor from '../Doctor/ProfileDoctor';
import {
  getAllDetailClinicById,
  getAllSpecialty,
  type IApiResponse,
} from '../../../services/userService';
import './DetailClinic.scss';

interface DoctorClinic {
  doctorId: string | number;
}

interface SpecialtyItem {
  id: string | number;
  name: string;
}

interface Clinic {
  id: string | number;
  name: string;
  descriptionHTML: string;
  doctorClinic: DoctorClinic[];
}

interface RootState {
  app: {
    language: string;
  };
}

const DetailClinic = () => {
  const { id } = useParams<{ id: string }>();
  const language = useSelector((state: RootState) => state.app.language);

  const [arrDoctorId, setArrDoctorId] = useState<(string | number)[]>([]);
  const [dataDetailClinic, setDataDetailClinic] = useState<Clinic | null>(null);
  const [specialties, setSpecialties] = useState<SpecialtyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const response = (await getAllDetailClinicById({
          id: Number(id),
        })) as unknown as IApiResponse<Clinic>;

        if (response?.errCode === 0 && response?.data) {
          setDataDetailClinic(response.data);

          const doctorIds: (string | number)[] = [];
          if (
            response.data.doctorClinic &&
            Array.isArray(response.data.doctorClinic)
          ) {
            response.data.doctorClinic.forEach((item) => {
              doctorIds.push(item.doctorId);
            });
          }
          setArrDoctorId(doctorIds);
        }
      } catch (err) {
        setError('Không thể tải dữ liệu phòng khám');
        setDataDetailClinic(null);
        setArrDoctorId([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    const loadSpecialties = async () => {
      try {
        const response = (await getAllSpecialty()) as unknown as IApiResponse<
          SpecialtyItem[]
        >;
        if (response?.errCode === 0 && response?.data) {
          setSpecialties(response.data);
        }
      } catch (err) {
        console.error('Failed to load specialties', err);
        setSpecialties([]);
      }
    };

    void loadSpecialties();
  }, []);

  if (loading) {
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
            {dataDetailClinic ? (
              <>
                <div className="clinic-name">{dataDetailClinic.name}</div>
                <div
                  className="clinic-description"
                  dangerouslySetInnerHTML={{
                    __html: dataDetailClinic.descriptionHTML || '',
                  }}
                />
              </>
            ) : (
              <p>Không có dữ liệu phòng khám</p>
            )}
          </div>

          {specialties.length > 0 && (
            <div className="search-sp-doctor">
              <label htmlFor="specialty-select">Chọn chuyên khoa:</label>
              <select
                id="specialty-select"
                onChange={(event) => {
                  const selectedId = event.target.value;
                  if (selectedId) {
                    navigate(`/detail-specialty/${selectedId}`);
                  }
                }}
                defaultValue=""
              >
                <option value="" disabled>
                  Chọn chuyên khoa
                </option>
                {specialties.map((specialty) => (
                  <option key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </option>
                ))}
              </select>
            </div>
          )}

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
              Không có bác sĩ nào trong phòng khám này
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default DetailClinic;
