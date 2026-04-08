import axios from '../axios';

export interface IUser {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  roleId?: string;
  positionId?: string;
  gender?: string;
  address?: string;
  phonenumber?: string;
  image?: string;
}

export interface IApiResponse<T = any> {
  errCode: number;
  errMessage?: string;
  message?: string;
  data?: T;
}

const userService = {
  handleLoginApi(userEmail: string, userPassword: string) {
    return axios.post<IApiResponse<{ user: IUser }>>('/api/login', {
      email: userEmail,
      password: userPassword,
    });
  },

  getAllUsers(inputId: string) {
    return axios.get<IApiResponse<IUser[] | IUser>>(
      `/api/get-all-users?id=${encodeURIComponent(inputId)}`
    );
  },

  createNewUserService(data: Partial<IUser> & { password: string }) {
    return axios.post<IApiResponse>('/api/create-new-user', data);
  },

  deleteUserService(userId: number) {
    return axios.delete<IApiResponse>(`/api/delete-user?id=${userId}`);
  },

  editUserService(inputData: Partial<IUser> & { id: number }) {
    return axios.put<IApiResponse>('/api/edit-user', inputData);
  },

  getAllCodeService(inputType: string) {
    return axios.get<IApiResponse>(
      `/api/allcode?type=${encodeURIComponent(inputType)}`
    );
  },

  getTopDoctorHomeService(limit: number) {
    return axios.get<IApiResponse>(
      `/api/top-doctor-home?limit=${Number(limit)}`
    );
  },

  getAllDoctors() {
    return axios.get<IApiResponse>('/api/get-all-doctors');
  },

  saveDetailDoctorService(data: unknown) {
    return axios.post<IApiResponse>('/api/save-infor-doctors', data);
  },

  getDetailInforDoctor(inputId: number) {
    return axios.get<IApiResponse>(
      `/api/get-detail-doctor-by-id?id=${Number(inputId)}`
    );
  },

  saveBulkScheduleDoctor(data: unknown) {
    return axios.post<IApiResponse>('/api/bulk-create-schedule', data);
  },

  getScheduleDoctorByDate(doctorId: number, date: string) {
    const encodedDate = encodeURIComponent(date);
    return axios.get<IApiResponse>(
      `/api/get-schedule-doctor-by-date?doctorId=${Number(doctorId)}&date=${encodedDate}`
    );
  },

  getExtraInforDoctorById(doctorId: number) {
    return axios.get<IApiResponse>(
      `/api/get-extra-infor-doctor-by-id?doctorId=${Number(doctorId)}`
    );
  },

  getProfileDoctorById(doctorId: number) {
    return axios.get<IApiResponse>(
      `/api/get-profile-doctor-by-id?doctorId=${Number(doctorId)}`
    );
  },

  postPatientBookAppointment(data: unknown) {
    return axios.post<IApiResponse>('/api/patient-book-appointment', data);
  },

  postVerifyBookAppointment(data: unknown) {
    return axios.post<IApiResponse>('/api/verify-book-appointment', data);
  },

  createNewSpecialty(data: unknown) {
    return axios.post<IApiResponse>('/api/create-new-specialty', data);
  },

  getAllSpecialty() {
    return axios.get<IApiResponse>('/api/get-specialty');
  },

  getAllDetailSpecialtyById(data: { id: number; location?: string }) {
    return axios.get<IApiResponse>(
      `/api/get-detail-specialty-by-id?id=${Number(data.id)}&location=${encodeURIComponent(data.location ?? '')}`
    );
  },

  createNewClinic(data: unknown) {
    return axios.post<IApiResponse>('/api/create-new-clinic', data);
  },

  getAllClinic() {
    return axios.get<IApiResponse>('/api/get-clinic');
  },

  getAllDetailClinicById(data: { id: number }) {
    return axios.get<IApiResponse>(
      `/api/get-detail-clinic-by-id?id=${Number(data.id)}`
    );
  },

  getAllPatientForDoctor(data: { doctorId: number; date: string }) {
    const dateString = encodeURIComponent(data.date);
    return axios.get<IApiResponse>(
      `/api/get-list-patient-for-doctor?doctorId=${Number(data.doctorId)}&date=${dateString}`
    );
  },

  postSendRemedy(data: unknown) {
    return axios.post<IApiResponse>('/api/send-remedy', data);
  },

  postSendCancel(data: unknown) {
    return axios.post<IApiResponse>('/api/send-cancel', data);
  },

  getConfirmedBookingHistory(doctorId: number) {
    return axios.get<IApiResponse>(
      `/api/get-confirmed-booking-history?doctorId=${Number(doctorId)}`
    );
  },
};

export const {
  handleLoginApi,
  getAllUsers,
  createNewUserService,
  deleteUserService,
  editUserService,
  getAllCodeService,
  getTopDoctorHomeService,
  getAllDoctors,
  saveDetailDoctorService,
  getDetailInforDoctor,
  saveBulkScheduleDoctor,
  getScheduleDoctorByDate,
  getExtraInforDoctorById,
  getProfileDoctorById,
  postPatientBookAppointment,
  postVerifyBookAppointment,
  createNewSpecialty,
  getAllSpecialty,
  getAllDetailSpecialtyById,
  createNewClinic,
  getAllClinic,
  getAllDetailClinicById,
  getAllPatientForDoctor,
  postSendRemedy,
  postSendCancel,
  getConfirmedBookingHistory,
} = userService;

export default userService;
