import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Validators } from '@angular/forms';
import { AuthService } from '../../services/session/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { ClockCAPTCHA } from '../../../../../clock-captcha/dist';
import { ClockCaptchaService } from 'src/app/services/clock-captcha/clock-captcha.service';

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
      email: new FormControl('', [Validators.required, Validators.pattern(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/)]),
      password: new FormControl('', Validators.required)
    });

  }

  ngOnInit(): void {
    this._captchaModule = new ClockCAPTCHA();
    this._captchaModule.inject(document.getElementById('clock-captcha'));
    setTimeout(() => {
      this._ccService.ccInit().subscribe(
        (response) => {
          this._captchaModule?.fill(response.cc_content, response.cc_token);
        }
      );
    }, 2000);

  }

  login(): void {
    if (this._captchaModule?.getInput().length != 5) {
      this._captchaModule?.error("Controlla il formato!")
    } else if (this._captchaModule)
      this._authService.login(this._loginForm.value.email, this._loginForm.value.password, this._captchaModule.getToken(), this._captchaModule.getInput()).subscribe(
        (result) => {
          console.log(result);
          if (result.okay) {
            this._router.navigate(['']);
          } else {
            switch (result.case) {
              case 'BAD_CAPTCHA':
                this._captchaModule?.clear();
                this._captchaModule?.error("OPS, ORARIO SCORRETTO!");
                this._ccService.ccInit().subscribe(
                  (response) => {
                    this._captchaModule?.fill(response.cc_content, response.cc_token);
                  }
                );
                break;

              case 'BAD_CREDENTIAL':
                this._captchaModule?.clear();
                this._ccService.ccInit().subscribe(
                  (response) => {
                    this._captchaModule?.fill(response.cc_content, response.cc_token);
                  }
                );
                this._loginForm.get('email')?.setErrors({ wrongCredentialError: true });
                this._loginForm.get('password')?.setErrors({ wrongCredentialError: true });
                break;

              case 'INVALID_EMAIL_FORMAT':
                this._loginForm.get('email')?.setErrors({ email: true });
                this._captchaModule?.clear();
                this._ccService.ccInit().subscribe(
                  (response) => {
                    this._captchaModule?.fill(response.cc_content, response.cc_token);
                  }
                );
                break;

              case 'INVALID_PASSWORD_FORMAT':
                this._loginForm.get('password')?.setErrors({ format: true });
                this._captchaModule?.clear();
                this._ccService.ccInit().subscribe(
                  (response) => {
                    this._captchaModule?.fill(response.cc_content, response.cc_token);
                  }
                );
                break;

              default:
                this._snackBar.open("Errore interno al sito. Riprova tra qualche minuto.");
                break;
            }
          }
        }
      );
  }
}
