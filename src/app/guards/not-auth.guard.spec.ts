import { NotAuthGuard } from './not-auth.guard';
import {
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { SessionService } from '../services/session/session.service';
import { BehaviorSubject } from 'rxjs';
import { User } from '../services/session/user.model';

describe('NotAuthGuard', () => {
  let guard: NotAuthGuard;
  let sessionService: SessionService;
  let router: Router;

  beforeEach(() => {
    sessionService = {
      user: new BehaviorSubject<User | null>(null),
    } as any;

    router = jasmine.createSpyObj('Router', ['parseUrl']);
    guard = new NotAuthGuard(sessionService, router);
  });

  /**
   * Verifica se la guardia consente l'accesso alla pagina nel caso in cui nessun dato utente sia presente nei cookies
   */
  it('should allow activation if user session is not open', (done) => {
    sessionService.user.next(null);

    const next: ActivatedRouteSnapshot = {} as ActivatedRouteSnapshot;
    const state: RouterStateSnapshot = {} as RouterStateSnapshot;

    guard.canActivate(next, state).subscribe((result) => {
      expect(result).toBeTrue();
      done();
    });
  });

  /**
   * Verifica se la guardia reindirizza alla pagina di home nel caso in cui l'utente non abbia la sessione aperta
   */
  it('should redirect to home page if user session is open', (done) => {
    sessionService.user.next({} as User);

    const next: ActivatedRouteSnapshot = {} as ActivatedRouteSnapshot;
    const state: RouterStateSnapshot = {} as RouterStateSnapshot;

    //indirizzo su cui eseguire il reindirizzamento
    const expectedUrlTree: UrlTree = router.parseUrl('');

    guard.canActivate(next, state).subscribe((result) => {
      expect(result).toEqual(expectedUrlTree);
      done();
    });
  });
});
