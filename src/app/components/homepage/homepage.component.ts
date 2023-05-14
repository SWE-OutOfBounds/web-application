import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '../../services/session/session.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit, OnDestroy{
  //authDetector: boolean = false;
  isSessionOpen: boolean = false;
  private userSub: Subscription = new Subscription();

  backGroundImage: string = 'url(../../assets/images/defaultProfilePic.png)';
  userName: string = "";
  userEmail: string = "";


  constructor(protected _sessionService: SessionService, private _router: Router) {
    // this.authDetector = this.authService.isLoggedIn();
    //this.userName = this._sessionService.getUsername();
    //this.userEmail = this._sessionService.getEmail();

    //let firstLetter = this.userName.slice(0, 1).toUpperCase();
    //let restOfstring = this.userName.slice(1);
    //this.userName = firstLetter + restOfstring;

  }

  ngOnInit(): void {
    this.userSub = this._sessionService.user.subscribe(user => {
      this.isSessionOpen = !user ? false : true;
    });
  }


  logOut() {
    this._sessionService.logout();
    //this.authDetector == false;
    this.userName = "Ospite";
    this.userEmail = "";
    let currentUrl = this._router.url;
    this._router.navigateByUrl('/login', { skipLocationChange: true }).then(() => {
      this._router.navigate([currentUrl]);
    });
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }
}
