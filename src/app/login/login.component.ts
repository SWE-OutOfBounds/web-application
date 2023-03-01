import { HttpClient } from '@angular/common/http';
import { Component, EnvironmentInjector, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { CookieService } from 'ngx-cookie-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { captchaModule } from '../../../../clock-captcha/dist/index';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit{
  title: string = "loginPage";
  _loginForm: FormGroup;
  hide: boolean = true;
  _captchaModule: captchaModule | null = null;

  constructor(private router : Router, private _snackBar: MatSnackBar, private http: HttpClient, private authService: AuthService, private cookieService: CookieService) {
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
            this.router.navigate(['']);
        }else if(response.status == 401){
          this._loginForm.get('email')?.setErrors({wrongCredentialError : true});
          this._loginForm.get('password')?.setErrors({wrongCredentialError : true});
        }else{
          this._snackBar.open("Errore interno al sito. Riprova tra qualche minuto.");
        }
      }
    );
  }
}
