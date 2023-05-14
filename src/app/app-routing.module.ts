import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotAuthGuard } from './guards/not-auth.guard'

import { HomepageComponent } from './components/homepage/homepage.component';
import { LoginComponent } from './components/login/login.component';
import { RegistrationComponent } from './components/registration/registration.component';

const routes: Routes = [
  {path: '', component: HomepageComponent},
  {path: 'login', component: LoginComponent, canActivate: [NotAuthGuard]},
  {path: 'signup', component: RegistrationComponent, canActivate: [NotAuthGuard]},
  {path: '**', redirectTo:''},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
