import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '../../services/session/session.service';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent {
  authDetector: boolean = false;

  backGroundImage: string = 'url(../../assets/images/defaultProfilePic.png)';
  userName: string = "";
  userEmail: string = "";


  constructor(protected _sessionService: SessionService, private _router: Router) {
    // this.authDetector = this.authService.isLoggedIn();
    this.userName = this._sessionService.getUsername();
    this.userEmail = this._sessionService.getEmail();

    let firstLetter = this.userName.slice(0, 1).toUpperCase();
    let restOfstring = this.userName.slice(1);
    this.userName = firstLetter + restOfstring;
  }

  logOut() {
    this._sessionService.logout();
    this.authDetector == false;
    this.userName = "Ospite";
    this.userEmail = "";
    let currentUrl = this._router.url;
    this._router.navigateByUrl('/login', { skipLocationChange: true }).then(() => {
      this._router.navigate([currentUrl]);
    });
  }
}
