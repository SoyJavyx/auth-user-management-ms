import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { CreateUserRequest, UpdateUserRequest, User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.usersApiUrl;

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/all`).pipe(
      map(users => Array.isArray(users) ? users : []),
      catchError(error => this.handleError(error, 'Error al consultar la lista de usuarios'))
    );
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => this.handleError(error, `Error al consultar el usuario con ID ${id}`))
    );
  }

  createUser(payload: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.apiUrl, payload).pipe(
      catchError(error => this.handleError(error, 'Error al crear el usuario'))
    );
  }

  updateUser(id: number, payload: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/update/${id}`, payload).pipe(
      catchError(error => this.handleError(error, 'Error al actualizar el usuario'))
    );
  }

  deleteUser(id: number): Observable<User> {
    return this.http.delete<User>(`${this.apiUrl}/delete/${id}`).pipe(
      catchError(error => this.handleError(error, 'Error al eliminar el usuario'))
    );
  }

  private handleError(error: HttpErrorResponse, defaultMessage: string): Observable<never> {
    let message = defaultMessage;

    if (error.status === 0) {
      message = 'No se pudo establecer conexión con el servidor. Por favor, intenta de nuevo.';
    } else if (error.error) {
      if (typeof error.error === 'string' && error.error.trim().length > 0) {
        message = error.error;
      } else if (typeof error.error === 'object') {
        const errObj = error.error as { message?: string; error?: string };
        if (errObj.message) {
          message = errObj.message;
        } else if (errObj.error) {
          message = errObj.error;
        }
      }
    }

    return throwError(() => new Error(message));
  }
}
