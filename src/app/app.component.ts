import { HttpClient } from '@angular/common/http';
import { Component, EnvironmentInjector, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Validators } from '@angular/forms';
import { AuthService } from './auth.service';
import { CookieService } from 'ngx-cookie-service';
import { MatSnackBar } from '@angular/material/snack-bar';

import { captchaModule } from '../../../clock-captcha/dist/index';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title: string = "loginPage";
  _loginForm: FormGroup;
  hide: boolean = true;
  _captchaModule: captchaModule | null = null;

  constructor(private _snackBar: MatSnackBar, private http: HttpClient, private authService: AuthService, private cookieService: CookieService) {
    console.log(document.getElementById('second'));

    this._loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required)
    });

  }
  ngOnInit(): void {
    this._captchaModule = new captchaModule();
    this._captchaModule.show(document.getElementById('clock-captcha'));
  }

  login(): void {
    this.authService.login(this._loginForm.value.email, this._loginForm.value.password).subscribe(
      (response) => {
        if (response.success) {
          //redirect
        }else{
          this._snackBar.open(response.status);
        }
      },
      error => {
        console.error(error);
        // Gestione del login fallito per errore di rete
      }
    );
  }
}

