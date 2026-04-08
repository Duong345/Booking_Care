import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { NumericFormat } from 'react-number-format';
import _ from 'lodash';
import moment from 'moment';
import {
  getProfileDoctorById,
  type IApiResponse,
} from '../../../services/userService';
import { LANGUAGES } from '../../../utils';
import './ProfileDoctor.scss';

interface ApiResponse<T> {
  errCode: number;
  data?: T;
}

interface PositionData {
  valueVi: string;
  valueEn: string;
}

interface PriceTypeData {
  valueVi: string | number;
  valueEn: string | number;
}

interface DoctorInfor {
  priceTypeData: PriceTypeData;
}

interface MarkdownData {
  description: string;
}

interface ProfileData {
  image?: string;
  firstName: string;
  lastName: string;
  positionData?: PositionData;
  Markdown?: MarkdownData;
  Doctor_Infor?: DoctorInfor;
}

interface TimeData {
  date: number;
  timeTypeData: {
    valueVi: string;
    valueEn: string;
  };
}

interface RootState {
  app: {
    language: string;
  };
}

interface ProfileDoctorProps {
  doctorId: string | number;
  isShowDescriptionDoctor?: boolean;
  dataTime?: TimeData;
  isShowPrice?: boolean;
  isShowLinkDetail?: boolean;
}

const ProfileDoctor = ({
  doctorId,
  isShowDescriptionDoctor = false,
  dataTime,
  isShowPrice = false,
  isShowLinkDetail = false,
}: ProfileDoctorProps) => {
  const language = useSelector((state: RootState) => state.app.language);
  const [dataProfile, setDataProfile] = useState<ProfileData>({
    firstName: '',
    lastName: '',
  });

  // Fetch doctor information
  const getInforDoctor = useCallback(async (id: string | number) => {
    let result: ProfileData = {
      firstName: '',
      lastName: '',
    };
    if (id) {
      const numId = typeof id === 'string' ? parseInt(id, 10) : id;
      const res = (await getProfileDoctorById(
        numId
      )) as unknown as ApiResponse<ProfileData>;
      if (res && res.errCode === 0 && res.data) {
        result = res.data;
      }
    }
    return result;
  }, []);

  // Load doctor data on mount and when doctorId changes
  useEffect(() => {
    const loadData = async () => {
      const data = await getInforDoctor(doctorId);
      setDataProfile(data);
    };
    loadData();
  }, [doctorId, getInforDoctor]);

  // Render time booking display
  const renderTimeBooking = useCallback(() => {
    if (dataTime && !_.isEmpty(dataTime)) {
      const time =
        language === LANGUAGES.VI
          ? dataTime.timeTypeData.valueVi
          : dataTime.timeTypeData.valueEn;
      const date =
        language === LANGUAGES.VI
          ? moment.unix(+dataTime.date / 1000).format('dddd - DD/MM/YYYY')
          : moment
              .unix(+dataTime.date / 1000)
              .locale('en')
              .format('ddd - MM/DD/YYYY');
      return (
        <>
          <div>
            {time} - {date}
          </div>
          <div>
            <FormattedMessage id="patient.booking-modal.priceBooking" />
          </div>
        </>
      );
    }
    return <></>;
  }, [dataTime, language]);

  // Compute doctor name based on language
  const doctorName = useMemo(() => {
    let nameVi = '';
    let nameEn = '';
    if (dataProfile && dataProfile.positionData) {
      nameVi = `${dataProfile.positionData.valueVi}, ${dataProfile.lastName} ${dataProfile.firstName}`;
      nameEn = `${dataProfile.positionData.valueEn}, ${dataProfile.firstName} ${dataProfile.lastName}`;
    }
    return language === LANGUAGES.VI ? nameVi : nameEn;
  }, [dataProfile, language]);

  // Compute background image URL
  const backgroundImageUrl = useMemo(
    () => `url(${dataProfile && dataProfile.image ? dataProfile.image : ''})`,
    [dataProfile]
  );

  return (
    <div className="profile-doctor-container">
      <div className="intro-doctor">
        <div
          className="content-left"
          style={{
            backgroundImage: backgroundImageUrl,
          }}
        ></div>
        <div className="content-right">
          <div className="up">{doctorName}</div>
          <div className="down">
            {isShowDescriptionDoctor === true ? (
              <>
                {dataProfile &&
                  dataProfile.Markdown &&
                  dataProfile.Markdown.description && (
                    <span>{dataProfile.Markdown.description}</span>
                  )}
              </>
            ) : (
              <>{renderTimeBooking()}</>
            )}
          </div>
        </div>
      </div>
      {isShowLinkDetail === true && (
        <div className="view-detail-doctor">
          <Link to={`/detail-doctor/${doctorId}`}>Xem thêm</Link>
        </div>
      )}
      {isShowPrice === true && (
        <div className="price">
          <FormattedMessage id="patient.booking-modal.price" />
          {dataProfile &&
            dataProfile.Doctor_Infor &&
            language === LANGUAGES.VI && (
              <NumericFormat
                className="currency"
                value={dataProfile.Doctor_Infor.priceTypeData.valueVi}
                displayType={'text'}
                thousandSeparator={true}
                suffix={'VND'}
              />
            )}
          {dataProfile &&
            dataProfile.Doctor_Infor &&
            language === LANGUAGES.EN && (
              <NumericFormat
                className="currency"
                value={dataProfile.Doctor_Infor.priceTypeData.valueEn}
                displayType={'text'}
                thousandSeparator={true}
                suffix={'VND'}
              />
            )}
        </div>
      )}
    </div>
  );
};

export default ProfileDoctor;
