import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { User } from '../_models/user';
import { environment } from '../../environments/environment';
import { TokenService } from './token.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  baseUrl = environment.apiUrl;
  private currentUserSource = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSource.asObservable();

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private router: Router
  ) {
    // Initialize user from storage
    const userJson = localStorage.getItem('user');
    if (userJson) {
      this.currentUserSource.next(JSON.parse(userJson));
    }
  }

  private logRequest(method: string, url: string, body?: any, headers?: HttpHeaders) {
    console.group('API Request');
    console.log('Method:', method);
    console.log('URL:', url);
    console.log('Headers:', headers?.keys().reduce((acc, key) => ({...acc, [key]: headers.get(key)}), {}));
    console.log('Body:', body);
    console.groupEnd();
  }

  private logResponse(response: any) {
    console.group('API Response');
    console.log('Data:', response);
    console.groupEnd();
  }

  private handleError(error: HttpErrorResponse) {
    console.group('API Error');
    console.error('Error Status:', error.status);
    console.error('Error Message:', error.message);
    console.error('Error Details:', error.error);
    
    let errorMessage = 'An error occurred';
    
    if (error.status === 0) {
      errorMessage = 'Unable to connect to the server. Please check if the server is running.';
    } else if (error.error) {
      errorMessage = error.error;
    }
    
    console.error('Final Error Message:', errorMessage);
    console.groupEnd();
    
    return throwError(() => new Error(errorMessage));
  }

  testApiConnection(): Observable<any> {
    const url = this.baseUrl + 'account/test';
    this.logRequest('GET', url);
    
    return this.http.get(url).pipe(
      tap(response => this.logResponse(response)),
      catchError(error => this.handleError(error))
    );
  }

  setCurrentUser(user: User) {
    console.log('Setting current user:', user);
    this.currentUserSource.next(user);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', user.token ?? '');
  }

  login(model: any): Observable<User> {
    const url = this.baseUrl + 'account/login';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    this.logRequest('POST', url, model, headers);
    
    return this.http.post<any>(url, model, { headers }).pipe(
      tap(response => this.logResponse(response)),
      catchError(error => {
        console.error('Login Error:', error);
        if (error.status === 0) {
          console.error('Network error - Is the backend server running?');
        }
        return this.handleError(error);
      }),
      map((response: any) => {
        const user = {
          ...response,
          username: response.userName,
          id: response.id
        };
        if (user) {
          this.setCurrentUser(user);
        }
        return user;
      })
    );
  }

  register(model: any): Observable<User> {
    const url = this.baseUrl + 'account/register';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    this.logRequest('POST', url, model, headers);

    return this.http.post<User>(url, model, { headers }).pipe(
      tap(response => this.logResponse(response)),
      catchError(error => this.handleError(error)),
      map((user: User) => {
        if (user) {
         
          this.tokenService.setUser(user);
          this.currentUserSource.next(user);
        }
        return user;
      })
    );
  }

  logout() {
    this.tokenService.clearAuth();
    this.currentUserSource.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    // Optionally, check for token expiration if using JWT
    if (!token) return false;
    // If you want to check expiration, add logic here
    return true;
  }

 

  testUserProfile(id: number): Observable<User> {
    const url = this.baseUrl + 'users/' + id;
    this.logRequest('GET', url);
    
    return this.http.get<User>(url).pipe(
      tap(response => this.logResponse(response)),
      catchError(error => this.handleError(error))
    );
  }
  
  goToMyProfile() {
    const currentUser = this.currentUserValue;
    if (currentUser && currentUser.id) {
      this.router.navigate(['/members', currentUser.id]);
    }
  }

  get currentUserValue(): User | null {
    return this.currentUserSource.getValue();
  }
} 