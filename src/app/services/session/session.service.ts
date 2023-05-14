import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

import { environment } from '../../../environments/enviroment';
import { Observable, map, catchError, of, throwError, Subject, BehaviorSubject } from 'rxjs';
import { User } from './user.model';
import { __values } from 'tslib';

//Definisco il tipo di risposta che si deve ricevere in fase di login
export interface LoginResponseData {
    session_token: string
}


@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private email: string | null = null;
  private uName: string | null = null;
  private isSessionOpen: boolean = false;
  private tokenExpirationTimer: any; // devo dare un tempo limite
  private expireIn: number = 15; // tempo consentito

  // definisco l'utente che dovrà essere aggiornato ogni volta che l'utente effettua un login o un logout
  user = new BehaviorSubject<User | null>(null);

  constructor(private _http: HttpClient, private _cookieService: CookieService) {
    //this.email = this._cookieService.get('email');
    //this.uName = this._cookieService.get('uName');
  }

  login(email: string, password: string, cc_token: string, cc_input: string): Observable<any> {
    let Headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-secret-key': 'LQbHd5h334ciuy7'
    });

    return this._http.post<LoginResponseData>(environment.backendLocation + 'session', { email, password, cc_token, cc_input }, { headers: Headers, observe: 'response'})
      .pipe(
        map(response => {
          if(response.status == 200 && response.body){
            // credenziali corrette, utente registrato nel database, per cui creo definisco la sessione dell'utente
            const _timeEndSession: Date = new Date( new Date().getTime() + this.expireIn*1000 );
            console.log('orario token in fase di LOGIN: '+_timeEndSession)
            const loggedUser = new User(email, response.body.session_token, _timeEndSession );

            this.user.next(loggedUser)
            this.autoLogout(this.expireIn*1000);

            //memorizzo i dati della sessione nei cookies in modo da non perdere l'accesso al ricaricamento della pagina
            this._cookieService.set('user_data', JSON.stringify(this.user));

            this.isSessionOpen = true;
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

  autoLogin(): void{
    // verifico se l'utente era autenticato co
    if(!this._cookieService.get('user_data')){
      return;
    }

    //recupero i dati memorizzati nei cookies
    const storedData: {
      _value: any;
      email: string,
     _sessionToken: string,
     _tokenExpDate: Date
    } = JSON.parse(this._cookieService.get('user_data'));

    const storedTime: Date = new Date(storedData._value._tokenExpDate);

    // utente autenticato, ripristino la sessione se il token è ancora valido
    const loadedUser = new User(
      storedData._value.email,
      storedData._value._sessionToken,
      storedTime
    );

    // devo controllare che sia effettivamente chi dice di essere?

    if(loadedUser.token){
      // il token non è stato cancellato per cui è ancora valido
      this.user.next(loadedUser);
      this.autoLogout(this.expireIn*1000);
    }

  }

  logout(): void{
    // la sessione dell'utente viene annullata
    this.user.next(null);
    this._cookieService.delete('user_data');
    console.log('DONE')


    //this._cookieService.delete('access_token');
    //this._cookieService.delete('email');
    //this._cookieService.delete('uName');

    // this.email = "";
    // this.uName = "";

    // this.isSessionOpen = false;

    // azzero il timer
    if(this.tokenExpirationTimer){
      clearTimeout(this.tokenExpirationTimer);
    }

    this.tokenExpirationTimer = null;


  }

  autoLogout(expirationDuration: number){
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    },expirationDuration);

  }

  signUp(firstName: string, lastName:string, username: string, email: string, password: string, cc_token: string, cc_input: string): Observable<any>{
    let Headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-secret-key': 'LQbHd5h334ciuy7'
    });

    return this._http.post<any>(environment.backendLocation + 'users', { firstName, lastName, username, email, password, cc_token, cc_input }, { headers: Headers })
    .pipe(
        map(response => {
          if(response == 'created'){
          //if(response.status == 201){
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

  // isSessionOpen() {
  //   return true;
  // cookie se sono aperti tempo scadenza
  // }

  getSessionStatus(): boolean {
    return this.isSessionOpen;
  }

  getEmail(): string {
    return this.email ? this.email : "";
  }
  getUsername(): string {
    return this.uName ? this.uName : "Ospite";
  }
}
