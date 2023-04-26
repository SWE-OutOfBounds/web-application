import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';

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


  constructor(private authService: AuthService, private router: Router) {
    this.authDetector = this.authService.isLoggedIn();
    this.userName = this.authService.getuName();
    this.userEmail = this.authService.getEmail();

    let firstLetter = this.userName.slice(0, 1).toUpperCase();
    let restOfString = this.userName.slice(1);
    this.userName = firstLetter + restOfString;
  }

  logOut() {
    this.authService.logout();
    this.authDetector == false;
    this.userName = "Ospite";
    this.userEmail = "";
    let currentUrl = this.router.url;
    this.router.navigateByUrl('/login', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }
}
