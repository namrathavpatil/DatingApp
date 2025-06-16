import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Message } from '../_models/message';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

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

  getMessages(): Observable<Message[]> {
    const url = this.baseUrl + 'messages';
    this.logRequest('GET', url);
    
    return this.http.get<Message[]>(url).pipe(
      tap(response => this.logResponse(response))
    );
  }

  getMessageThread(username: string): Observable<Message[]> {
    const url = this.baseUrl + 'messages/thread/' + username;
    this.logRequest('GET', url);
    
    return this.http.get<Message[]>(url).pipe(
      tap(response => this.logResponse(response))
    );
  }

  sendMessage(recipientUsername: string, content: string): Observable<Message> {
    const url = this.baseUrl + 'messages';
    const body = {
      recipientUsername,
      content
    };
    this.logRequest('POST', url, body);
    
    return this.http.post<Message>(url, body).pipe(
      tap(response => this.logResponse(response))
    );
  }

  deleteMessage(id: number): Observable<any> {
    const url = this.baseUrl + 'messages/' + id;
    this.logRequest('DELETE', url);
    
    return this.http.delete(url).pipe(
      tap(response => this.logResponse(response))
    );
  }
} 