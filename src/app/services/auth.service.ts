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
    console.log(cc_token);
    let Headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-secret-key': 'LQbHd5h334ciuy7'
    });

    return this.http.post<any>(this.apiUrl, { email, password, cc_token, cc_input}, { headers: Headers })
      .pipe(
        map(response => {
          console.log(response);
          if (response.status == 200) {
            const now = new Date();
            const expires = new Date(now.getTime() + (15 * 60 * 1000)); // Scadenza dopo 15 minuti
            this.cookieService.set('access_token', response.body.token, expires);
            this.cookieService.set('email', response.body.email, expires);
            this.cookieService.set('uName', response.body.userName, expires);

            this.email = response.body.email;
            this.uName = response.body.userName;

            return { success: true };
          } else {
            return { success: false, status: response.status }
          }
        }),
        catchError(error => {
          return of({ success: false, status: error.status });
        })
      );
  }

  getCanvas(): Observable<any> {
    let Headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-secret-key': 'LQbHd5h334ciuy7'
    });

    return this.http.get<any>('http://localhost:3000/clock-captcha', { headers: Headers })
      .pipe(
        map(response => {
            return { 
              cc_content: response.canvas_content,
              cc_token: response.token
            };
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
