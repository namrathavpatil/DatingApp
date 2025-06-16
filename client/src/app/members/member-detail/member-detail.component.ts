import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../_services/user.service';
import { AccountService } from '../../_services/account.service';
import { ToastrService } from 'ngx-toastr';
import { User } from '../../_models/user';
import { LikesService } from '../../_services/likes.service';
import { MessagesService } from '../../_services/messages.service';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit {
  user: User | undefined;
  loading = false;
  messageContent: string = '';
  showMessageBox: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    public accountService: AccountService,
    private toastr: ToastrService,
    private likesService: LikesService,
    private messagesService: MessagesService
  ) { }

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser() {
    this.loading = true;
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.userService.getUser(+id).subscribe({
        next: (user) => {
          this.user = user;
          this.loading = false;
        },
        error: (error) => {
          this.toastr.error('Error loading user profile');
          this.loading = false;
        }
      });
    }
  }

  likeUser(user: User) {
    console.log('Liking user:', user);
    if (!user.username) {
      this.toastr.error('User has no username!');
      return;
    }
    this.likesService.addLike(user.username).subscribe({
      next: () => this.toastr.success('You liked ' + user.username + '!'),
      error: () => this.toastr.error('Failed to like user')
    });
  }

  sendMessage(user: User, content: string) {
    console.log('Sending message to:', user);
    if (!user.username) {
      this.toastr.error('User has no username!');
      return;
    }
    this.messagesService.sendMessage(user.username, content).subscribe({
      next: () => this.toastr.success('Message sent!'),
      error: () => this.toastr.error('Failed to send message')
    });
  }
}