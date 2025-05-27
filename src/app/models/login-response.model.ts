export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  roleName: string;
  user: any;
  message: string;
}
