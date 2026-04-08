import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { NumericFormat } from 'react-number-format';

import { getExtraInforDoctorById } from '../../../services/userService';
import { LANGUAGES } from '../../../utils';
import './DoctorExtraInfor.scss';

interface PriceTypeData {
  valueVi: string | number;
  valueEn: string | number;
}

interface PaymentTypeData {
  valueVi: string;
  valueEn: string;
}

interface ExtraInfor {
  nameClinic?: string;
  addressClinic?: string;
  priceTypeData?: PriceTypeData;
  note?: string;
  paymentTypeData?: PaymentTypeData;
}

interface ApiResponse {
  errCode: number;
  data?: ExtraInfor;
}

interface RootState {
  app: {
    language: string;
  };
}

interface DoctorExtraInforProps {
  doctorIdFromParent: string | number;
}

const DoctorExtraInfor = ({ doctorIdFromParent }: DoctorExtraInforProps) => {
  const language = useSelector((state: RootState) => state.app.language);

  const [isShowDetailInfor, setIsShowDetailInfor] = useState(false);
  const [extraInfor, setExtraInfor] = useState<ExtraInfor>({});
  const [loading, setLoading] = useState(false);

  // Fetch doctor extra information
  const fetchExtraInfor = useCallback(async () => {
    if (!doctorIdFromParent) return;

    setLoading(true);
    try {
      const doctorId =
        typeof doctorIdFromParent === 'string'
          ? parseInt(doctorIdFromParent, 10)
          : doctorIdFromParent;

      const res = (await getExtraInforDoctorById(
        doctorId
      )) as unknown as ApiResponse;
      if (res?.errCode === 0 && res?.data) {
        setExtraInfor(res.data);
      }
    } catch (error) {
      console.log('Error fetching doctor extra info:', error);
    } finally {
      setLoading(false);
    }
  }, [doctorIdFromParent]);

  // Load data on mount and when doctorIdFromParent changes
  useEffect(() => {
    fetchExtraInfor();
  }, [doctorIdFromParent, fetchExtraInfor]);

  // Toggle detail info display
  const handleToggleDetailInfor = useCallback((status: boolean) => {
    setIsShowDetailInfor(status);
  }, []);

  // Get price value based on language
  const priceValue = useMemo(() => {
    if (!extraInfor?.priceTypeData) return '';
    return language === LANGUAGES.VI
      ? extraInfor.priceTypeData.valueVi
      : extraInfor.priceTypeData.valueEn;
  }, [extraInfor?.priceTypeData, language]);

  // Get price suffix based on language
  const priceSuffix = useMemo(() => {
    return language === LANGUAGES.VI ? 'VND' : '$';
  }, [language]);

  // Get payment method based on language
  const paymentMethod = useMemo(() => {
    if (!extraInfor?.paymentTypeData) return '';
    return language === LANGUAGES.VI
      ? extraInfor.paymentTypeData.valueVi
      : extraInfor.paymentTypeData.valueEn;
  }, [extraInfor?.paymentTypeData, language]);

  return (
    <div className="doctor-extra-infor-container">
      {/* Clinic Information */}
      <div className="content-up">
        <div className="text-address">
          <FormattedMessage id="patient.extra-infor-doctor.text-address" />
        </div>
        <div className="name-clinic">{extraInfor?.nameClinic || ''}</div>
        <div className="detail-address">{extraInfor?.addressClinic || ''}</div>
      </div>

      {/* Price and Payment Information */}
      <div className="content-down">
        {/* Short Price Display */}
        {!isShowDetailInfor && (
          <div className="short-infor">
            <FormattedMessage id="patient.extra-infor-doctor.price" />
            {extraInfor?.priceTypeData && (
              <NumericFormat
                className="currency"
                value={priceValue}
                displayType="text"
                thousandSeparator={true}
                suffix={priceSuffix}
              />
            )}
            <span
              className="detail"
              onClick={() => handleToggleDetailInfor(true)}
            >
              <FormattedMessage id="patient.extra-infor-doctor.detail" />
            </span>
          </div>
        )}

        {/* Detailed Information */}
        {isShowDetailInfor && (
          <>
            <div className="title-price">
              <FormattedMessage id="patient.extra-infor-doctor.price" />
            </div>

            <div className="detail-infor">
              <div className="price">
                <span className="left">
                  <FormattedMessage id="patient.extra-infor-doctor.price" />
                </span>
                <span className="right">
                  {extraInfor?.priceTypeData && (
                    <NumericFormat
                      className="currency"
                      value={priceValue}
                      displayType="text"
                      thousandSeparator={true}
                      suffix={priceSuffix}
                    />
                  )}
                </span>
              </div>
              <div className="note">{extraInfor?.note || ''}</div>
            </div>

            <div className="payment">
              <FormattedMessage id="patient.extra-infor-doctor.payment" />
              {paymentMethod}
            </div>

            <div className="hide-price">
              <span onClick={() => handleToggleDetailInfor(false)}>
                <FormattedMessage id="patient.extra-infor-doctor.hide-price" />
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DoctorExtraInfor;
