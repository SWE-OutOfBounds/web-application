import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Validators } from '@angular/forms';
// import { captchaDelivery, captchaValidation } from 'clock-captcha';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  _loginForm : FormGroup;
  hide: boolean = true;
  constructor(){
    this._loginForm = new FormGroup({
      username : new FormControl('', Validators.required),
      password : new FormControl('', Validators.required)
    });
  }
}
