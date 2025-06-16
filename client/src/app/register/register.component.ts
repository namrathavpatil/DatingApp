import { Component } from '@angular/core';
import { AccountService } from '../_services/account.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  model: any = {};

  constructor(
    private accountService: AccountService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  register() {
    this.accountService.register(this.model).subscribe({
      next: () => {
        this.router.navigateByUrl('/members');
      },
      error: error => {
        this.toastr.error(error.error);
      }
    });
  }
} 