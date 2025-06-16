import { Component, OnInit } from '@angular/core';
import { MembersService } from '../_services/members.service';
import { User } from '../_models/user';

@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.css']
})
export class ListsComponent implements OnInit {
  users: User[] = [];

  constructor(private membersService: MembersService) {}

  ngOnInit(): void {
    this.membersService.getMembers().subscribe({
      next: users => this.users = users
    });
  }
} 