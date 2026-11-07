import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-confirm-dialog',
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css'
})
export class ConfirmDialogComponent {
  @Input() isOpen = false;
  @Input() user: User | null = null;
  @Input() isDeleting = false;

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm(): void {
    if (!this.isDeleting) {
      this.confirmed.emit();
    }
  }

  onCancel(): void {
    if (!this.isDeleting) {
      this.cancelled.emit();
    }
  }
}
