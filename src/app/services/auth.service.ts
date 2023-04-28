import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders} from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

import { environment } from '../../environments/enviroment';
import { Observable, map, catchError, of, throwError } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl: string = environment.authApiUrl;
  private email: string = "";
  private uName: string = "";


  constructor(private http: HttpClient, private cookieService: CookieService) {
    this.email = this.cookieService.get('email');
    this.uName = this.cookieService.get('uName');
  }

  login(email: string, password: string, cc_token: string, cc_input: string): Observable<any> {
    let Headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-secret-key': 'LQbHd5h334ciuy7'
    });
    
    console.log(' ciao');
    return this.http.post<any>(this.apiUrl, { email, password, cc_token, cc_input}, { headers: Headers })
    .pipe(
      map(response => {

            this.cookieService.set('access_token', response.session_token);

            return { success: true };
        }),
        catchError(error => {
          console.log(error);
          return of({ success: false, status: error.status });
        })
      );
  }

  getEmail(): string {
    return this.email != "" ? this.email : "";

  }

  getuName(): string {
    return this.uName != "" ? this.uName : "Ospite";
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
}
