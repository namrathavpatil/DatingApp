import { Component, OnInit } from '@angular/core';
import { AccountService } from '../_services/account.service';
import { MembersService } from '../_services/members.service';
import { User } from '../_models/user';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-about-profile',
  templateUrl: './about-profile.component.html',
  styleUrls: ['./about-profile.component.css']
})
export class AboutProfileComponent implements OnInit {
  user: User | undefined;
  loading = false;

  constructor(
    private accountService: AccountService,
    private membersService: MembersService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadUser();
  }

  loadUser() {
    this.loading = true;
    const currentUser = this.accountService.currentUserValue;
    if (currentUser) {
      this.membersService.getMember(currentUser.id).subscribe({
        next: (user) => {
          this.user = user;
          this.loading = false;
        },
        error: (error) => {
          this.toastr.error('Error loading profile');
          this.loading = false;
        }
      });
    }
  }
}