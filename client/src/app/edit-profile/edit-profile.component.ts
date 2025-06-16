import { Component, OnInit } from '@angular/core';
import { MembersService } from '../_services/members.service';
import { AccountService } from '../_services/account.service';
import { ToastrService } from 'ngx-toastr';
import { User } from '../_models/user';

interface UpdateProfileData {
  introduction?: string;
  lookingFor?: string;
  interests?: string;
  city?: string;
  country?: string;
}

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {
  model: Partial<User> = {};

  constructor(
    private membersService: MembersService,
    public accountService: AccountService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    const user = this.accountService.currentUserValue;
    if (user) {
      this.model = { ...user };
    }
  }

  onSubmit() {
    const user = this.accountService.currentUserValue;
    if (user) {
      // Only send the fields that can be updated
      const updateData: UpdateProfileData = {
        introduction: this.model.introduction,
        lookingFor: this.model.lookingFor,
        interests: this.model.interests,
        city: this.model.city,
        country: this.model.country
      };
      
      this.membersService.updateMember(updateData).subscribe({
        next: () => {
          this.toastr.success('Profile updated!');
          // Update local user data
          if (user) {
            Object.assign(user, updateData);
            this.accountService.setCurrentUser(user);
          }
        },
        error: () => this.toastr.error('Failed to update profile')
      });
    }
  }
}
