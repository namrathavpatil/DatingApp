import { Component, OnInit } from '@angular/core';
import { AccountService } from '../_services/account.service';
import { MessagesService } from '../_services/messages.service';
import { MembersService } from '../_services/members.service';

@Component({
  selector: 'app-test-api',
  template: `
    <div class="container mt-4">
      <div class="card">
        <div class="card-header">
          <h3>API Connection Test</h3>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <button class="btn btn-primary me-2" (click)="testApiConnection()">Test API Connection</button>
            <button class="btn btn-info me-2" (click)="testLogin()">Test Login</button>
            <button class="btn btn-success me-2" (click)="testMessages()">Test Messages</button>
            <button class="btn btn-warning" (click)="testUserProfile()">Test User Profile</button>
          </div>
          
          <div *ngIf="testResults" class="mt-3">
            <h4>Test Results:</h4>
            <pre class="bg-light p-3 rounded">{{ testResults | json }}</pre>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    pre {
      max-height: 300px;
      overflow-y: auto;
    }
  `]
})
export class TestApiComponent implements OnInit {
  testResults: any;

  constructor(
    private accountService: AccountService,
    private messagesService: MessagesService,
    private membersService: MembersService
  ) { }

  ngOnInit(): void {
    console.log('Test API Component Initialized');
  }

  testApiConnection() {
    console.log('Testing API Connection...');
    this.accountService.testApiConnection().subscribe({
      next: (response) => {
        console.log('API Connection Test Response:', response);
        this.testResults = response;
      },
      error: (error) => {
        console.error('API Connection Test Error:', error);
        this.testResults = { error: error.message };
      }
    });
  }

  testLogin() {
    console.log('Testing Login...');
    const testUser = {
      username: 'testuser',
      password: 'Pa$$w0rd'
    };
    
    this.accountService.login(testUser).subscribe({
      next: (response) => {
        console.log('Login Test Response:', response);
        this.testResults = response;
      },
      error: (error) => {
        console.error('Login Test Error:', error);
        this.testResults = { error: error.message };
      }
    });
  }

  testMessages() {
    console.log('Testing Messages...');
    this.messagesService.getMessages().subscribe({
      next: (response) => {
        console.log('Messages Test Response:', response);
        this.testResults = response;
      },
      error: (error) => {
        console.error('Messages Test Error:', error);
        this.testResults = { error: error.message };
      }
    });
  }

  testUserProfile() {
    console.log('Testing User Profile...');
    this.accountService.testUserProfile(1).subscribe({
      next: (response) => {
        console.log('User Profile Test Response:', response);
        this.testResults = response;
      },
      error: (error) => {
        console.error('User Profile Test Error:', error);
        this.testResults = { error: error.message };
      }
    });
  }
} 