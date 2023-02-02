import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Validators } from '@angular/forms';

import { Canvg } from 'canvg';
// import { captchaDelivery, captchaValidation } from 'clock-captcha';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  _loginForm: FormGroup;
  hide: boolean = true;

  constructor() {
    console.log(document.getElementById('second'));

    this._loginForm = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });

  }

  ngOnInit() : void {
    this.setClock();
  }

  setClock() {
    let v = null;

    const canvas: HTMLCanvasElement | null = <HTMLCanvasElement>document.getElementById('clock-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;

    // Read the SVG string using the fromString method
    // of Canvg
    if (ctx) v = Canvg.fromString(ctx, `<svg id="clock" xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 600 600">
    <g id="face">
      <circle class="circle" cx="300" cy="300" r="253.9" fill="white" fill-rule="evenodd" stroke="black" stroke-width="9" stroke-miterlimit="10" />
      <path class="hour-marks" fill="none" stroke="#000" stroke-width="9" stroke-miterlimit="10"
        d="M300.5 94V61M506 300.5h32M300.5 506v33M94 300.5H60M411.3 107.8l7.9-13.8M493 190.2l13-7.4M492.1 411.4l16.5 9.5M411 492.3l8.9 15.3M189 492.3l-9.2 15.9M107.7 411L93 419.5M107.5 189.3l-17.1-9.9M188.1 108.2l-9-15.6" />
      <circle class="mid-circle" cx="300" cy="300" r="16.2" fill="black" />
    </g>
    <g id="hour" style="transform-origin: 300px 300px; transition: transform 0.5s ease-in-out; transform: rotate(`+ Math.random() * 360+`);">
      <path class="hour-arm" d="M300.5 298V142" fill="none" fill-rule="evenodd" stroke="black" stroke-width="17" stroke-miterlimit="10" />
      <circle class="sizing-box" cx="300" cy="300" r="253.9" fill="none" />
    </g>
    <g id="minute" style="transform-origin: 300px 300px; transition: transform 0.5s ease-in-out; transform: rotate(`+ Math.random() * 360+`);">
      <path class="minute-arm" d="M300.5 298V67" fill="none" fill-rule="evenodd" stroke="black" stroke-width="11" stroke-miterlimit="10" />
      <circle class="sizing-box" cx="300" cy="300" r="253.9" fill="none" />
    </g>
    <g id="second" style="transform-origin: 300px 300px; transition: transform 0.5s ease-in-out; transform: rotate(`+ Math.random() * 360+`);">
      <path class="second-arm" d="M300.5 350V55" fill="none" fill-rule="evenodd" stroke="black" stroke-width="4"  stroke-miterlimit="10" />
      <circle class="sizing-box" cx="300" cy="300" r="253.9" fill="none"/>
    </g>
    <line id="line" x1="50" y1="150" x2="1000" y2="600" stroke="black" stroke-width="7" />
    <line id="line" x1="200" y1="100" x2="300" y2="500" stroke="black" stroke-width="7"/>
    <line id="line" x1="1000" y1="50" x2="50" y2="500" stroke="black" stroke-width="7"/>
    <line id="line" x1="100" y1="250" x2="500" y2="450" stroke="black" stroke-width="7"/>
    <line id="line" x1="60" y1="300" x2="900" y2="50" stroke="black" stroke-width="7"/>
  </svg>`);

    // Start drawing the SVG on the canvas
    if (v) v.start();

    // Convert the Canvas to an image
    // var img = canvas.toDataURL("img/png");

    // canvas.setAttribute('background-image', img);

    // let HOURHAND: HTMLElement | null = document.getElementById("hour");
    // let MINUTEHAND: HTMLElement | null = document.getElementById("minute");
    // let SECONDHAND: HTMLElement | null = document.getElementById("second");

    // let hrPosition: Number = Math.random() * 360;
    // let minPosition: Number = Math.random() * 360;
    // let secPosition: Number = Math.random() * 360;

    // // Set the transformation for each arm
    // HOURHAND ? HOURHAND.style.transform = "rotate(" + hrPosition + "deg)" : null;
    // MINUTEHAND ? MINUTEHAND.style.transform = "rotate(" + minPosition + "deg)" : null;
    // SECONDHAND ? SECONDHAND.style.transform = "rotate(" + secPosition + "deg)" : null;
  }
}
