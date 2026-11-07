export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export interface AuthSession {
  id: number;
  name: string;
  email: string;
  loggedAt: string;
}
