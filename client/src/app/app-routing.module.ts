import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { MemberListComponent } from './members/member-list/member-list.component';
import { MemberDetailComponent } from './members/member-detail/member-detail.component';
import { ListsComponent } from './lists/lists.component';
import { MessagesComponent } from './messages/messages.component';
import { PhotoEditorComponent } from './members/photo-editor/photo-editor.component';
import { TestApiComponent } from './test-api/test-api.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { AboutProfileComponent } from './about-profile/about-profile.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'members', component: MemberListComponent },
  { path: 'members/:id', component: MemberDetailComponent },
  { path: 'lists', component: ListsComponent },
  { path: 'messages', component: MessagesComponent },
  { path: 'edit', component: PhotoEditorComponent },
  { path: 'test-api', component: TestApiComponent },
  { path: 'edit-profile', component: EditProfileComponent },
  { path: 'about-profile', component: AboutProfileComponent },

  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
