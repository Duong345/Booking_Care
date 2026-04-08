import actionTypes from '../actions/actionTypes';

export interface UserInfo {
  [key: string]: any;
}

export interface UserState {
  isLoggedIn: boolean;
  userInfo: UserInfo | null;
}

const initialState: UserState = {
  isLoggedIn: false,
  userInfo: null,
};

interface UserAction {
  type: string;
  userInfo?: UserInfo;
  [key: string]: any;
}

const userReducer = (
  state: UserState = initialState,
  action: UserAction
): UserState => {
  switch (action.type) {
    case actionTypes.USER_LOGIN_SUCCESS:
      return {
        ...state,
        isLoggedIn: true,
        userInfo: action.userInfo || null,
      };
    case actionTypes.USER_LOGIN_FAIL:
      return {
        ...state,
        isLoggedIn: false,
        userInfo: null,
      };
    case actionTypes.PROCESS_LOGOUT:
      return {
        ...state,
        isLoggedIn: false,
        userInfo: null,
      };
    default:
      return state;
  }
};

export default userReducer;
