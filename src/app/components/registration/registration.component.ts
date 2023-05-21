import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { ClockCAPTCHAView } from '../../../../../clock-captcha/dist/index';
import { ClockCaptchaService } from 'src/app/services/clock-captcha/clock-captcha.service';
import { RegistrationService } from 'src/app/services/session/registration.service';

/**
 * Componente che definisce e gestisce la pagina di registrazione.
 */
@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css'],
})
export class RegistrationComponent implements OnInit {
  /**
   * Form per raccogliere i dati della registrazione utente
   */
  protected _signupForm: FormGroup;
  /**
   * Interruttore che consente all'utente di attivare la modalità password in chiaro
   */
  protected _hide: boolean = true;
  /**
   * Modulo del clock CAPTCHA
   */
  private _captchaModule: ClockCAPTCHAView;
  /**
   * Definisce il messaggio di errore in caso di problemi nel caricamento dell'immagine del clock-CAPTCHA
   */
  public errorMessage: string = '';

  /**
   * Costruttore della componente di registrazione
   *
   * @param _snackBar Consente la visualizzazione di messaggi tramite Snackbar
   * @param _router Consente la navigazione tra le pagine
   * @param _registrationService Consente di gestire la registrazione dell'utente
   * @param _ccService Consente la gestione del clock CAPTCHA
   */
  constructor(
    private _snackBar: MatSnackBar,
    private _router: Router,
    private _registrationService: RegistrationService,
    private _ccService: ClockCaptchaService
  ) {
    this._signupForm = new FormGroup({
      firstName: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^([A-Za-zàèéìòù]*\s?)*$/),
      ]), //sono ammessi solo lettere (comprese vocali accentate) e spazi
      lastName: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^([A-Z]*[a-z]*[àèéìòù]*\s?)*$/),
      ]), //sono ammessi solo lettere (comprese vocali accentate) e spazi
      username: new FormControl(null, Validators.required),
      email: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/),
      ]), //l'unico formato ammesso è quello dell'email
      password: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$/),
      ]), //devono essere almeno 8 caratteri e deve contenere almeno una lettera minuscola, una lettera maiuscola e un numero
    });

    this._captchaModule = new ClockCAPTCHAView();
  }

  /**
   * Inizializza il clock CAPTCHA
   */
  ngOnInit(): void {
    this._captchaModule.inject(document.getElementById('clock-captcha_signup'));
    this._ccService.ccInit().subscribe((response) => {
      if (response.cc_content && response.cc_token)
        this._captchaModule.fill(response.cc_content, response.cc_token);
      else {
        this.errorMessage =
          'Si è verificato un errore nel recupero del test, per cui al momento non è possibile accedere al nostro sistema. Si prega di riprovare più tardi.';
      }
    });
  }

  /**
   * Utilizza i dati forniti dall'utente (nome, cognome, username, email, password, ora del captcha) per effettuare
   * la registrazione dell'utente.
   * Se il valore del captcha non è nel formato corretto, l'errore viene segnalato all'utente.
   * Se la registrazione è avvenuta con successo, l'utente viene reindirizzato alla pagina di login.
   * Se non è stato possibile effettuare la registrazione, l'errore viene notificato all'utente e il CAPTCHA viene rigenerato.
   */
  signUp(): void {
    if (this._captchaModule?.getInput().length != 5) {
      this._captchaModule?.error('Controlla il formato!');
    } else if (this._captchaModule) {
      this._registrationService
        .signUp(
          this._signupForm.value.firstName,
          this._signupForm.value.lastName,
          this._signupForm.value.username,
          this._signupForm.value.email,
          this._signupForm.value.password,
          this._captchaModule.getToken(),
          this._captchaModule.getInput()
        )
        .subscribe((result) => {
          if (result.okay) {
            this._router.navigate(['/login']);
            this._snackBar.open('Registrazione avvenuta con successo!', 'OK');
          } else {
            switch (result.case) {
              case 'BAD_CAPTCHA':
                this._captchaModule?.clear();
                this._captchaModule?.error('OPS, ORARIO SCORRETTO!');
                this._ccService.ccInit().subscribe((response) => {
                  this._captchaModule?.fill(
                    response.cc_content,
                    response.cc_token
                  );
                });
                break;
              case 'USED_TOKEN':
                this._captchaModule?.clear();
                this._captchaModule?.error('Qualcosa è andato storto. Riprova');
                this._ccService.ccInit().subscribe((response) => {
                  this._captchaModule?.fill(
                    response.cc_content,
                    response.cc_token
                  );
                });
                break;
              case 'EXPIRED_TOKEN':
                this._captchaModule?.clear();
                this._captchaModule?.error('Il tempo è volato! Riprova');
                this._ccService.ccInit().subscribe((response) => {
                  this._captchaModule?.fill(
                    response.cc_content,
                    response.cc_token
                  );
                });
                break;
              case 'INVALID_FORMAT_FIRSTNAME':
                this.regenerateCaptcha();
                this._signupForm.get('firstName')?.setErrors({ pattern: true });
                break;
              case 'INVALID_FORMAT_LASTNAME':
                this.regenerateCaptcha();
                this._signupForm.get('lastName')?.setErrors({ pattern: true });
                break;
              case 'INVALID_FORMAT_USERNAME':
                this.regenerateCaptcha();
                this._signupForm.get('username')?.setErrors({ required: true });
                break;
              case 'INVALID_FORMAT_EMAIL':
                this.regenerateCaptcha();
                this._signupForm.get('email')?.setErrors({ pattern: true });
                break;
              case 'INVALID_FORMAT_PASSWORD':
                this.regenerateCaptcha();
                this._signupForm.get('password')?.setErrors({ pattern: true });
                break;

              case 'USED_EMAIL':
                this.regenerateCaptcha();
                this._signupForm
                  .get('email')
                  ?.setErrors({ alreadyExisted: true });
                break;

              default:
                this.regenerateCaptcha();
                this._snackBar.open(
                  'Errore interno al sito. Riprova tra qualche minuto.',
                  'OK'
                );
                break;
            }
          }
        });
    }
  }

  /**
   * Rigenera il CAPTCHA ripulendo il modulo corrente e richiedendone uno nuovo al servizio di back end.
   * Una volta ricevuta risposta dal server, aggiorna il modulo del CAPTCHA con il nuovo contenuto e il nuovo token generato.
   */
  private regenerateCaptcha() {
    this._captchaModule?.clear();
    this._ccService.ccInit().subscribe((response) => {
      this._captchaModule?.fill(response.cc_content, response.cc_token);
    });
  }
}
