import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { CookieService } from 'ngx-cookie-service';

import { environment } from '../../../environments/enviroment';
import { SessionService } from './session.service';
import { User } from './user.model';

describe('SessionService', () => {
  let service: SessionService;
  let httpMock: HttpTestingController;
  let cookieService: CookieService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CookieService, SessionService],
    });
    service = TestBed.inject(SessionService);
    httpMock = TestBed.inject(HttpTestingController);
    cookieService = TestBed.inject(CookieService);
  });

  afterEach(() => {
    httpMock.verify();
    cookieService.deleteAll();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    const email = 'johndoe@example.com';
    const password = 'password123';
    const cc_token = 'token123';
    const cc_input = 'input123';

    /**
     * Verifica la funzione di login quando ha successo
     */
    it('should return an object with okay true if the response status is 200 and response body exists', () => {
      const mockResponse = {
        username: 'testName',
        session_token: 'session_token_value',
        expiredIn: 3600,
      };

      spyOn(service.user, 'next');
      spyOn(service, 'autoLogout');
      spyOn(cookieService, 'set').and.stub();

      service
        .login(email, password, cc_token, cc_input)
        .subscribe((response) => {
          //verifica sessione utente
          expect(service.user.next).toHaveBeenCalledWith(
            jasmine.objectContaining({
              name: mockResponse.username,
              email: email,
              _sessionToken: mockResponse.session_token,
              _tokenExpDate: jasmine.any(Date),
            })
          );
          //verifica la chiamata ad autoLogout
          expect(service.autoLogout).toHaveBeenCalledWith(
            mockResponse.expiredIn * 1000
          );
          //verifica salvataggio dati nei cookie
          expect(cookieService.set).toHaveBeenCalledWith(
            'user_data',
            jasmine.any(String)
          );
          //test se ritorna effettivamente okay: true
          expect(response).toEqual({ okay: true });
        });

      const req = httpMock.expectOne(`${environment.backendLocation}session`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });

    /**
     * Verifica la risposta del servizio in caso di errore 4xx
     */
    it('should return an object with okay false and the error case if the response status is 400', () => {
      const mockResponse = {
        details: 'SOME_ERROR',
      };

      spyOn(service.user, 'next');
      spyOn(service, 'autoLogout');
      spyOn(cookieService, 'set').and.stub();

      service
        .login(email, password, cc_token, cc_input)
        .subscribe((response) => {
          expect(response).toEqual({ okay: false, case: 'SOME_ERROR' });
          expect(service.user.next).not.toHaveBeenCalled();
          expect(service.autoLogout).not.toHaveBeenCalled();
          expect(cookieService.set).not.toHaveBeenCalled();
        });

      const req = httpMock.expectOne(`${environment.backendLocation}session`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse, { status: 400, statusText: 'Bad Request' });
    });

    /**
     * Verifica la risposta del servizio in caso di errore 5xx
     */
    it('should return an object with okay false and the error case if the response status is 500', () => {
      const mockErrorResponse = {
        details: 'INTERNAL_SERVER_ERROR',
      };

      spyOn(service.user, 'next');
      spyOn(service, 'autoLogout');
      spyOn(cookieService, 'set').and.stub();

      service
        .login(email, password, cc_token, cc_input)
        .subscribe((response) => {
          expect(response).toEqual({
            okay: false,
            case: 'INTERNAL_SERVER_ERROR',
          });
          expect(service.user.next).not.toHaveBeenCalled();
          expect(service.autoLogout).not.toHaveBeenCalled();
          expect(cookieService.set).not.toHaveBeenCalled();
        });

      const req = httpMock.expectOne(`${environment.backendLocation}session`);
      expect(req.request.method).toBe('POST');
      req.flush(mockErrorResponse, {
        status: 500,
        statusText: 'Internal Server Error',
      });
    });
  });

  describe('autoLogin', () => {
    /**
     * Verifica la funzione di auto login quando ci sono dati nei cookies e token ancora valido
     */
    it('should auto login user if user data is stored in cookie', () => {
      const storedData = {
        _value: {
          name: 'testName',
          email: 'test@example.com',
          _sessionToken: 'session_token_value',
          _tokenExpDate: new Date(new Date().getTime() + 3600000),
        },
      };
      spyOn(cookieService, 'get').and.returnValue(JSON.stringify(storedData));
      const loadedUser = new User(
        storedData._value.name,
        storedData._value.email,
        storedData._value._sessionToken,
        new Date(storedData._value._tokenExpDate)
      );
      spyOn(service.user, 'next');
      spyOn(service, 'autoLogout');

      service.autoLogin();

      expect(cookieService.get).toHaveBeenCalledWith('user_data');
      expect(service.user.next).toHaveBeenCalledWith(loadedUser);
      expect(service.autoLogout).toHaveBeenCalledWith(jasmine.any(Number));
    });

    /**
     *  Verifica che la funzione di auto login non apra una sessione di accesso quando non ci sono dati
     */
    it('should not auto login user if no user data is stored in cookie', () => {
      spyOn(cookieService, 'get').and.returnValue('');
      spyOn(service.user, 'next');
      spyOn(service, 'autoLogout');

      service.autoLogin();

      expect(cookieService.get).toHaveBeenCalledWith('user_data');
      expect(service.user.next).not.toHaveBeenCalled();
      expect(service.autoLogout).not.toHaveBeenCalled();
    });

    /**
     * Verifica che il servizio non consenta l'auto login all'utente con un token scaduto
     */
    it('should not auto login user if user data without valid token is stored in cookie', () => {
      const storedData = {
        _value: {
          name: 'testName',
          email: 'johndoe@example.com',
          _sessionToken: 'invalid_token',
          _tokenExpDate: new Date(new Date().getTime() - 5000000), //token scaduto
        },
      };

      spyOn(cookieService, 'get').and.returnValue(JSON.stringify(storedData));
      spyOn(service.user, 'next');
      spyOn(service, 'autoLogout');

      service.autoLogin();

      expect(cookieService.get).toHaveBeenCalledWith('user_data');
      expect(service.user.next).not.toHaveBeenCalled();
      expect(service.autoLogout).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    /**
     * Verifica se viene effettato correttamente il log out dell'utente
     */
    it('should logout user and reset session data', () => {
      spyOn(service.user, 'next');
      spyOn(cookieService, 'delete');
      spyOn(service as any, 'clearTokenExpirationTimer');

      service.logout();

      expect(service.user.next).toHaveBeenCalledWith(null);
      expect(cookieService.delete).toHaveBeenCalledWith('user_data');
      expect((service as any).clearTokenExpirationTimer).toHaveBeenCalled();
    });
  });

  describe('autoLogout', () => {
    let tokenExpirationTimer: NodeJS.Timeout | null;
    let logoutSpy: jasmine.Spy;

    beforeEach(() => {
      // Reset il timer e crea un spy per il metodo logout
      tokenExpirationTimer = null;
      logoutSpy = jasmine.createSpy('logout');
    });

    afterEach(() => {
      // Pulisce il timer dopo ogni test
      if (tokenExpirationTimer !== null) {
        clearTimeout(tokenExpirationTimer);
      }
    });

    /**
     * Verifica che la funzione di log out venga correttamente chiamata al momento della scadenza del token
     */
    it('should call logout after the expiration duration', (done) => {
      const expirationDuration = 500;

      autoLogout(expirationDuration);

      setTimeout(() => {
        expect(logoutSpy).toHaveBeenCalled();

        done();
      }, expirationDuration + 100);
    });

    function autoLogout(expirationDuration: number) {
      tokenExpirationTimer = setTimeout(() => {
        logoutSpy();
      }, expirationDuration);
    }
  });
});
