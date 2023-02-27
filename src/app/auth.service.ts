import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

import { environment } from '../environments/enviroment';
import { Observable, map, catchError, of, throwError } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl: string = environment.authApiUrl;
  private token: string | null= this.cookieService.get('access_token') || null;

  constructor(private http: HttpClient, private cookieService: CookieService) { }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { email, password }, { observe: 'response' })
      .pipe(
        map(response => {
          if (response.status == 200) {
            const now = new Date();
            const expires = new Date(now.getTime() + (15 * 60 * 1000)); // Scadenza dopo 15 minuti
            this.cookieService.set('access_token', response.body.token, expires);
            return { success: true };
          }else{
            return { success: false, status: response.status}
          }
        }),
        catchError(error => {
          return of({success: false, status: error.status});
        })
      );
  }

  logout() {
    this.token = null;
    this.cookieService.delete('access_token');
  }

  isLoggedIn() {
    return this.token !== null && this.token !== undefined;
  }

  getToken() {
    return this.token;
  }
}
