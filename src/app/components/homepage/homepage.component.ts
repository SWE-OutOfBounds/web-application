import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '../../services/session/session.service';
import { Subscription } from 'rxjs';

/**
 * Componente che definisce e gestisce la pagina della home.
 * Se l'utente non è autenticato verrà considerato Ospite e sarà invitato ad accedere al sistema.
 * Se l'utente ha eseguito l'accesso visualizzerà i propri dati, con la possibilità di chiudere la sessione.
 */
@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css'],
})
export class HomepageComponent implements OnInit, OnDestroy {
  /**
   * Indica se la sessione è aperta
   */
  isSessionOpen: boolean = false;

  /**
   * Rappresenta la sottoscrizione dei dati dell'utente.
   * Questa è usata per gestire la sottoscrizione e prevenire memory leaks.
   */
  private userSub: Subscription = new Subscription();

  /**
   * Immagine che rappresenta il profilo utente
   */
  backGroundImage: string = 'url(../../assets/images/defaultProfilePic.png)';
  /**
   * Nome utente che può avere:
   * un valore di default in caso di utente non autenticato,
   * oppure il nome scelto dall'utente in caso di sessione aperta.
   */
  userName: string = '';
  /**
   * Indirizzo email. Esso contiene un valore solo quando l'utente ha eseguito l'accesso.
   */
  userEmail: string = '';
  /**
   * Indirizzo corrente della navigazione.
   */
  currentUrl = this._router.url;

  /**
   * Costruttore della pagina di home
   *
   * @param _sessionService Consente il recupero e la gestione dei dati di sessione
   * @param _router Consente di gestire la navigazione tra le pagine
   */
  constructor(
    protected _sessionService: SessionService,
    private _router: Router
  ) {}

  /**
   * Inizializza le variabili sulla base del valore utente:
   * Se l'utente è stato definito, considera la sessione aperta e carica i dati dell'utente da visualizzare nella home.
   * Se l'utente non è stato defnito la sessione è chiusa e i dati utente vengono inizializzati con valori di default.
   */
  ngOnInit(): void {
    this.userSub = this._sessionService.user.subscribe((user) => {
      this.isSessionOpen = !user ? false : true;
      this.userName = !user ? 'Ospite' : user.name;
      this.userEmail = !user ? '' : user.email;
    });
  }

  /**
   * Effettua il log out dell'utente autenticato, ne cancella i dati ed esegue il refresch della pagina.
   * Nome e Email vengono riportati ai corrispettivi valori di default
   */
  logOut(): void {
    //chiude la sessione
    this._sessionService.logout();

    //ripristina i valori di default
    this.userName = 'Ospite';
    this.userEmail = '';

    //aggiorna la pagina
    this._router
      .navigateByUrl('/login', { skipLocationChange: true })
      .then(() => {
        this._router.navigate([this.currentUrl]);
      });
  }

  /**
   * Alla distruzione della componente, viene eseguito l'annullamento della sottoscrizione per prevenire memory leak
   */
  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }
}
