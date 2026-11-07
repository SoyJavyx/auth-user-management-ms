import { TestBed } from '@angular/core/testing';
import { UserListComponent } from './user-list.component';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { of } from 'rxjs';
import { User } from '../../core/models/user.model';

describe('UserListComponent', () => {
  let userServiceMock: {
    getUsers: ReturnType<typeof vi.fn>;
    createUser: ReturnType<typeof vi.fn>;
    updateUser: ReturnType<typeof vi.fn>;
    deleteUser: ReturnType<typeof vi.fn>;
  };
  let authServiceMock: {
    userName: ReturnType<typeof vi.fn>;
    userEmail: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };

  const mockUsers: User[] = [
    { id: 1, name: 'Carlos Gomez', email: 'carlos@prueba.com', createdAt: '2026-11-06T10:00:00' },
    { id: 2, name: 'Ana Lopez', email: 'ana@prueba.com', createdAt: '2026-11-06T11:00:00' }
  ];

  beforeEach(async () => {
    userServiceMock = {
      getUsers: vi.fn().mockReturnValue(of(mockUsers)),
      createUser: vi.fn(),
      updateUser: vi.fn(),
      deleteUser: vi.fn()
    };
    authServiceMock = {
      userName: vi.fn().mockReturnValue('Administrador'),
      userEmail: vi.fn().mockReturnValue('admin@prueba.com'),
      logout: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [UserListComponent],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        NotificationService
      ]
    }).compileComponents();
  });

  it('should load users on init and populate filteredUsers', () => {
    const fixture = TestBed.createComponent(UserListComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(userServiceMock.getUsers).toHaveBeenCalled();
    expect((component as any).users().length).toBe(2);
    expect((component as any).filteredUsers().length).toBe(2);
  });

  it('should filter users based on search term', () => {
    const fixture = TestBed.createComponent(UserListComponent);
    const component = fixture.componentInstance as any;
    fixture.detectChanges();

    component.searchTerm.set('Carlos');
    expect(component.filteredUsers().length).toBe(1);
    expect(component.filteredUsers()[0].name).toBe('Carlos Gomez');

    component.searchTerm.set('ana@prueba');
    expect(component.filteredUsers().length).toBe(1);
    expect(component.filteredUsers()[0].name).toBe('Ana Lopez');

    component.searchTerm.set('nonexistent');
    expect(component.filteredUsers().length).toBe(0);
  });

  it('should open create modal and save new user', () => {
    const fixture = TestBed.createComponent(UserListComponent);
    const component = fixture.componentInstance as any;
    fixture.detectChanges();

    const newUser: User = { id: 3, name: 'Pedro Pascal', email: 'pedro@prueba.com', createdAt: '2026-11-06T12:00:00' };
    userServiceMock.createUser.mockReturnValue(of(newUser));

    component.openCreateModal();
    expect(component.isFormModalOpen()).toBe(true);
    expect(component.selectedUserForEdit()).toBeNull();

    component.handleSaveUser({ name: 'Pedro Pascal', email: 'pedro@prueba.com', password: 'Pass' });
    expect(userServiceMock.createUser).toHaveBeenCalledWith({
      name: 'Pedro Pascal',
      email: 'pedro@prueba.com',
      password: 'Pass'
    });
    expect(component.users().length).toBe(3);
    expect(component.isFormModalOpen()).toBe(false);
  });

  it('should open delete dialog and delete user', () => {
    const fixture = TestBed.createComponent(UserListComponent);
    const component = fixture.componentInstance as any;
    fixture.detectChanges();

    const targetUser = mockUsers[0];
    userServiceMock.deleteUser.mockReturnValue(of(targetUser));

    component.openDeleteDialog(targetUser);
    expect(component.isConfirmDialogOpen()).toBe(true);
    expect(component.selectedUserForDelete()).toBe(targetUser);

    component.handleConfirmDelete();
    expect(userServiceMock.deleteUser).toHaveBeenCalledWith(targetUser.id);
    expect(component.users().length).toBe(1);
    expect(component.isConfirmDialogOpen()).toBe(false);
  });
});
