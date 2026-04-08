import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../../store/actions';
import { handleLoginApi } from '../../services/userService';
import './Login.scss';

interface LoginResponse {
  errCode: number;
  message: string;
  user: any;
}

const Login = () => {
  // ===== Redux =====
  const dispatch = useDispatch();
  const lang = useSelector((state: any) => state.app.language);

  // ===== State =====
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isShowPassword, setIsShowPassword] = useState<boolean>(false);
  const [errMessage, setErrMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // ===== Handlers =====
  const handleOnChangeUsername = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setUsername(event.target.value);
  };

  const handleOnChangePassword = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPassword(event.target.value);
  };

  const handleLogin = useCallback(async () => {
    setErrMessage('');
    setLoading(true);

    try {
      const data = (await handleLoginApi(
        username,
        password
      )) as unknown as LoginResponse;

      if (data && data.errCode !== 0) {
        setErrMessage(data.message);
      }

      if (data && data.errCode === 0) {
        dispatch(actions.userLoginSuccess(data.user));
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        setErrMessage(error.response.data.message);
      }
    } finally {
      setLoading(false);
    }
  }, [username, password, dispatch]);

  const handleShowHidePassword = () => {
    setIsShowPassword((prev) => !prev);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !loading) {
      handleLogin();
    }
  };

  // ===== Render =====
  return (
    <div className="login-background">
      <div className="login-container">
        <div className="login-content row">
          <div className="col-12 text-login">Login</div>

          <div className="col-12 form-group login-input">
            <label>Username:</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter your username"
              value={username}
              onChange={handleOnChangeUsername}
            />
          </div>

          <div className="col-12 form-group login-input">
            <label>Password:</label>
            <div className="custom-input-password">
              <input
                className="form-control"
                type={isShowPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={handleOnChangePassword}
                onKeyDown={handleKeyDown}
              />

              <span onClick={handleShowHidePassword}>
                <i
                  className={isShowPassword ? 'far fa-eye' : 'far fa-eye-slash'}
                />
              </span>
            </div>
          </div>

          <div className="col-12" style={{ color: 'red' }}>
            {errMessage}
          </div>

          <div className="col-12">
            <button
              className="btn-login"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>

          <div className="col-12">
            <span className="forgot-password">Forgot your password?</span>
          </div>

          <div className="col-12 text-center mt-3">
            <span className="text-other-login">Or login with:</span>
          </div>

          <div className="col-12 social-login">
            <i className="fab fa-google google"></i>
            <i className="fab fa-facebook-f facebook"></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
