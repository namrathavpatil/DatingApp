import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../_models/user';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl + 'users');
  }

  getUser(id: number): Observable<User> {
    return this.http.get<any>(this.baseUrl + 'users/' + id).pipe(
      map(user => ({
        ...user,
        username: user.userName
      }))
    );
  }

  updateUser(id: number, user: User): Observable<User> {
    return this.http.put<User>(this.baseUrl + 'users/', user);
  }
} 