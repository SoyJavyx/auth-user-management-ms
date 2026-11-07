import { TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let authServiceMock: { login: ReturnType<typeof vi.fn> };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };
  let notificationServiceMock: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    authServiceMock = {
      login: vi.fn()
    };
    routerMock = {
      navigate: vi.fn()
    };
    notificationServiceMock = {
      success: vi.fn(),
      error: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: NotificationService, useValue: notificationServiceMock }
      ]
    }).compileComponents();
  });

  it('should initialize with an invalid form', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
    expect((component as any).form.valid).toBe(false);
  });

  it('should validate email format and required password', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance as any;

    component.form.controls.email.setValue('invalid-email');
    component.form.controls.password.setValue('');
    expect(component.form.valid).toBe(false);
    expect(component.form.controls.email.errors?.['email']).toBeTruthy();
    expect(component.form.controls.password.errors?.['required']).toBeTruthy();

    component.form.controls.email.setValue('user@example.com');
    component.form.controls.password.setValue('mypassword');
    expect(component.form.valid).toBe(true);
  });

  it('should call authService.login and redirect to /users on success', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance as any;

    authServiceMock.login.mockReturnValue(of({ id: 1, name: 'Administrador', email: 'admin@prueba.com' }));

    component.form.controls.email.setValue('admin@prueba.com');
    component.form.controls.password.setValue('admin123');
    component.onSubmit();

    expect(authServiceMock.login).toHaveBeenCalledWith({
      email: 'admin@prueba.com',
      password: 'admin123'
    });
    expect(routerMock.navigate).toHaveBeenCalledWith(['/users']);
  });

  it('should show error banner when credentials fail', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance as any;

    authServiceMock.login.mockReturnValue(throwError(() => 'Email o contraseña incorrectos'));

    component.form.controls.email.setValue('admin@prueba.com');
    component.form.controls.password.setValue('wrongpass');
    component.onSubmit();

    expect(component.errorMessage()).toBe('Email o contraseña incorrectos');
  });
});
