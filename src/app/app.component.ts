import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Validators } from '@angular/forms';

import { captchaModule } from '../../../clock-captcha/dist/index';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit{
  title: string = "loginPage";
  _loginForm: FormGroup;
  hide: boolean = true;
  _captchaModule : captchaModule | null = null;

  constructor() {
    console.log(document.getElementById('second'));

    this._loginForm = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });
    
  }
  ngOnInit(): void {
    this._captchaModule = new captchaModule();
    this._captchaModule.show(document.getElementById('clock-captcha'));
  }
}
