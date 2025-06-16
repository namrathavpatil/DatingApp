import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../_models/user';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getMembers(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl + 'users').pipe(
      map((members: User[]) => members.map((member: User) => {
        const url = member.photoUrl ? `${this.baseUrl}${member.photoUrl.startsWith('/') ? member.photoUrl.substring(1) : member.photoUrl}` : undefined;
        console.log('getMembers photoUrl:', url);
        return {
          ...member,
          photoUrl: url
        };
      }))
    );
  }

  getMember(id: number): Observable<User> {
    return this.http.get<User>(this.baseUrl + 'users/' + id).pipe(
      map((member: User) => {
        const url = member.photoUrl ? `${this.baseUrl}${member.photoUrl.startsWith('/') ? member.photoUrl.substring(1) : member.photoUrl}` : undefined;
        console.log('getMember photoUrl:', url);
        return {
          ...member,
          photoUrl: url
        };
      })
    );
  }

  updateMember(user: Partial<User>): Observable<any> {
    return this.http.put(this.baseUrl + 'users', user);
  }
} 