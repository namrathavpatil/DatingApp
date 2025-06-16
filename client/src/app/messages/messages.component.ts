import { Component, OnInit } from '@angular/core';
import { MessagesService } from '../_services/messages.service';
import { ToastrService } from 'ngx-toastr';
import { Message } from '../_models/message';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
  users: string[] = [];
  selectedUser: string | null = null;
  messages: Message[] = [];
  messageContent: string = '';
  currentUsername: string = '';

  constructor(
    private messagesService: MessagesService,
    private toastr: ToastrService,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    // Get current user's username
    const currentUser = this.accountService.currentUserValue;
    this.currentUsername = currentUser?.username || '';
    this.loadUsersWithMessages();
  }

  loadUsersWithMessages() {
    this.messagesService.getMessages().subscribe({
      next: (messages) => {
        // Extract unique usernames (other than self) from sender and recipient
        const userSet = new Set<string>();
        messages.forEach(msg => {
          if (msg.senderUsername !== this.currentUsername) userSet.add(msg.senderUsername);
          if (msg.recipientUsername !== this.currentUsername) userSet.add(msg.recipientUsername);
        });
        this.users = Array.from(userSet);
      },
      error: () => this.toastr.error('Failed to load users')
    });
  }

  openThread(user: string) {
    this.selectedUser = user;
    this.loadThread();
  }

  loadThread() {
    if (!this.selectedUser) return;
    this.messagesService.getMessageThread(this.selectedUser).subscribe({
      next: (messages) => this.messages = messages,
      error: () => this.toastr.error('Failed to load messages')
    });
  }

  sendMessage() {
    if (!this.selectedUser || !this.messageContent) return;
    this.messagesService.sendMessage(this.selectedUser, this.messageContent).subscribe({
      next: (message) => {
        this.messages.push(message);
        this.messageContent = '';
        this.toastr.success('Message sent!');
      },
      error: () => this.toastr.error('Failed to send message')
    });
  }

  deleteMessage(id: number) {
    this.messagesService.deleteMessage(id).subscribe({
      next: () => {
        this.messages = this.messages.filter(m => m.id !== id);
        this.toastr.success('Message deleted!');
      },
      error: () => this.toastr.error('Failed to delete message')
    });
  }
} 