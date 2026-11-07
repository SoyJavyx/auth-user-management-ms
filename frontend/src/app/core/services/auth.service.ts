import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { AuthSession, AuthUser, LoginRequest } from '../models/auth.model';
import { environment } from '../../../environments/environment';

const SESSION_STORAGE_KEY = 'auth_session';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = environment.authApiUrl;

  private readonly sessionSignal = signal<AuthSession | null>(this.readSessionFromStorage());

  readonly currentSession = this.sessionSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.sessionSignal() !== null);
  readonly userName = computed(() => this.sessionSignal()?.name ?? '');
  readonly userEmail = computed(() => this.sessionSignal()?.email ?? '');

  login(credentials: LoginRequest): Observable<AuthUser> {
    return this.http.post<AuthUser>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        // Almacenar únicamente los datos públicos del usuario en localStorage (nunca la contraseña)
        const session: AuthSession = {
          id: response.id,
          name: response.name,
          email: response.email,
          loggedAt: new Date().toISOString()
        };
        this.saveSession(session);
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => this.parseAuthError(error));
      })
    );
  }

  logout(): void {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // Manejar entornos donde localStorage esté restringido
    }
    this.sessionSignal.set(null);
    this.router.navigate(['/login']);
  }

  private saveSession(session: AuthSession): void {
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch {
      // Ignorar fallo de almacenamiento
    }
    this.sessionSignal.set(session);
  }

  private readSessionFromStorage(): AuthSession | null {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as AuthSession;
      if (parsed && typeof parsed.email === 'string') {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  }

  private parseAuthError(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'No fue posible conectar con el servidor. Inténtalo de nuevo más tarde.';
    }

    if (error.status === 401) {
      if (typeof error.error === 'string' && error.error.trim().length > 0) {
        return error.error.trim();
      }
      if (error.error && typeof error.error.message === 'string') {
        return error.error.message;
      }
      return 'Email o contraseña incorrectos';
    }

    if (error.status === 500) {
      if (typeof error.error === 'string' && error.error.trim().length > 0) {
        return error.error.trim();
      }
      return 'Ocurrió un error en el servidor. Inténtalo nuevamente.';
    }

    return error.message || 'Ocurrió un error inesperado al iniciar sesión.';
  }
}
