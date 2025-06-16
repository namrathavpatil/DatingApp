import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../_models/user';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LikesService {
  baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getLikes(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl + 'likes');
  }

  addLike(username: string): Observable<any> {
    return this.http.post(this.baseUrl + 'likes/' + username, {});
  }

  getUser(id: number): Observable<User> {
    return this.http.get<any>(this.baseUrl + 'users/' + id).pipe(
      map(user => ({
        ...user,
        username: user.userName
      }))
    );
  }
} 