import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../../../environments/enviroment';
import { Observable, map, catchError, of } from 'rxjs';

/**
 * Interfaccia che definisce il tipo di risposta che si deve ricevere in fase di registrazione
 */
export interface SignUpResponse {
  /**
   * Messaggio descrittivo che accompagna lo stato di risposta ricevuto dal backend in fase di registrazione
   */
    details: string
}


@Injectable({
  providedIn: 'root'
})
export class RegistrationService {

  /**
   * Costruttore del servizio di Registrazione
   *
   * @param _http Consente la gestione delle chiamate al backend
   */
  constructor(private _http: HttpClient) { }

  /**
   * Effettua la chiamata al backend per creare l'account di un nuovo utente
   *
   * @param firstName - Nome dell'utente
   * @param lastName - Cognome dell'utente
   * @param username - Username fornito dall'utente
   * @param email - Email dell'utente
   * @param password - Password dell'utente
   * @param cc_token - Token generato dal modulo di clock CAPTCHA
   * @param cc_input - Input fornito dall'utente nella risoluzione del clock CAPTCHA
   * @returns Un Observable che si risolve in un oggetto che indica l'esito, positivo o negativo, dell'operazione di registrazione.
   */
  signUp(firstName: string, lastName:string, username: string, email: string, password: string, cc_token: string, cc_input: string): Observable<any>{
    let Headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-secret-key': 'LQbHd5h334ciuy7'
    });

    return this._http.post<SignUpResponse>(environment.backendLocation + 'users', { firstName, lastName, username, email, password, cc_token, cc_input }, { headers: Headers })
    .pipe(
        map(response => {
          if(response.details == 'CREATED'){
            return {okay : true};
          }else{
            return {okay : false, case: "???"}
          }
        }),
        catchError(error => {
          //4xx and 5xx codes
          return of({ okay: false, case: error.error.details });
        })
      );
  }

}
