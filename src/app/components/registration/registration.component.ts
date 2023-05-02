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
export class RegistrationComponent implements OnInit{

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
      'username': new FormControl(null),
      'email': new FormControl(null, [Validators.required, Validators.email]),
      'password': new FormControl(null, [Validators.required, Validators.minLength(6), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\S]{1,}$/)])
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

  signUp(): void {
    if (this._captchaModule?.getInput().length != 5){
      this._captchaModule?.error("Controlla il formato!")
    } else if (this._captchaModule){
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
          this._router.navigate(['\login']);
        } else {
          switch (result.case) {
            //Errore nel CAPTCHA deve avvenire in altro posto
            // case 'BAD_CAPTCHA':
            //   this._captchaModule?.clear();
            //   this._captchaModule?.error("OPS, ORARIO SCORRETTO!");
            //   this._ccService.ccInit().subscribe(
            //     (response) => {
            //       this._captchaModule?.redraw(response.cc_content, response.cc_token);
            //     }
            //   );
            //   break;

            case 'Formato errato.':
              this._captchaModule?.clear();
              this._ccService.ccInit().subscribe(
                (response) => {
                  this._captchaModule?.redraw(response.cc_content, response.cc_token);
                }
              );
              // creare un messaggio
              //this._signupForm.get('email')?.setErrors({ email: true });
              //this._signupForm.get('password')?.setErrors({ pattern: true });
              break;

            case 'Database error.':
              this._captchaModule?.clear();
              this._ccService.ccInit().subscribe(
                (response) => {
                  this._captchaModule?.redraw(response.cc_content, response.cc_token);
                }
              );
              break;

            case 'Email in uso.':
              this._signupForm.get('email')?.setErrors({ alreadyExisted: true });
              this._captchaModule?.clear();
              this._ccService.ccInit().subscribe(
                (response) => {
                  this._captchaModule?.redraw(response.cc_content, response.cc_token);
                }
              );
              break;

            default:
              this._snackBar.open("Errore interno al sito. Riprova tra qualche minuto.");
              break;
          }
          }
        });
  }
  }
}

