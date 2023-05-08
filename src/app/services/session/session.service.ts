import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

import { environment } from '../../../environments/enviroment';
import { Observable, map, catchError, of, throwError } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private email: string | null = null;
  private uName: string | null = null;


  constructor(private _http: HttpClient, private _cookieService: CookieService) {
    this.email = this._cookieService.get('email');
    this.uName = this._cookieService.get('uName');
  }

  login(email: string, password: string, cc_token: string, cc_input: string): Observable<any> {
    let Headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-secret-key': 'LQbHd5h334ciuy7'
    });

    return this._http.post<any>(environment.backendLocation + 'session', { email, password, cc_token, cc_input }, { headers: Headers, observe: 'response'})
      .pipe(
        map(response => {
          if(response.status == 200){
            this._cookieService.set('access_token', response.body.session_token);
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
  logout(): void{
    this._cookieService.delete('access_token');
    this._cookieService.delete('email');
    this._cookieService.delete('uName');

    this.email = "";
    this.uName = "";
  }
  signUp(firstName: string, lastName:string, username: string, email: string, password: string, cc_token: string, cc_input: string): Observable<any>{
    let Headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-secret-key': 'LQbHd5h334ciuy7'
    });

    return this._http.post<any>(environment.backendLocation + 'users', { firstName, lastName, username, email, password, cc_token, cc_input }, { headers: Headers })
    .pipe(
        map(response => {
          if(response.status == 201){
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

  isSessionOpen() {
    return true;
  }
  getEmail(): string {
    return this.email ? this.email : "";
  }
  getUsername(): string {
    return this.uName ? this.uName : "Ospite";
  }
}
