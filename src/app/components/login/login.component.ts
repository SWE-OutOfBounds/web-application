import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Validators } from '@angular/forms';
import { SessionService } from '../../services/session/session.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { ClockCAPTCHAView } from '../../../../../clock-captcha/dist';
import { ClockCaptchaService } from 'src/app/services/clock-captcha/clock-captcha.service';

/**
 * Componente dedicata alla gestione dell'accesso al sistema. Le principali funzioni sono:
 *  - Visualizzare e gestire il form di accesso
 *  - Gestire la chiamata al servizio di sessione per aprire la sessione ed effettuare l'accesso
 *  - Visualizzare eventuali errori in fase di accesso al sistema
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  /**
   * Form per la gestione dei dati inseriri dall'utente per accedere al sistema
   */
  protected _loginForm: FormGroup;
  /**
   * Variabile booleana che serve a gestire la visualizzazione della password:
   *    nascosta se hide == true,
   *    in chiaro se hide == false.
   */
  protected _hide: boolean = true;
  /**
   * Modulo di test per la visualizzazione del CAPTCHA
   */
  private _captchaModule: ClockCAPTCHAView;
  /**
   * Definisce il messaggio di errore in caso di problemi nel caricamento dell'immagine del clock-CAPTCHA
   */
  public errorMessage: string = '';

  /**
   * Costruttore della componente di Login
   *
   * @param _router Servizio di router per poter navigare fuori dalla pagina a compimento dell'azione di log in o per passare alla pagina di registrazione
   * @param _snackBar Servizio di MatSnackBar per visualizzare messaggio di errore interno al sistema
   * @param _sessionService Servizio di sessione per gestire l'apertura della sessione
   * @param _ccService Servizio clock-CAPTCHA per gestire il modulo di test
   */
  constructor(
    private _router: Router,
    private _snackBar: MatSnackBar,
    private _sessionService: SessionService,
    private _ccService: ClockCaptchaService
  ) {
    /**
     * costruzione del form, impostando i seguenti controlli:
     * email: requisito obbligatorio e formato standard dell'email (esempio@esempio.com),
     * password: requisito obbligatorio, non si specifica il pattern per motivi di sicurezza
     */
    this._loginForm = new FormGroup({
      email: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/),
      ]),
      password: new FormControl('', Validators.required),
    });

    //costruzione del modulo di test tramite importazione della libreria
    this._captchaModule = new ClockCAPTCHAView();
  }

  /**
   * Inizializzazione del modulo di test
   */
  ngOnInit(): void {
    // sostituisce l'ancora con il modulo di test, istanziando il form
    this._captchaModule.inject(document.getElementById('clock-captcha'));
    //istanziando l'immagine del test con valore temporale limitato
    setTimeout(() => {
      this._ccService.ccInit().subscribe((response) => {
        if (response.cc_content && response.cc_token)
          this._captchaModule.fill(response.cc_content, response.cc_token);
        else {
          this.errorMessage =
            'Si è verificato un errore nel recupero del test, per cui al momento non è possibile accedere al nostro sistema. Si prega di riprovare più tardi.';
        }
      });
    }, 2000);
  }

  /**
   * Utilizza gli input forniti dall'utente (email, password e ora del captcha) per effettuare l'accesso.
   * Se il valore del captcha non è nel formato corretto, l'errore viene segnalato all'utente.
   * Se il login è avvenuto con successo, l'utente viene reindirizzato alla home.
   * Se non è stato possibile effettuare l'accesso, l'errore viene notificato all'utente e il CAPTCHA viene rigenerato.
   */
  login(): void {
    //verifica della validità dell'input fornito nel modulo di test
    if (this._captchaModule?.getInput().length != 5) {
      //input non valido
      this._captchaModule?.error('Controlla il formato!');
    } else if (this._captchaModule.getToken())
      // input valido e token fornito correttamente, si procede con la chiamata al servizio di sessione per effettuare l'accesso al sistema
      this._sessionService
        .login(
          this._loginForm.value.email,
          this._loginForm.value.password,
          this._captchaModule.getToken(),
          this._captchaModule.getInput()
        )
        .subscribe((result) => {
          if (result.okay) {
            //login avvenuto con successo apre la pagina di home
            this._router.navigate(['']);
          } else {
            // login non riuscita, comunica all'utente un messaggio diverso a seconda del tipo di errore e ripristino del modulo di test
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

              case 'INVALID_EMAIL_FORMAT':
                this.regenerateCaptcha();
                this._loginForm
                  .get('email')
                  ?.setErrors({ wrongCredentialError: true });
                this._loginForm
                  .get('password')
                  ?.setErrors({ wrongCredentialError: true });
                break;

              case 'INVALID_PASSWORD_FORMAT':
                this.regenerateCaptcha();
                this._loginForm
                  .get('email')
                  ?.setErrors({ wrongCredentialError: true });
                this._loginForm
                  .get('password')
                  ?.setErrors({ wrongCredentialError: true });
                break;

              case 'BAD_CREDENTIAL':
                this.regenerateCaptcha();
                this._loginForm
                  .get('email')
                  ?.setErrors({ wrongCredentialError: true });
                this._loginForm
                  .get('password')
                  ?.setErrors({ wrongCredentialError: true });
                break;

              default:
                this.regenerateCaptcha();
                this._snackBar.open(
                  'Errore interno al sito. Riprova tra qualche minuto.',
                  'Ok'
                );
                break;
            }
          }
        });
  }

  /**
   * Rigenera il CAPTCHA ripulendo il modulo corrente e richiedendone uno nuovo al servizio di back end.
   * Una volta ricevuta risposta dal server, aggiorna il modulo del CAPTCHA con il nuovo contenuto e il nuovo token generato.
   */
  private regenerateCaptcha(): void {
    this._captchaModule?.clear();
    this._ccService.ccInit().subscribe((response) => {
      this._captchaModule?.fill(response.cc_content, response.cc_token);
    });
  }
}
