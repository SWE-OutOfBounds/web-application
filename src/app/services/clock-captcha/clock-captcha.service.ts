import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, of, throwError } from 'rxjs';
import { environment } from 'src/environments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class ClockCaptchaService {

  constructor(private _http: HttpClient) { }

  ccInit(): Observable<any> {
    let Headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-secret-key': environment.cc_key,
    });

    return this._http.get<any>(environment.backendLocation + 'clock-captcha', { headers: Headers, observe: 'response' })
      .pipe(
        map(response => {
          return {
            cc_content: response.body.canvas_content,
            cc_token: response.body.token
          };
        }),
        catchError(error => {
          console.log(error);
          return of({ success: false, status: error.status });
        })

      );
  }
}
