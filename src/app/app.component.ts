import { Component, OnInit } from '@angular/core';
import { SessionService } from './services/session/session.service';

/**
 * Componente 'radice' dell'applicazione,
 * rappresenta il livello più alto da cui ha origine l'applicazione
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})

/*
  Al caricamento dell'applicazione si procede con la verifica della sessione:
  - se la sessione era aperta, quindi dati presenti nei cookies, la funzione autoLogin caricherà i dati dell'utente,
  - se la sessione era chiusa, quindi nessun dato nei cookies, la funzione autoLogin ritornerà null e l'utente risulterà come ospite non autenticato.
*/
export class AppComponent implements OnInit {
  /**
   * Costruttore di app.component responsabile dell'avvio dell'applicazione
   *
   * @param _sessionService servizio che gestisce la sessione dell'utente
   */
  constructor(private _sessionService: SessionService) {}

  /**
   * In fase di inizializzazione il servizio di sessione avvia la funzione di autoLogin per verificare ed eventualmente
   * ristabilire la sessione già aperta dell'utente
   */
  ngOnInit(): void {
    this._sessionService.autoLogin();
  }
}
