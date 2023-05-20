import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable, map } from 'rxjs';
import { SessionService } from '../services/session/session.service';

@Injectable({
  providedIn: 'root',
})
/**
 * Guardia che serve a gestire:
 *  -l'apertura delle pagine quando l'utente non è autenticato
 *  -la chiusura delle pagine quando l'utente ha effettuato l'autenticazione
 */
export class NotAuthGuard implements CanActivate {
  /**
   * Costruttore della guardia
   *
   * @param _sessionService Consente di accedere ai dati di sessione per verificarne l'apertura
   * @param _router Consente di modificare la navigazione in caso di utente autenticato
   */
  constructor(
    private _sessionService: SessionService,
    private _router: Router
  ) {}

  /**
   * Determina quando una route può essere attivata sulla base della sessione utente:
   * Se la sessione non è aperta, la pagina che presenta la guardia può essere visitata.
   * Se la sessione è aperta, la pagina sottoposta a guardia verrà reindirizzata verso la home
   *
   * @param next ActivatedRouteSnapshot contiene le informazioni su la route successiva
   * @param state RouterStateSnapshot contiene informazioni sulla route corrente
   * @returns Un Observable che indica quando la route può essere attivata o quando deve essere reindirizzata
   */
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this._sessionService.user.pipe(
      map((user) => {
        if (!user) {
          return true;
        } else {
          //sessione già attiva reindirizza alla home page
          return this._router.parseUrl('');
        }
      })
    );
  }
}
