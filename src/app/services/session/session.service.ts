import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

import { environment } from '../../../environments/enviroment';
import { Observable, map, catchError, of, BehaviorSubject } from 'rxjs';
import { User } from './user.model';

/**
 * Interfaccia che definisce il tipo di risposta fornita dal backend in fase di accesso al sistema
 */
export interface LoginResponse {
  /**
   * Nome utente definito in fase di registrazione
   */
  username: string;
  /**
   * Token per la gestione della sessione utente
   */
  session_token: string;
  /**
   * Tempo di validità del token prima della sua scadenza
   */
  expiredIn: number;
}

@Injectable({
  providedIn: 'root',
})
/**
 * Servizio che consente l'apertura e chiusura di sessione dell'utente che si sta autenticando
 */
export class SessionService {
  public user = new BehaviorSubject<User | null>(null);
  private tokenExpirationTimer: NodeJS.Timeout | null = null;

  /**
   * Costruttore del servizio di Sessione
   *
   * @param _http Consente la gestione delle chiamate al backend
   * @param _cookieService Consente la memorizzazione e il recupero dei dati nei cookies
   */
  constructor(
    private _http: HttpClient,
    private _cookieService: CookieService
  ) {}

  /**
   * Utilizza i dati forniti dall'utente per effettuare la chiamata al back end ed eseguire l'accesso dell'utente.
   *
   * @param email - Email fornita dall'utente
   * @param password - Password fornita dall'utente
   * @param cc_token - Token del clock CAPTCHA
   * @param cc_input - Input fornito dall'utente nella risoluzione del clock CAPTCHA
   * @returns Un Observable che emette un oggetto avente due proprietà:
   *          OKAY: boolan, è vera quando il login è avenuto con successo e falsa se si è verificato un errore durante il login,
   *          CASE: string, in caso di errore 'case' contiene i dettagli dell'errore generato
   */
  login(
    email: string,
    password: string,
    cc_token: string,
    cc_input: string
  ): Observable<any> {
    let Headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-secret-key': 'LQbHd5h334ciuy7',
    });

    return this._http
      .post<LoginResponse>(
        environment.backendLocation + 'session',
        { email, password, cc_token, cc_input },
        { headers: Headers, observe: 'response' }
      )
      .pipe(
        map((response) => {
          if (response.status == 200 && response.body) {
            // credenziali corrette, utente registrato nel database, per cui creo definisco la sessione dell'utente
            const _timeEndSession: Date = new Date(
              new Date().getTime() + response.body.expiredIn * 1000
            );
            const loggedUser = new User(
              response.body.username,
              email,
              response.body.session_token,
              _timeEndSession
            );
            this.user.next(loggedUser);
            this.autoLogout(response.body.expiredIn * 1000);

            //memorizzo i dati della sessione nei cookies in modo da non perdere l'accesso al ricaricamento della pagina
            this._cookieService.set('user_data', JSON.stringify(this.user));

            return { okay: true };
          } else {
            return { okay: false, case: '???' };
          }
        }),
        catchError((error) => {
          //4xx and 5xx codes
          return of({ okay: false, case: error.error.details });
        })
      );
  }

  /**
   * Consente l'accesso automatico ripristinando i dati dell'utente memorizzati nei cookies.
   * Se non ci sono dati memorizzati o il token è scaduto la funzione non fa niente,
   * Se il token è ancora valido, la funzione ripristina i dati e aggiorna il tempo rimanente prima che la sessione scada.
   *
   */
  autoLogin(): void {
    if (!this._cookieService.get('user_data')) {
      // nessun dato memorizzato per cui utente non autenticato
      return;
    }

    // recupera i dati memorizzati e li ripristina
    const storedData: {
      _value: any;
      name: string;
      email: string;
      _sessionToken: string;
      _tokenExpDate: Date;
    } = JSON.parse(this._cookieService.get('user_data'));

    const storedTime: Date = new Date(storedData._value._tokenExpDate);

    const loadedUser = new User(
      storedData._value.name,
      storedData._value.email,
      storedData._value._sessionToken,
      storedTime
    );

    if (loadedUser.token) {
      // token valido
      this.user.next(loadedUser);
      const expirationDuration =
        new Date(storedTime).getTime() - new Date().getTime();
      this.autoLogout(expirationDuration);
    }
  }

  /**
   * Effettua il log out dell'utente, cancellandone i dati di sessione memorizzati e interrompendo il timer che porta alla chiusura automatica della sessione
   */
  logout(): void {
    // resetta tutti i dati della sessione aperta dall'utente
    this.user.next(null);
    this._cookieService.delete('user_data');

    // interrompe, se presente, il timer che porta alla chiusura automatica della sessione
    this.clearTokenExpirationTimer();
  }

  /**
   * Imposta un timer per effettuare il log out automatico dell'utente autenticato
   *
   * @param expirationDuration - Durata, in millisecondi, dopo la quale verrà effettuato il log out automatico
   */
  autoLogout(expirationDuration: number): void {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  /**
   * metodo che serve per resettare il timer di fine sessione
   */
  private clearTokenExpirationTimer(): void {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
  }
}
