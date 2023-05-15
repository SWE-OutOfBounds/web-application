import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, map } from 'rxjs';
import { SessionService } from '../services/session/session.service';

@Injectable({
  providedIn: 'root'
})
export class NotAuthGuard implements CanActivate {
  constructor(private _sessionService: SessionService, private _router: Router) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean |Observable<boolean | UrlTree> | Promise<boolean> | UrlTree {

    return this._sessionService.user.pipe(map(user => {
      if (!user){
        //la sessione non è aperta per cui la pagina a cui si applica la guardia può essere attiva
        return true;
      }
      else {
        //sessione già aperta, la pagina a cui si sta tentando di accedere, protetta da guardia, deve essere reindirizzata alla home
        return this._router.parseUrl('');
      }
    }))

  }

  }


