import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '../_services/account.service';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '../_models/user';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  private currentUserSource = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSource.asObservable();

  constructor(
    private accountService: AccountService,
    private router: Router,
    private toastr: ToastrService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    console.log('%c Login Component Initialized', 'background: #222; color: #bada55');
    
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  login() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    console.log('%c Login Attempt', 'background: #222; color: #bada55', this.loginForm.value);
    
    this.accountService.login(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigateByUrl('/members');
      },
      error: (error) => {
        console.error('%c Login Failed', 'background: #ff0000; color: white', error);
        this.toastr.error(error.error || 'Login failed. Please try again.');
        this.loading = false;
        this.submitted = false;
      }
    });
  }

  setCurrentUser(user: User) {
    this.currentUserSource.next(user);
    localStorage.setItem('user', JSON.stringify(user));
  }
} 