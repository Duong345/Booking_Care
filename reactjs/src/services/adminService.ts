import axios from '../axios';

export interface LoginBody {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  errCode: number;
  message?: string;
  data?: any;
}

const adminService = {
  /**
   * Đăng nhập hệ thống
   * @param loginBody { username: string, password: string }
   */
  login(loginBody: LoginBody) {
    return axios.post<AdminLoginResponse>('/admin/login', loginBody);
  },
};

export default adminService;
