import { Component, OnInit } from '@angular/core';
import { LikesService } from '../../_services/likes.service';
import { User } from '../../_models/user';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css']
})
export class MemberListComponent implements OnInit {
  members: User[] = [];
  loading = false;
  baseUrl = environment.apiUrl;

  constructor(
    private likesService: LikesService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadMatches();
  }

  loadMatches() {
    this.loading = true;
    this.likesService.getLikes().subscribe({
      next: members => {
        this.members = members.map(member => ({
          ...member,
          photoUrl: member.photoUrl ? `${this.baseUrl}${member.photoUrl.startsWith('/') ? member.photoUrl.substring(1) : member.photoUrl}` : undefined
        }));
        this.loading = false;
      },
      error: error => {
        this.toastr.error('Failed to load matches');
        this.loading = false;
      }
    });
  }
} 