import actionTypes from './actionTypes';

interface UserInfo {
  id?: string | number;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  gender?: string;
  roleId?: string;
  positionId?: string;
  image?: string;
  [key: string]: any;
}

export const addUserSuccess = () => ({
  type: actionTypes.ADD_USER_SUCCESS,
});

export const userLoginSuccess = (userInfo: UserInfo) => ({
  type: actionTypes.USER_LOGIN_SUCCESS,
  userInfo,
});

export const userLoginFail = () => ({
  type: actionTypes.USER_LOGIN_FAIL,
});

export const processLogout = () => ({
  type: actionTypes.PROCESS_LOGOUT,
});
