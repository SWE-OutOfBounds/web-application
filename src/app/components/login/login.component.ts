import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { ClockCAPTCHA } from '../../../../../clock-captcha/dist/index';
import { ClockCaptchaService } from 'src/app/services/clock-captcha.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  title: string = "loginPage";
  _loginForm: FormGroup;
  hide: boolean = true;
  _captchaModule: ClockCAPTCHA | null = null;

  constructor(
    private _router: Router,
    private _snackBar: MatSnackBar,
    private _authService: AuthService,
    private _ccService: ClockCaptchaService
  ) {
    
    this._loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required)
    });

  }

  ngOnInit(): void {
    this._ccService.ccInit().subscribe(
      (response) => {
        this._captchaModule = new ClockCAPTCHA(response.cc_content, response.cc_token);
        this._captchaModule.inject(document.getElementById('clock-captcha'));
      }
    );

  }

  login(): void {
    if (this._captchaModule?.getInput().length != 5){
      this._captchaModule?.setTitle("Controlla il formato!")
    }else if (this._captchaModule)
      this._authService.login(this._loginForm.value.email, this._loginForm.value.password, this._captchaModule.getToken(), this._captchaModule.getInput()).subscribe(
        (response) => {
          console.log(response);
          if (response.success) {
            this._router.navigate(['']);
          } else if (response.status == 401) {
            this._loginForm.get('email')?.setErrors({ wrongCredentialError: true });
            this._loginForm.get('password')?.setErrors({ wrongCredentialError: true });
          } else {
            this._snackBar.open("Errore interno al sito. Riprova tra qualche minuto.");
          }
        }
      );
  }
}
