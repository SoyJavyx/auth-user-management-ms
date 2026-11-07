import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-user-form-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form-modal.component.html',
  styleUrl: './user-form-modal.component.css'
})
export class UserFormModalComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  @Input() isOpen = false;
  @Input() userToEdit: User | null = null;
  @Input() isSaving = false;
  @Input() formError: string | null = null;

  @Output() saved = new EventEmitter<{ name: string; email: string; password?: string }>();
  @Output() cancelled = new EventEmitter<void>();

  protected readonly showPassword = signal(false);

  protected readonly form = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['']
  });

  get isEditMode(): boolean {
    return this.userToEdit !== null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.resetForm();
    }
  }

  protected togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  private resetForm(): void {
    this.showPassword.set(false);

    if (this.userToEdit) {
      // Modo edición: contraseña opcional
      this.form.controls.password.clearValidators();
      this.form.reset({
        name: this.userToEdit.name,
        email: this.userToEdit.email,
        password: ''
      });
    } else {
      // Modo creación: contraseña obligatoria
      this.form.controls.password.setValidators([Validators.required]);
      this.form.reset({
        name: '',
        email: '',
        password: ''
      });
    }

    this.form.controls.password.updateValueAndValidity();
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, email, password } = this.form.getRawValue();

    const payload: { name: string; email: string; password?: string } = {
      name: (name ?? '').trim(),
      email: (email ?? '').trim()
    };

    if (this.isEditMode) {
      // Si la contraseña tiene texto, enviarla; si está vacía, no enviarla para no sobrescribirla
      if (password && password.trim().length > 0) {
        payload.password = password.trim();
      }
    } else {
      payload.password = (password ?? '').trim();
    }

    this.saved.emit(payload);
  }

  protected onCancel(): void {
    if (!this.isSaving) {
      this.cancelled.emit();
    }
  }
}
