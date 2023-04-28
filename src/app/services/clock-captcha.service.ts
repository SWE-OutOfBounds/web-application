import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders} from '@angular/common/http';
import { Observable, map, catchError, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClockCaptchaService {

  constructor(private http: HttpClient) { }

  ccInit() : Observable<any> {
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
}
