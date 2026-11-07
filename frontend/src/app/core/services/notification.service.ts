import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly _toasts = signal<ToastMessage[]>([]);
  readonly toasts = this._toasts.asReadonly();
  private nextId = 1;

  show(message: string, type: 'success' | 'error' | 'info' = 'info', durationMs = 4000): void {
    const id = this.nextId++;
    const toast: ToastMessage = { id, type, message };

    this._toasts.update(current => [...current, toast]);

    if (durationMs > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, durationMs);
    }
  }

  success(message: string, durationMs = 4000): void {
    this.show(message, 'success', durationMs);
  }

  error(message: string, durationMs = 5000): void {
    this.show(message, 'error', durationMs);
  }

  info(message: string, durationMs = 4000): void {
    this.show(message, 'info', durationMs);
  }

  dismiss(id: number): void {
    this._toasts.update(current => current.filter(t => t.id !== id));
  }
}
