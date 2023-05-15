import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Validators } from '@angular/forms';
import { SessionService } from '../../services/session/session.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { ClockCAPTCHAView } from '../../../../../clock-captcha/dist';
import { ClockCaptchaService } from 'src/app/services/clock-captcha/clock-captcha.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  protected _loginForm: FormGroup;
  protected _hide: boolean = true;
  private _captchaModule: ClockCAPTCHAView;

  constructor(
    private _router: Router,
    private _snackBar: MatSnackBar,
    private _sessionService: SessionService,
    private _ccService: ClockCaptchaService
  ) {
    this._loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.pattern(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/)]),
      password: new FormControl('', Validators.required)
    });

    this._captchaModule = new ClockCAPTCHAView();

  }

  ngOnInit(): void {
    // inizializzazione del clock captcha
    this._captchaModule.inject(document.getElementById('clock-captcha'));
    setTimeout(() => {
      this._ccService.ccInit().subscribe(
        (response) => {
          this._captchaModule?.fill(response.cc_content, response.cc_token);
        }
      );
    }, 2000);

  }


  /**
   * Utilizza gli input forniti dall'utente (email, password e ora del captcha) per effettuare l'accesso.
   * Se il valore del captcha non è nel formato corretto, l'errore viene segnalato all'utente.
   * Se il login è avvenuto con successo, l'utente viene reindirizzato alla home.
   * Se non è stato possibile effettuare l'accesso, l'errore viene notificato all'utente e il CAPTCHA viene rigenerato.
   */
  login(): void {
    if (this._captchaModule?.getInput().length != 5) {
      this._captchaModule?.error("Controlla il formato!")
    } else if (this._captchaModule)
      this._sessionService.login(this._loginForm.value.email, this._loginForm.value.password, this._captchaModule.getToken(), this._captchaModule.getInput()).subscribe(
        (result) => {
          if (result.okay) {
            this._router.navigate(['']);
          } else {
            // login non riuscita, comunica all'utente un messaggio diverso a seconda del tipo di errore
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

              case 'BAD_CREDENTIAL' || 'INVALID_EMAIL_FORMAT' || 'INVALID_PASSWORD_FORMAT':
                this.regenerateCaptcha();
                this._loginForm.get('email')?.setErrors({ wrongCredentialError: true });
                this._loginForm.get('password')?.setErrors({ wrongCredentialError: true });
                break;

              default:
                this.regenerateCaptcha();
                this._snackBar.open("Errore interno al sito. Riprova tra qualche minuto.", 'Ok');
                break;
            }
          }
        }
      );
  }

  /**
   * Rigenera il CAPTCHA ripulendo il modulo corrente e richiedendone uno nuovo al servizio di back end.
   * Una volta ricevuta risposta dal server, aggiorna il modulo del CAPTCHA con il nuovo contenuto e il nuovo token generato.
   */
  private regenerateCaptcha(): void{
    this._captchaModule?.clear();
      this._ccService.ccInit().subscribe(
        (response) => {
          this._captchaModule?.fill(response.cc_content, response.cc_token);
        }
      );
  }

}
