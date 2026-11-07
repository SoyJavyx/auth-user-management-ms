import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { environment } from '../../../environments/environment';
import { CreateUserRequest, UpdateUserRequest, User } from '../models/user.model';

describe('UserService', () => {
  let service: UserService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(UserService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should fetch all users from /all endpoint', () => {
    const mockUsers: User[] = [
      { id: 1, name: 'Alice', email: 'alice@test.com', createdAt: '2026-11-06T10:00:00' },
      { id: 2, name: 'Bob', email: 'bob@test.com', createdAt: '2026-11-06T11:00:00' }
    ];

    service.getUsers().subscribe(users => {
      expect(users.length).toBe(2);
      expect(users[0].name).toBe('Alice');
    });

    const req = httpTesting.expectOne(`${environment.usersApiUrl}/all`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);
  });

  it('should create a user via POST', () => {
    const payload: CreateUserRequest = { name: 'Charlie', email: 'charlie@test.com', password: 'secretPassword' };
    const mockCreated: User = { id: 3, name: 'Charlie', email: 'charlie@test.com', createdAt: '2026-11-06T12:00:00' };

    service.createUser(payload).subscribe(user => {
      expect(user.id).toBe(3);
      expect(user.name).toBe('Charlie');
    });

    const req = httpTesting.expectOne(environment.usersApiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockCreated);
  });

  it('should update a user via PUT to /update/{id}', () => {
    const payload: UpdateUserRequest = { name: 'Charlie Updated', email: 'charlie@test.com' };
    const mockUpdated: User = { id: 3, name: 'Charlie Updated', email: 'charlie@test.com', createdAt: '2026-11-06T12:00:00' };

    service.updateUser(3, payload).subscribe(user => {
      expect(user.name).toBe('Charlie Updated');
    });

    const req = httpTesting.expectOne(`${environment.usersApiUrl}/update/3`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockUpdated);
  });

  it('should delete a user via DELETE to /delete/{id}', () => {
    const mockDeleted: User = { id: 3, name: 'Charlie', email: 'charlie@test.com', createdAt: '2026-11-06T12:00:00' };

    service.deleteUser(3).subscribe(user => {
      expect(user.id).toBe(3);
    });

    const req = httpTesting.expectOne(`${environment.usersApiUrl}/delete/3`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockDeleted);
  });
});
