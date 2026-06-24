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

  getTopDoctorHomeService(limit: number | 'ALL' = 10) {
    return axios.get<IApiResponse>(
      `/api/top-doctor-home?limit=${encodeURIComponent(String(limit))}`
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

  getBookingHistoryForPatient(data: { patientId?: number; email?: string }) {
    const params = new URLSearchParams();
    if (data.patientId) params.append('patientId', String(data.patientId));
    if (data.email) params.append('email', data.email);

    return axios.get<IApiResponse>(
      `/api/get-booking-history-for-patient?${params.toString()}`
    );
  },

  postPatientCancelBooking(data: {
    bookingId: number | string;
    patientId?: number;
    email?: string;
  }) {
    return axios.post<IApiResponse>('/api/patient-cancel-booking', data);
  },

  postPatientRebookCanceledAppointment(data: {
    bookingId: number | string;
    patientId?: number | string;
    email?: string;
    doctorId: number | string;
    date: number | string;
    timeType: string;
    language?: string;
    timeString?: string;
    doctorName?: string;
  }) {
    return axios.post<IApiResponse>(
      '/api/patient-rebook-canceled-appointment',
      data
    );
  },

  createNewSpecialty(data: unknown) {
    return axios.post<IApiResponse>('/api/create-new-specialty', data);
  },

  getAllSpecialty() {
    return axios.get<IApiResponse>('/api/get-specialty');
  },

  updateSpecialty(data: unknown) {
    return axios.put<IApiResponse>('/api/update-specialty', data);
  },

  deleteSpecialty(id: number | string) {
    return axios.delete<IApiResponse>(`/api/delete-specialty?id=${Number(id)}`);
  },

  getAllDetailSpecialtyById(data: {
    id: number;
    location?: string;
    timeType?: string;
  }) {
    return axios.get<IApiResponse>(
      `/api/get-detail-specialty-by-id?id=${Number(data.id)}&location=${encodeURIComponent(data.location ?? '')}&timeType=${encodeURIComponent(data.timeType ?? '')}`
    );
  },

  createNewClinic(data: unknown) {
    return axios.post<IApiResponse>('/api/create-new-clinic', data);
  },

  getAllClinic() {
    return axios.get<IApiResponse>('/api/get-clinic');
  },

  updateClinic(data: unknown) {
    return axios.put<IApiResponse>('/api/update-clinic', data);
  },

  deleteClinic(id: number | string) {
    return axios.delete<IApiResponse>(`/api/delete-clinic?id=${Number(id)}`);
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
  getBookingHistoryForPatient,
  postPatientCancelBooking,
  postPatientRebookCanceledAppointment,
  createNewSpecialty,
  getAllSpecialty,
  updateSpecialty,
  deleteSpecialty,
  getAllDetailSpecialtyById,
  createNewClinic,
  getAllClinic,
  updateClinic,
  deleteClinic,
  getAllDetailClinicById,
  getAllPatientForDoctor,
  postSendRemedy,
  postSendCancel,
  getConfirmedBookingHistory,
} = userService;

export default userService;
