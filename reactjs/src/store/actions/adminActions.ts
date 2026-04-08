import type { ThunkAction } from 'redux-thunk';
import actionTypes from './actionTypes';
import {
  getAllCodeService,
  createNewUserService,
  getAllUsers,
  deleteUserService,
  editUserService,
  getTopDoctorHomeService,
  getAllDoctors,
  saveDetailDoctorService,
  getAllSpecialty,
  getAllClinic,
  type IApiResponse,
} from '../../services/userService';
import { toast } from 'react-toastify';

interface RootState {
  [key: string]: any;
}

type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  undefined,
  any
>;

export const fetchGenderStart = (): AppThunk => {
  return async (dispatch) => {
    try {
      dispatch({ type: actionTypes.FETCH_GENDER_START });
      const res = (await getAllCodeService(
        'GENDER'
      )) as unknown as IApiResponse;
      if (res && res.errCode === 0) {
        dispatch(fetchGenderSuccess(res.data));
      } else {
        dispatch(fetchGenderFailed());
      }
    } catch (e) {
      dispatch(fetchGenderFailed());
    }
  };
};

export const fetchGenderSuccess = (genderData: any) => ({
  type: actionTypes.FETCH_GENDER_SUCCESS,
  data: genderData,
});

export const fetchGenderFailed = () => ({
  type: actionTypes.FETCH_GENDER_FAILED,
});

export const fetchPositionSuccess = (positionData: any) => ({
  type: actionTypes.FETCH_POSITION_SUCCESS,
  data: positionData,
});

export const fetchPositionFailed = () => ({
  type: actionTypes.FETCH_POSITION_FAILED,
});

export const fetchRoleSuccess = (roleData: any) => ({
  type: actionTypes.FETCH_ROLE_SUCCESS,
  data: roleData,
});

export const fetchRoleFailed = () => ({
  type: actionTypes.FETCH_ROLE_FAILED,
});

export const fetchPositionStart = (): AppThunk => {
  return async (dispatch) => {
    try {
      const res = (await getAllCodeService(
        'POSITION'
      )) as unknown as IApiResponse;
      if (res && res.errCode === 0) {
        dispatch(fetchPositionSuccess(res.data));
      } else {
        dispatch(fetchPositionFailed());
      }
    } catch (e) {
      dispatch(fetchPositionFailed());
    }
  };
};

export const fetchRoleStart = (): AppThunk => {
  return async (dispatch) => {
    try {
      const res = (await getAllCodeService('ROLE')) as unknown as IApiResponse;
      if (res && res.errCode === 0) {
        dispatch(fetchRoleSuccess(res.data));
      } else {
        dispatch(fetchRoleFailed());
      }
    } catch (e) {
      dispatch(fetchRoleFailed());
    }
  };
};

export const createNewUser = (data: any): AppThunk => {
  return async (dispatch) => {
    try {
      const res = (await createNewUserService(data)) as unknown as IApiResponse;
      if (res && res.errCode === 0) {
        toast.success('Create a new user succeed');
        dispatch(saveUserSuccess());
        dispatch(fetchAllUsersStart());
      } else {
        dispatch(saveUserFailed());
      }
    } catch (e) {
      dispatch(saveUserFailed());
    }
  };
};

export const saveUserSuccess = () => ({
  type: actionTypes.CREATE_USER_SUCCESS,
});

export const saveUserFailed = () => ({
  type: actionTypes.CREATE_USER_FAILED,
});

export const fetchAllUsersStart = (): AppThunk => {
  return async (dispatch) => {
    try {
      const res = (await getAllUsers('ALL')) as unknown as IApiResponse;
      if (res && res.errCode === 0) {
        dispatch(fetchAllUsersSuccess((res as any).users.reverse()));
      } else {
        toast.error('Fetch all users error');
        dispatch(fetchAllUsersFailed());
      }
    } catch (e) {
      toast.error('Fetch all users error');
      dispatch(fetchAllUsersFailed());
    }
  };
};

export const fetchAllUsersSuccess = (data: any) => ({
  type: actionTypes.FETCH_ALL_USERS_SUCCESS,
  users: data,
});

export const fetchAllUsersFailed = () => ({
  type: actionTypes.FETCH_ALL_USERS_FAILED,
});

export const deleteAUser = (userId: string | number): AppThunk => {
  return async (dispatch) => {
    try {
      const res = (await deleteUserService(
        userId as number
      )) as unknown as IApiResponse;
      if (res && res.errCode === 0) {
        toast.success('Delete the user succeed');
        dispatch(deleteUserSuccess());
        dispatch(fetchAllUsersStart());
      } else {
        toast.error('Delete the user error');
        dispatch(deleteUserFailed());
      }
    } catch (e) {
      toast.error('delete the user error');
      dispatch(deleteUserFailed());
    }
  };
};

export const deleteUserSuccess = () => ({
  type: actionTypes.DELETE_USER_SUCCESS,
});

export const deleteUserFailed = () => ({
  type: actionTypes.DELETE_USER_FAILED,
});

export const editAUser = (data: any): AppThunk => {
  return async (dispatch) => {
    try {
      const res = (await editUserService(data)) as unknown as IApiResponse;
      if (res && res.errCode === 0) {
        toast.success('update the user succeed');
        dispatch(editUserSuccess());
        dispatch(fetchAllUsersStart());
      } else {
        toast.success('update the user succeed');
        dispatch(editUserFailed());
      }
    } catch (e) {
      toast.success('update the user succeed');
      dispatch(editUserFailed());
    }
  };
};

export const editUserSuccess = () => ({
  type: actionTypes.EDIT_USER_SUCCESS,
});

export const editUserFailed = () => ({
  type: actionTypes.EDIT_USER_FAILED,
});

export const fetchTopDoctor = (): AppThunk => {
  return async (dispatch) => {
    try {
      const res = (await getTopDoctorHomeService(
        10
      )) as unknown as IApiResponse;
      if (res && res.errCode === 0) {
        dispatch({
          type: actionTypes.FETCH_TOP_DOCTORS_SUCCESS,
          dataDoctors: res.data,
        });
      } else {
        dispatch({
          type: actionTypes.FETCH_TOP_DOCTORS_FAILED,
        });
      }
    } catch (e) {
      dispatch({
        type: actionTypes.FETCH_TOP_DOCTORS_FAILED,
      });
    }
  };
};

export const fetchAllDoctors = (): AppThunk => {
  return async (dispatch) => {
    try {
      const res = (await getAllDoctors()) as unknown as IApiResponse;
      if (res && res.errCode === 0) {
        dispatch({
          type: actionTypes.FETCH_ALL_DOCTORS_SUCCESS,
          dataDr: res.data,
        });
      } else {
        dispatch({
          type: actionTypes.FETCH_ALL_DOCTORS_FAILED,
        });
      }
    } catch (e) {
      dispatch({
        type: actionTypes.FETCH_ALL_DOCTORS_FAILED,
      });
    }
  };
};

export const saveDetailDoctor = (data: any): AppThunk => {
  return async (dispatch) => {
    try {
      const res = (await saveDetailDoctorService(
        data
      )) as unknown as IApiResponse;
      if (res && res.errCode === 0) {
        toast.success('save infor detail doctor succeed');
        dispatch({
          type: actionTypes.SAVE_DETAIL_DOCTORS_SUCCESS,
        });
      } else {
        dispatch({
          type: actionTypes.SAVE_DETAIL_DOCTORS_FAILED,
        });
      }
    } catch (e) {
      dispatch({
        type: actionTypes.SAVE_DETAIL_DOCTORS_FAILED,
      });
    }
  };
};

export const fetchAllScheduleTime = (): AppThunk => {
  return async (dispatch) => {
    try {
      const res = (await getAllCodeService('TIME')) as unknown as IApiResponse;
      if (res && res.errCode === 0) {
        dispatch({
          type: actionTypes.FETCH_ALLCODE_SCHEDULE_TIME_SUCCESS,
          dataTime: res.data,
        });
      } else {
        dispatch({
          type: actionTypes.FETCH_ALLCODE_SCHEDULE_TIME_FAILED,
        });
      }
    } catch (e) {
      dispatch({
        type: actionTypes.FETCH_ALLCODE_SCHEDULE_TIME_FAILED,
      });
    }
  };
};

export const getAllRequiredDoctorInfor = (): AppThunk => {
  return async (dispatch) => {
    try {
      dispatch({ type: actionTypes.FETCH_REQUIRED_DOCTOR_INFOR_START });
      const resPrice = (await getAllCodeService(
        'PRICE'
      )) as unknown as IApiResponse;
      const resPayment = (await getAllCodeService(
        'PAYMENT'
      )) as unknown as IApiResponse;
      const resProvince = (await getAllCodeService(
        'PROVINCE'
      )) as unknown as IApiResponse;
      const resSpecialty = (await getAllSpecialty()) as unknown as IApiResponse;
      const resClinic = (await getAllClinic()) as unknown as IApiResponse;

      if (
        resPrice &&
        resPrice.errCode === 0 &&
        resPayment &&
        resPayment.errCode === 0 &&
        resProvince &&
        resProvince.errCode === 0 &&
        resSpecialty &&
        resSpecialty.errCode === 0 &&
        resClinic &&
        resClinic.errCode === 0
      ) {
        const data = {
          resPrice: resPrice.data,
          resPayment: resPayment.data,
          resProvince: resProvince.data,
          resSpecialty: resSpecialty.data,
          resClinic: resClinic.data,
        };
        dispatch(fetchRequireDoctorInforSuccess(data));
      } else {
        dispatch(fetchRequireDoctorInforFailed());
      }
    } catch (e) {
      dispatch(fetchRequireDoctorInforFailed());
    }
  };
};

export const fetchRequireDoctorInforSuccess = (allRequireData: any) => ({
  type: actionTypes.FETCH_REQUIRED_DOCTOR_INFOR_SUCCESS,
  data: allRequireData,
});

export const fetchRequireDoctorInforFailed = () => ({
  type: actionTypes.FETCH_REQUIRED_DOCTOR_INFOR_FAILED,
});
