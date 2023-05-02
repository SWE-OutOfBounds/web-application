import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

import { environment } from '../../../environments/enviroment';
import { Observable, map, catchError, of, throwError } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private email: string | null = null;
  private uName: string | null = null;


  constructor(private http: HttpClient, private cookieService: CookieService) {
    this.email = this.cookieService.get('email');
    this.uName = this.cookieService.get('uName');
  }

  login(email: string, password: string, cc_token: string, cc_input: string): Observable<any> {
    let Headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-secret-key': 'LQbHd5h334ciuy7'
    });

    return this.http.post<any>(environment.backendLocation + 'session', { email, password, cc_token, cc_input }, { headers: Headers, observe: 'response'})
      .pipe(
        map(response => {
          if(response.status == 200){
            this.cookieService.set('access_token', response.body.session_token);
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

  getEmail(): string {
    return this.email ? this.email : "";

  }

  getuName(): string {
    return this.uName ? this.uName : "Ospite";
  }

  logout() {
    this.cookieService.delete('access_token');
    this.cookieService.delete('email');
    this.cookieService.delete('uName');

    this.email = "";
    this.uName = "";
  }

  isLoggedIn() {
    return this.cookieService.get('access_token') !== '';
  }

  getToken() {
    return this.cookieService.get('access_token');
  }

  signUp(firstName: string, lastName:string, username: string, email: string, password: string, cc_token: string, cc_input: string){
    let Headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-secret-key': 'LQbHd5h334ciuy7'
    });

    console.log('doing signUp');
    return this.http.post<any>(environment.backendLocation + 'users', { firstName, lastName, username, email, password, cc_token, cc_input }, { headers: Headers })
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
          console.log(error);
          return of({ okay: false, case: error.error });
        })
      );
  }
}
