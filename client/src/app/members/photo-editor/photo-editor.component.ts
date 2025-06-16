import { Component, OnInit } from '@angular/core';
import { PhotoService } from '../../_services/photo.service';
import { Photo } from '../../_models/photo';
import { ToastrService } from 'ngx-toastr';
import { HttpEventType } from '@angular/common/http';
import { AccountService } from '../../_services/account.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-photo-editor',
  templateUrl: './photo-editor.component.html',
  styleUrls: ['./photo-editor.component.css']
})
export class PhotoEditorComponent implements OnInit {
  photos: Photo[] = [];
  uploadProgress: number = 0;
  isUploading: boolean = false;
  baseUrl = environment.apiUrl;

  constructor(  public accountService: AccountService, private photoService: PhotoService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.loadPhotos();
  }

  loadPhotos(userId?: number) {
    this.photoService.getPhotos(userId).subscribe({
      next: (photos: Photo[]) => {
        this.photos = photos.map(photo => ({
          ...photo,
          url: `${photo.url.startsWith('/') ? photo.url.substring(1) : photo.url}`
        }));
        this.photos.forEach(photo => {
          console.log('Full photo URL:', photo.url);
        });
      },
      error: () => this.toastr.error('Failed to load photos')
    });
  }

  addPhoto(event: any, userId?: number) {
    const file = event.target.files[0];
    if (file) {
      this.isUploading = true;
      this.uploadProgress = 0;
      
      this.photoService.addPhoto(file).subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress) {
            this.uploadProgress = Math.round(100 * event.loaded / (event.total || 1));
          } else if (event.type === HttpEventType.Response) {
            this.isUploading = false;
            this.uploadProgress = 0;
            this.toastr.success('Photo added successfully');
            this.loadPhotos(userId);
          }
        },
        error: (error) => {
          this.isUploading = false;
          this.uploadProgress = 0;
          this.toastr.error('Failed to add photo');
          console.error('Upload error:', error);
        }
      });
    }
  }

  setMainPhoto(photoId: number) {
    this.photoService.setMainPhoto(photoId).subscribe({
      next: () => {
        this.toastr.success('Main photo updated');
        this.loadPhotos();
      },
      error: () => this.toastr.error('Failed to set main photo')
    });
  }

  deletePhoto(photoId: number) {
    this.photoService.deletePhoto(photoId).subscribe({
      next: () => {
        this.toastr.success('Photo deleted');
        this.loadPhotos();
      },
      error: () => this.toastr.error('Failed to delete photo')
    });
  }
} 