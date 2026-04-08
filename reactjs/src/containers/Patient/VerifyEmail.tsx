import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';

import HomeHeader from '../HomePage/HomeHeader';
import {
  postVerifyBookAppointment,
  type IApiResponse,
} from '../../services/userService';
import './VerifyEmail.scss';

interface VerifyResponse {
  errCode: number;
  errMessage?: string;
  message?: string;
}

interface RootState {
  app: {
    language: string;
  };
}

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();

  const [statusVerify, setStatusVerify] = useState(false);
  const [errCode, setErrCode] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      const doctorId = searchParams.get('doctorId');

      if (!token || !doctorId) {
        setStatusVerify(true);
        setErrCode(-1);
        setErrorMessage('Token hoặc Doctor ID không hợp lệ');
        return;
      }

      try {
        const response = (await postVerifyBookAppointment({
          token,
          doctorId,
        })) as unknown as IApiResponse<VerifyResponse>;

        const code = response?.errCode ?? -1;
        setErrCode(code);
        setErrorMessage(response?.errMessage || null);
      } catch (error) {
        console.error('Error verifying appointment:', error);
        setErrCode(-1);
        setErrorMessage('Có lỗi xảy ra khi xác nhận lịch hẹn');
      } finally {
        setStatusVerify(true);
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <>
      <HomeHeader />
      <div className="verify-email-container">
        {!statusVerify ? (
          <div className="loading-state">
            <p>Đang xử lý...</p>
          </div>
        ) : (
          <div className="verify-result">
            {errCode === 0 ? (
              <div className="infor-booking success">
                ✓ Xác nhận lịch hẹn thành công!
              </div>
            ) : (
              <div className="infor-booking error">
                ✗{' '}
                {errorMessage ||
                  'Lịch hẹn không tồn tại hoặc đã được xác nhận!'}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default VerifyEmail;
