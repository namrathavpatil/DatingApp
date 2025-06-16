import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Photo } from '../_models/photo';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getPhotos(userId?: number): Observable<Photo[]> {
    let url = userId ? `${this.baseUrl}${userId}/photos` : `${this.baseUrl}photos`;
 
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Photo[]>(url, { headers });
  }

  addPhoto(file: File): Observable<HttpEvent<Photo>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Photo>(this.baseUrl + 'photos/add-photo', formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  setMainPhoto(photoId: number): Observable<any> {
    return this.http.put(this.baseUrl + 'users/set-main-photo/' + photoId, {});
  }

  deletePhoto(photoId: number): Observable<any> {
    return this.http.delete(this.baseUrl + 'Photos/delete-photo/' + photoId);
  }
} 