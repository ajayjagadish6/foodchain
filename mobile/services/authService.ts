import api from './api';
import type {
  LoginRequest, LoginResponse,
  RegisterRequest, GenericResponse,
  VerifyPhoneRequest, ForgotPasswordRequest,
  MeView,
} from '../types/api';

export const authService = {
  login: (data: LoginRequest) =>
    api.post<LoginResponse>('/api/auth/login', data).then((r) => r.data),

  register: (data: RegisterRequest) =>
    api.post<GenericResponse>('/api/auth/register', data).then((r) => r.data),

  verifyPhone: (data: VerifyPhoneRequest) =>
    api.post<GenericResponse>('/api/auth/verify-phone', data).then((r) => r.data),

  resendPhone: (email: string) =>
    api.post<GenericResponse>('/api/auth/resend-phone', { email }).then((r) => r.data),

  forgotPassword: (data: ForgotPasswordRequest) =>
    api.post<GenericResponse>('/api/auth/forgot-password', data).then((r) => r.data),

  me: () =>
    api.get<MeView>('/api/users/me').then((r) => r.data),

  updateMe: (data: Partial<MeView>) =>
    api.put<GenericResponse>('/api/users/me', data).then((r) => r.data),
};
