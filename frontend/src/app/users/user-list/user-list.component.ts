import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { NotificationService } from '../../core/services/notification.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { UserFormModalComponent } from '../user-form-modal/user-form-modal.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { CreateUserRequest, UpdateUserRequest, User } from '../../core/models/user.model';

@Component({
  selector: 'app-user-list',
  imports: [
    CommonModule,
    FormsModule,
    NavbarComponent,
    UserFormModalComponent,
    ConfirmDialogComponent
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly notificationService = inject(NotificationService);

  // Estados de datos
  protected readonly users = signal<User[]>([]);
  protected readonly isLoading = signal<boolean>(true);
  protected readonly loadError = signal<string | null>(null);

  // Filtro de búsqueda rápida
  protected readonly searchTerm = signal<string>('');
  protected readonly filteredUsers = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const list = this.users();
    if (!term) return list;
    return list.filter(u =>
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.id.toString().includes(term)
    );
  });

  // Modal de formulario (Crear / Editar)
  protected readonly isFormModalOpen = signal(false);
  protected readonly selectedUserForEdit = signal<User | null>(null);
  protected readonly isSaving = signal(false);
  protected readonly formModalError = signal<string | null>(null);

  // Diálogo de confirmación (Eliminar)
  protected readonly isConfirmDialogOpen = signal(false);
  protected readonly selectedUserForDelete = signal<User | null>(null);
  protected readonly isDeleting = signal(false);

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        this.isLoading.set(false);
        this.loadError.set(err.message || 'Error al cargar los usuarios.');
      }
    });
  }

  // --- Crear Usuario ---
  openCreateModal(): void {
    this.selectedUserForEdit.set(null);
    this.formModalError.set(null);
    this.isFormModalOpen.set(true);
  }

  // --- Editar Usuario ---
  openEditModal(user: User): void {
    this.selectedUserForEdit.set(user);
    this.formModalError.set(null);
    this.isFormModalOpen.set(true);
  }

  closeFormModal(): void {
    if (!this.isSaving()) {
      this.isFormModalOpen.set(false);
      this.selectedUserForEdit.set(null);
      this.formModalError.set(null);
    }
  }

  handleSaveUser(payload: { name: string; email: string; password?: string }): void {
    this.isSaving.set(true);
    this.formModalError.set(null);

    const editUser = this.selectedUserForEdit();

    if (editUser) {
      // Modo Actualizar
      const updatePayload: UpdateUserRequest = {
        name: payload.name,
        email: payload.email,
        ...(payload.password ? { password: payload.password } : {})
      };

      this.userService.updateUser(editUser.id, updatePayload).subscribe({
        next: (updated) => {
          this.isSaving.set(false);
          this.isFormModalOpen.set(false);
          this.notificationService.success(`Usuario "${updated.name}" actualizado exitosamente.`);
          // Actualizar listado local
          this.users.update(list => list.map(u => u.id === updated.id ? updated : u));
        },
        error: (err: Error) => {
          this.isSaving.set(false);
          this.formModalError.set(err.message || 'Error al actualizar el usuario.');
        }
      });
    } else {
      // Modo Crear
      const createPayload: CreateUserRequest = {
        name: payload.name,
        email: payload.email,
        password: payload.password || ''
      };

      this.userService.createUser(createPayload).subscribe({
        next: (created) => {
          this.isSaving.set(false);
          this.isFormModalOpen.set(false);
          this.notificationService.success(`Usuario "${created.name}" creado exitosamente.`);
          // Insertar en la lista y refrescar
          this.users.update(list => [...list, created]);
        },
        error: (err: Error) => {
          this.isSaving.set(false);
          this.formModalError.set(err.message || 'Error al crear el usuario.');
        }
      });
    }
  }

  // --- Eliminar Usuario ---
  openDeleteDialog(user: User): void {
    this.selectedUserForDelete.set(user);
    this.isConfirmDialogOpen.set(true);
  }

  closeDeleteDialog(): void {
    if (!this.isDeleting()) {
      this.isConfirmDialogOpen.set(false);
      this.selectedUserForDelete.set(null);
    }
  }

  handleConfirmDelete(): void {
    const user = this.selectedUserForDelete();
    if (!user) return;

    this.isDeleting.set(true);

    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.isConfirmDialogOpen.set(false);
        this.notificationService.success(`Usuario "${user.name}" eliminado correctamente.`);
        this.users.update(list => list.filter(u => u.id !== user.id));
        this.selectedUserForDelete.set(null);
      },
      error: (err: Error) => {
        this.isDeleting.set(false);
        this.isConfirmDialogOpen.set(false);
        this.notificationService.error(err.message || 'Error al eliminar el usuario.');
      }
    });
  }

  getUserInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
}
