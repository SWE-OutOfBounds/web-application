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
        return true;
      }
      else {
        return this._router.parseUrl('');
      }
    }))

  }

  }


