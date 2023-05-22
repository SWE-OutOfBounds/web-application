//Integration test

import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AppRoutingModule, routes } from './app-routing.module';
import { HomepageComponent } from './components/homepage/homepage.component';
import { LoginComponent } from './components/login/login.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { NotAuthGuard } from './guards/not-auth.guard';

describe('AppRoutingModule', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, AppRoutingModule],
      declarations: [HomepageComponent, LoginComponent, RegistrationComponent],
      providers: [NotAuthGuard],
    }).compileComponents();
  });

  it('should create the app routing module', () => {
    const appRoutingModule = TestBed.inject(AppRoutingModule);
    expect(appRoutingModule).toBeTruthy();
  });

  it('should have a homepage route', () => {
    const homepageRoute = routes.find((route) => route.path === '');
    expect(homepageRoute?.component).toBe(HomepageComponent);
  });

  it('should have a login route with the NotAuthGuard', () => {
    const loginRoute = routes.find((route) => route.path === 'login');
    expect(loginRoute?.component).toBe(LoginComponent);
    expect(loginRoute?.canActivate).toContain(NotAuthGuard);
  });

  it('should have a signup route with the NotAuthGuard', () => {
    const signupRoute = routes.find((route) => route.path === 'signup');
    expect(signupRoute?.component).toBe(RegistrationComponent);
    expect(signupRoute?.canActivate).toContain(NotAuthGuard);
  });

  it('should have a default route that redirects to the homepage', () => {
    const defaultRoute = routes.find((route) => route.path === '**');
    expect(defaultRoute?.redirectTo).toBe('');
  });
});
