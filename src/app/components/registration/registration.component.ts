import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { ClockCAPTCHA } from '../../../../../clock-captcha/dist/index';
import { AuthService } from 'src/app/services/session/auth.service';
import { ClockCaptchaService } from 'src/app/services/clock-captcha/clock-captcha.service';


@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {

  title: string = "registrationPage";
  _signupForm: FormGroup;
  hide: boolean = true;
  _captchaModule: ClockCAPTCHA | null = null;

  constructor(
    private _snackBar: MatSnackBar,
    private _router: Router,
    private _authService: AuthService,
    private _ccService: ClockCaptchaService
  ) {

    this._signupForm = new FormGroup({
      'nome': new FormControl(null, [Validators.required, Validators.pattern(/^([A-Za-zàèéìòù]*\s?)*$/)]),
      'cognome': new FormControl(null, [Validators.required, Validators.pattern(/^([A-Z]*[a-z]*[àèéìòù]*\s?)*$/)]),
      'username': new FormControl(null, Validators.required),
      'email': new FormControl(null, [Validators.required, Validators.email]),
      'password': new FormControl(null, [Validators.required, Validators.minLength(6), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\S]{1,}$/)])
    });
  }

  ngOnInit(): void {
    this._captchaModule = new ClockCAPTCHA();
    this._captchaModule.inject(document.getElementById('clock-captcha'));
    this._ccService.ccInit().subscribe(
      (response) => {
        this._captchaModule?.fill(response.body.cc_content, response.body.cc_token);
      }
    );

  }

  signUp(): void {
    if (this._captchaModule?.getInput().length != 5) {
      this._captchaModule?.error("Controlla il formato!")
    } else if (this._captchaModule) {
      this._authService.signUp(this._signupForm.value.nome,
        this._signupForm.value.cognome,
        this._signupForm.value.username,
        this._signupForm.value.email,
        this._signupForm.value.password,
        this._captchaModule.getToken(),
        this._captchaModule.getInput())
        .subscribe(result => {
          console.log(result);
          //this._snackBar.open('Registrazione avvenuta con successo!');
          if (result.okay) {
            this._router.navigate(['/login']);
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
              case 'USED_TOKEN':
                this._captchaModule?.clear();
                this._captchaModule?.error("Qualcosa è andato storto. Riprova");
                this._ccService.ccInit().subscribe(
                  (response) => {
                    this._captchaModule?.fill(response.cc_content, response.cc_token);
                  }
                );
                break;
              case 'INVALID_FORMAT_FIRSTNAME':
                this._captchaModule?.clear();
                this._ccService.ccInit().subscribe(
                  (response) => {
                    this._captchaModule?.fill(response.cc_content, response.cc_token);
                  }
                );
                this._signupForm.get('nome')?.setErrors({ pattern: true });
                break;
              case 'INVALID_FORMAT_LASTNAME':
                this._captchaModule?.clear();
                this._ccService.ccInit().subscribe(
                  (response) => {
                    this._captchaModule?.fill(response.cc_content, response.cc_token);
                  }
                );
                this._signupForm.get('cognome')?.setErrors({ pattern: true });
                break;
              case 'INVALID_FORMAT_USERNAME':
                this._captchaModule?.clear();
                this._ccService.ccInit().subscribe(
                  (response) => {
                    this._captchaModule?.fill(response.cc_content, response.cc_token);
                  }
                );
                this._signupForm.get('username')?.setErrors({ required: true });
                break;
              case 'INVALID_FORMAT_EMAIL':
                this._captchaModule?.clear();
                this._ccService.ccInit().subscribe(
                  (response) => {
                    this._captchaModule?.fill(response.cc_content, response.cc_token);
                  }
                );
                this._signupForm.get('email')?.setErrors({ email: true });
                break;
              case 'INVALID_FORMAT_PASSWORD':
                this._captchaModule?.clear();
                this._ccService.ccInit().subscribe(
                  (response) => {
                    this._captchaModule?.fill(response.cc_content, response.cc_token);
                  }
                );
                this._signupForm.get('passworx')?.setErrors({ pattern: true });
                break;

              case 'USED_EMAIL':
                this._signupForm.get('email')?.setErrors({ alreadyExisted: true });
                this._captchaModule?.clear();
                this._ccService.ccInit().subscribe(
                  (response) => {
                    this._captchaModule?.fill(response.cc_content, response.cc_token);
                  }
                );
                break;

              default:
                this._captchaModule?.clear();
                this._ccService.ccInit().subscribe(
                  (response) => {
                    this._captchaModule?.fill(response.cc_content, response.cc_token);
                  }
                );
                this._snackBar.open("Errore interno al sito. Riprova tra qualche minuto.");
                break;
            }
          }
        });
    }
  }
}

