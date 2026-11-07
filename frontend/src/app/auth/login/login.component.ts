import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly showPassword = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  protected togglePasswordVisibility(): void {
    this.showPassword.update(prev => !prev);
  }

  protected onSubmit(): void {
    this.errorMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();

    this.isSubmitting.set(true);

    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.notificationService.success('Inicio de sesión exitoso. ¡Bienvenido!');
        this.router.navigate(['/users']);
      },
      error: (errorMsg: string) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(errorMsg);
      }
    });
  }
}
