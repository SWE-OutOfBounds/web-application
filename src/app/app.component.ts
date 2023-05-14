import { Component, OnInit} from '@angular/core';
import { SessionService } from './services/session/session.service';

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

export class AppComponent implements OnInit{

  constructor(private _sessionService: SessionService){}

  ngOnInit(): void {
    this._sessionService.autoLogin();
  }
}

