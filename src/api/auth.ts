import { apiFetch } from './client';

export interface LoginDto {
  email: string;
  senha: string;
}

export interface RegisterDto {
  nome: string;
  email: string;
  senha: string;
}

export interface AuthResponse {
  access_token: string;
}

export const login = (data: LoginDto) =>
  apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const register = (data: RegisterDto) =>
  apiFetch<{ id: number; nome: string; email: string }>('/usuarios/registrar', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const solicitarRecuperacao = (email: string) =>
  apiFetch<{ token: string } | null>('/auth/recuperar-senha', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

export const redefinirSenha = (token: string, novaSenha: string) =>
  apiFetch<null>('/auth/redefinir-senha', {
    method: 'POST',
    body: JSON.stringify({ token, novaSenha }),
  });
