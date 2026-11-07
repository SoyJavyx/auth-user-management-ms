import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  private readonly authService = inject(AuthService);

  protected readonly userName = computed(() => this.authService.userName());
  protected readonly userEmail = computed(() => this.authService.userEmail());

  protected onLogout(): void {
    this.authService.logout();
  }
}
