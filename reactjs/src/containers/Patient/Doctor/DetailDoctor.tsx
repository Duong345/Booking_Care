import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import HomeHeader from '../../HomePage/HomeHeader';
import './DetailDoctor.scss';
import { getDetailInforDoctor } from '../../../services/userService';
import { LANGUAGES } from '../../../utils';
import DoctorSchedule from './DoctorSchedule';
import DoctorExtraInfor from './DoctorExtraInfor';

interface PositionData {
  valueVi: string;
  valueEn: string;
}

interface Markdown {
  description: string;
  contentHTML: string;
}

interface DoctorDetail {
  id?: string | number;
  firstName?: string;
  lastName?: string;
  image?: string;
  positionData?: PositionData;
  Markdown?: Markdown;
}

interface ApiResponse<T> {
  errCode: number;
  data?: T;
}

interface RootState {
  app: {
    language: string;
  };
}

const DetailDoctor = () => {
  const { id } = useParams<{ id: string }>();
  const language = useSelector((state: RootState) => state.app.language);

  const [detailDoctor, setDetailDoctor] = useState<DoctorDetail>({});
  const [currentDoctorId, setCurrentDoctorId] = useState<string | number>(-1);

  // Fetch doctor details
  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        setCurrentDoctorId(id);
        try {
          const doctorId = parseInt(id, 10);
          const res = (await getDetailInforDoctor(
            doctorId
          )) as unknown as ApiResponse<DoctorDetail>;
          if (res?.errCode === 0 && res?.data) {
            setDetailDoctor(res.data);
          }
        } catch (error) {
          console.error('Error fetching doctor details:', error);
        }
      }
    };
    fetchData();
  }, [id]);

  // Memoize doctor name based on language
  const doctorName = useMemo(() => {
    if (!detailDoctor?.positionData) return '';

    if (language === LANGUAGES.VI) {
      return `${detailDoctor.positionData.valueVi}, ${detailDoctor.lastName} ${detailDoctor.firstName}`;
    }
    return `${detailDoctor.positionData.valueEn}, ${detailDoctor.firstName} ${detailDoctor.lastName}`;
  }, [detailDoctor, language]);

  return (
    <>
      <HomeHeader isShowBanner={false} />
      <div className="doctor-detail-container">
        {/* Doctor Introduction */}
        <div className="intro-doctor">
          <div
            className="content-left"
            style={{
              backgroundImage: `url(${detailDoctor?.image || ''})`,
            }}
          ></div>
          <div className="content-right">
            <div className="up">{doctorName}</div>
            <div className="down">
              {detailDoctor?.Markdown?.description && (
                <span>{detailDoctor.Markdown.description}</span>
              )}
            </div>
          </div>
        </div>

        {/* Schedule and Extra Info */}
        <div className="schedule-doctor">
          <div className="content-left">
            <DoctorSchedule doctorIdFromParent={currentDoctorId} />
          </div>
          <div className="content-right">
            <DoctorExtraInfor doctorIdFromParent={currentDoctorId} />
          </div>
        </div>

        {/* Detail Information */}
        <div className="detail-infor-doctor">
          {detailDoctor?.Markdown?.contentHTML && (
            <div
              dangerouslySetInnerHTML={{
                __html: detailDoctor.Markdown.contentHTML,
              }}
            />
          )}
        </div>

        {/* Comment Section */}
        <div className="comment-doctor"></div>
      </div>
    </>
  );
};

export default DetailDoctor;
