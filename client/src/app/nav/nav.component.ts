import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '../_services/account.service';
import { ToastrService } from 'ngx-toastr';
import { User } from '../_models/user';
import { UserService } from '../_services/user.service';

declare var bootstrap: any;

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit, AfterViewInit {
  model: any = {};
  loading = false;

  constructor(
    public accountService: AccountService,
    private router: Router,
    private toastr: ToastrService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    // Initialize all dropdowns
    const dropdownElementList = document.querySelectorAll('.dropdown-toggle');
    dropdownElementList.forEach(dropdownToggleEl => {
      new bootstrap.Dropdown(dropdownToggleEl);
    });
  }

  getDisplayName(user: User | null): string {
    if (!user) return '';
    return user.knownAs || user.username;
  }

  login() {
    this.loading = true;
    console.log('Login attempt with:', this.model);
    
    this.accountService.login(this.model).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.router.navigateByUrl('/members');
        this.toastr.success('Welcome back!');
        this.loading = false;
      },
      error: (error) => {
        console.error('Login failed:', error);
        this.toastr.error(error.message || 'Login failed. Please try again.');
        this.loading = false;
      }
    });
  }

  logout() {
    this.accountService.logout();
    this.router.navigateByUrl('/');
  }

  editProfile() {
    // Example payload, replace with actual form data as needed
    const user = this.accountService.currentUserValue;
    if (user) {
      const update: User = {
        ...user,
        introduction: 'Hello, I am jane!',
        lookingFor: 'Friendship',
        interests: 'Music, Hiking',
        city: 'New York',
        country: 'USA'
      };
      this.userService.updateUser(user.id, update).subscribe({
        next: () => this.toastr.success('Profile updated!'),
        error: () => this.toastr.error('Failed to update profile')
      });
    }
  }

  aboutProfile() {
    this.router.navigateByUrl('/about-profile');
  }
} 