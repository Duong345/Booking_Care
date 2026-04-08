import React, {
  useState,
  useEffect,
  FC,
  ChangeEvent,
  useCallback,
} from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import { createNewUserService, IApiResponse } from '../services/userService';
import { KeyCodeUtils } from '../utils';
import './Signup.scss';

interface FormDataType {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RootState {
  app: {
    language: string;
  };
}

const Signup: FC = () => {
  const navigate = useNavigate();
  const lang = useSelector((state: RootState) => state.app.language);

  const [formData, setFormData] = useState<FormDataType>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [signupError, setSignupError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    const { firstName, lastName, email, password, confirmPassword } = formData;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setSignupError('Vui lòng điền tất cả các trường');
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setSignupError('Email không hợp lệ');
      return false;
    }

    if (password !== confirmPassword) {
      setSignupError('Mật khẩu không khớp');
      return false;
    }

    if (password.length < 6) {
      setSignupError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }

    return true;
  };

  const handleSignup = async (): Promise<void> => {
    setSignupError('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const signupBody = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        roleId: 'R3',
      };

      const response = (await createNewUserService(
        signupBody
      )) as unknown as IApiResponse;

      // Response được trả về từ axios interceptor đã là data, không phải response.data
      if (response && response.errCode === 0) {
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: '',
        });
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        navigate('/login');
      } else {
        const errorMsg =
          response?.message || response?.errMessage || 'Đăng ký thất bại';
        setSignupError(errorMsg);
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      // Handle axios error response
      if (error?.response?.data) {
        const errorMsg =
          error.response.data.message || error.response.data.errMessage;
        setSignupError(errorMsg || 'Lỗi hệ thống. Vui lòng thử lại!');
      } else {
        setSignupError('Lỗi hệ thống. Vui lòng thử lại!');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Memoize handleSignup to prevent unnecessary effect re-runs
  const memoizedHandleSignup = useCallback(handleSignup, [formData]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && !isLoading) {
        event.preventDefault();
        memoizedHandleSignup();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLoading, memoizedHandleSignup]);

  const { firstName, lastName, email, password, confirmPassword } = formData;

  return (
    <div className="login-background">
      <div className="login-container">
        <div className="login-content row">
          <div className="col-12 text-login">
            <FormattedMessage id="signup.signup" defaultMessage="Sign Up" />
          </div>

          <div className="col-12 form-group login-input">
            <label>Họ:</label>
            <input
              placeholder="Nhập họ"
              id="firstName"
              name="firstName"
              type="text"
              className="form-control"
              value={firstName}
              onChange={handleInputChange}
              disabled={isLoading}
            />
          </div>

          <div className="col-12 form-group login-input">
            <label>Tên:</label>
            <input
              placeholder="Nhập tên"
              id="lastName"
              name="lastName"
              type="text"
              className="form-control"
              value={lastName}
              onChange={handleInputChange}
              disabled={isLoading}
            />
          </div>

          <div className="col-12 form-group login-input">
            <label>Email:</label>
            <input
              placeholder="Nhập email"
              id="email"
              name="email"
              type="email"
              className="form-control"
              value={email}
              onChange={handleInputChange}
              disabled={isLoading}
            />
          </div>

          <div className="col-12 form-group login-input">
            <label>Mật khẩu:</label>
            <input
              placeholder="Nhập mật khẩu"
              id="password"
              name="password"
              type="password"
              className="form-control"
              value={password}
              onChange={handleInputChange}
              disabled={isLoading}
            />
          </div>

          <div className="col-12 form-group login-input">
            <label>Xác nhận mật khẩu:</label>
            <input
              placeholder="Xác nhận mật khẩu"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className="form-control"
              value={confirmPassword}
              onChange={handleInputChange}
              disabled={isLoading}
            />
          </div>

          {signupError && (
            <div className="col-12 signup-error">
              <span className="signup-error-message">{signupError}</span>
            </div>
          )}

          <div className="col-12 form-group">
            <button
              id="btnSignup"
              type="button"
              className="btn-login"
              onClick={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
          </div>

          <div className="col-12 signup-link">
            <span>
              Đã có tài khoản?{' '}
              <span
                onClick={() => navigate('/login')}
                style={{
                  cursor: 'pointer',
                  color: '#0069d9',
                  textDecoration: 'underline',
                }}
              >
                Đăng nhập
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
