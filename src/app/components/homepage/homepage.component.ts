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

  isSessionOpen: boolean = false;
  private userSub: Subscription = new Subscription();

  backGroundImage: string = 'url(../../assets/images/defaultProfilePic.png)';
  userName: string = "";
  userEmail: string = "";


  constructor(protected _sessionService: SessionService, private _router: Router) { }

  ngOnInit(): void {
    this.userSub = this._sessionService.user.subscribe(user => {

      // inizializzo le variabili sulla base del valore utente:
      // se l'utente è stato definito, considero la sessione aperta e carico i dati dell'utente da visualizzare nella home,
      // altrimenti la sessione è chiusa e i dati sono valori di default

      this.isSessionOpen = !user ? false : true;
      this.userName = !user ? 'Ospite' : user.name;
      this.userEmail = !user ? '' : user.email;
    });
  }


  /**
   * Effettua il logout dell'utente autenticato, ne cancella i dati ed esegue il refresch della pagina.
   * Nome e Email vengono riportati ai corrispettivi valori di default
   */
  logOut(): void {
    //chiude la sessione
    this._sessionService.logout();

    //ripristina i valori di default
    this.userName = "Ospite";
    this.userEmail = "";

    //aggiorna la pagina
    let currentUrl = this._router.url;
    this._router.navigateByUrl('/login', { skipLocationChange: true }).then(() => {
      this._router.navigate([currentUrl]);
    });
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }
}
