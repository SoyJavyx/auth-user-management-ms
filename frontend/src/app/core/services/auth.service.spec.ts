import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'login', component: class {} }])
      ]
    });
    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should authenticate user and store public session on successful login', () => {
    const mockCredentials = { email: 'jv@prueba.com', password: 'password123' };
    const mockResponse = { id: 1, name: 'Administrador', email: 'jv@prueba.com' };

    service.login(mockCredentials).subscribe((res) => {
      expect(res.id).toBe(1);
      expect(res.name).toBe('Administrador');
      expect(res.email).toBe('jv@prueba.com');
      expect(service.isAuthenticated()).toBe(true);
      expect(service.userName()).toBe('Administrador');
      expect(service.userEmail()).toBe('jv@prueba.com');

      const saved = localStorage.getItem('auth_session');
      expect(saved).toBeTruthy();
      const parsed = JSON.parse(saved!);
      expect(parsed.id).toBe(1);
      expect(parsed.name).toBe('Administrador');
      expect(parsed.email).toBe('jv@prueba.com');
      // Asegurarse de que nunca se guarde la contraseña
      expect(parsed.password).toBeUndefined();
    });

    const req = httpTesting.expectOne(`${environment.authApiUrl}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockCredentials);
    req.flush(mockResponse);
  });

  it('should parse 401 error message when credentials are invalid', () => {
    const mockCredentials = { email: 'jv@prueba.com', password: 'wrong' };

    service.login(mockCredentials).subscribe({
      next: () => {
        throw new Error('Should have failed with 401');
      },
      error: (errorMessage: string) => {
        expect(errorMessage).toBe('Email o contraseña incorrectos');
        expect(service.isAuthenticated()).toBe(false);
      }
    });

    const req = httpTesting.expectOne(`${environment.authApiUrl}/login`);
    req.flush('Email o contraseña incorrectos', { status: 401, statusText: 'Unauthorized' });
  });

  it('should clear session on logout', () => {
    localStorage.setItem('auth_session', JSON.stringify({ id: 1, name: 'Test', email: 'test@prueba.com', loggedAt: '' }));
    service = TestBed.inject(AuthService);

    service.logout();
    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('auth_session')).toBeNull();
  });
});
