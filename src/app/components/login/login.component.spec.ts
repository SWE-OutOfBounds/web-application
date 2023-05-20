import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { SessionService } from 'src/app/services/session/session.service';
import { ClockCaptchaService } from 'src/app/services/clock-captcha/clock-captcha.service';
import { ClockCAPTCHAView } from '../../../../../clock-captcha/dist/index';
import { of } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let routerMock: Router;
  let snackBarMock: MatSnackBar;
  let sessionServiceMock: SessionService;
  let ccServiceMock: ClockCaptchaService;
  let captchaModuleMock: ClockCAPTCHAView;
  let getElementByIdSpy: jasmine.Spy;

  beforeEach(() => {
    routerMock = jasmine.createSpyObj('Router', ['navigate']);
    snackBarMock = jasmine.createSpyObj('MatSnackBar', ['open']);
    sessionServiceMock = jasmine.createSpyObj('SessionService', ['login']);
    ccServiceMock = jasmine.createSpyObj('ClockCaptchaService', ['ccInit']);
    captchaModuleMock = jasmine.createSpyObj('ClockCAPTCHAView', [
      'inject',
      'fill',
      'getInput',
      'getToken',
      'error',
      'clear',
    ]);

    TestBed.configureTestingModule({
      providers: [
        LoginComponent,
        { provide: Router, useValue: routerMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: ClockCaptchaService, useValue: ccServiceMock },
        { provide: ClockCAPTCHAView, useValue: captchaModuleMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    component['_captchaModule'] = captchaModuleMock;

    ccServiceMock.ccInit = jasmine
      .createSpy()
      .and.returnValue(of({ cc_content: 'content', cc_token: 'token' }));
    getElementByIdSpy = spyOn(document, 'getElementById').and.returnValue(
      document.createElement('div')
    );
  });

  describe('Constructor', () => {
    /**
     * Verifica della corretta creazione della componente
     */
    it('should create the LoginComponent', () => {
      expect(component).toBeTruthy();
    });

    /**
     * Verifica della corretta creazione del form per l'accesso al sistema
     */
    it('should initialize the loginForm', () => {
      expect(component['_loginForm']).toBeInstanceOf(FormGroup);
      expect(component['_loginForm'].get('email')).toBeInstanceOf(FormControl);
      expect(component['_loginForm'].get('password')).toBeInstanceOf(
        FormControl
      );
    });

    /**
     * Verifica la creazione del modulo di test
     */
    it('should create the istance of the captchaModule', () => {
      expect(component['_captchaModule']).toBeTruthy();
    });
  });

  describe('ngOnInit', () => {
    /**
     * Verifica la corretta inizializzazione del clock-captcha,
     * nel caso in cui la libreria abbia effettivamente inviato l'immagine e il token da inizializzare
     */
    it('should initialize the clock-captcha if recives an image and a token from the service', fakeAsync(() => {
      //essendo caso prevalente, il mock di risposta positiva fornita dal servizio clock-captcha è stato già definito nella configurazione iniziale

      component.ngOnInit();

      //L'elemendo con id=clock-captcha dovrà essere sostituito con il modulo di test
      expect(getElementByIdSpy).toHaveBeenCalledWith('clock-captcha');
      expect(captchaModuleMock.inject).toHaveBeenCalledWith(
        jasmine.any(HTMLElement)
      );
      expect(component['_captchaModule']).toBeDefined();

      //Simula il passaggio di 2000 millisecondi
      tick(2000);

      //Il modulo di test dovrà contenere la figura e il token del clock-captcha forniti dal servizio
      expect(ccServiceMock.ccInit).toHaveBeenCalled();
      expect(component['_captchaModule'].fill).toHaveBeenCalledWith(
        'content',
        'token'
      );
    }));

    /**
     * Verifica la corretta inizializzazione del messaggio di errore,
     * nel caso in cui non sia stato possibile ricevere l'immagine e il token necessari
     */
    it('should set error message if occors an error during initialization of the clock-captcha', fakeAsync(() => {
      ccServiceMock.ccInit = jasmine
        .createSpy()
        .and.returnValue(of({ success: false }));

      component.ngOnInit();

      expect(getElementByIdSpy).toHaveBeenCalledWith('clock-captcha');
      expect(captchaModuleMock.inject).toHaveBeenCalledWith(
        jasmine.any(HTMLElement)
      );

      expect(component['_captchaModule']).toBeDefined();

      //Simula il passaggio di 2000 millisecondi
      tick(2000);

      expect(ccServiceMock.ccInit).toHaveBeenCalled();
      expect(component['_captchaModule'].fill).not.toHaveBeenCalledWith(
        'content',
        'token'
      );
      expect(component.errorMessage).toEqual(
        'Si è verificato un errore nel recupero del test, per cui al momento non è possibile accedere al nostro sistema. Si prega di riprovare più tardi.'
      );
    }));
  });

  describe('login', () => {
    let loginFormValue: any;
    let loginForm: FormGroup;
    let loginResponse: {
      okay: boolean;
      case?: string;
    };

    beforeEach(() => {
      // assegnazione delle variabili necessarie ai test
      loginFormValue = {
        email: 'test@example.com',
        password: 'password',
      };
      loginForm = new FormGroup({
        email: new FormControl(),
        password: new FormControl(),
      });
      loginForm.setValue(loginFormValue);
      component['_loginForm'] = loginForm;
    });
    /**
     * Verifica se viene restituito un messaggio di errore nel caso in cui l'input fornito nel modulo di test abbia lunghezza diversa da 5
     */
    it('should display error message for invalid input', () => {
      captchaModuleMock.getInput = jasmine.createSpy().and.returnValue('1234');

      component.login();

      expect(captchaModuleMock.getInput).toHaveBeenCalled();
      expect(captchaModuleMock.error).toHaveBeenCalledWith(
        'Controlla il formato!'
      );
    });

    /**
     * Verifica il funzionamento di login in caso di successo
     */
    it('should navigate to home page on successful login', () => {
      captchaModuleMock.getInput = jasmine.createSpy().and.returnValue('12345');
      captchaModuleMock.getToken = jasmine.createSpy().and.returnValue('token');

      loginResponse = { okay: true };
      sessionServiceMock.login = jasmine.createSpy().and.returnValue({
        subscribe: (callback: Function) => callback(loginResponse),
      });

      component.login();

      expect(sessionServiceMock.login).toHaveBeenCalledWith(
        loginFormValue.email,
        loginFormValue.password,
        captchaModuleMock.getToken(),
        captchaModuleMock.getInput()
      );
      expect(routerMock.navigate).toHaveBeenCalledWith(['']);
    });

    /**
     * Verifica la funzione di login in caso di errore commesso nel clock CAPTCHA
     */
    it('should handle BAD_CAPTCHA error case', () => {
      captchaModuleMock.getInput = jasmine.createSpy().and.returnValue('12345');
      captchaModuleMock.getToken = jasmine
        .createSpy()
        .and.returnValue('captcha-token');

      loginResponse = { okay: false, case: 'BAD_CAPTCHA' };
      const ccServiceResponse = {
        cc_content: 'captcha-content',
        cc_token: 'captcha-token',
      };

      sessionServiceMock.login = jasmine.createSpy().and.returnValue({
        subscribe: (callback: any) => callback(loginResponse),
      });
      ccServiceMock.ccInit = jasmine.createSpy().and.returnValue({
        subscribe: (callback: any) => callback(ccServiceResponse),
      });

      component.login();

      expect(captchaModuleMock.clear).toHaveBeenCalled();
      expect(captchaModuleMock.error).toHaveBeenCalledWith(
        'OPS, ORARIO SCORRETTO!'
      );
      expect(ccServiceMock.ccInit).toHaveBeenCalled();
      expect(captchaModuleMock.fill).toHaveBeenCalledWith(
        'captcha-content',
        'captcha-token'
      );
      expect(sessionServiceMock.login).toHaveBeenCalledWith(
        loginFormValue.email,
        loginFormValue.password,
        captchaModuleMock.getToken(),
        captchaModuleMock.getInput()
      );
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });

    /**
     * Verifica la funzione di login in caso di indirizzo email nel formato errato
     */
    it('should handle INVALID_EMAIL_FORMAT error case', () => {
      captchaModuleMock.getInput = jasmine.createSpy().and.returnValue('12345');
      captchaModuleMock.getToken = jasmine
        .createSpy()
        .and.returnValue('captcha-token');

      const ccServiceResponse = {
        cc_content: 'captcha-content',
        cc_token: 'captcha-token',
      };
      loginResponse = { okay: false, case: 'INVALID_EMAIL_FORMAT' };

      ccServiceMock.ccInit = jasmine.createSpy().and.returnValue({
        subscribe: (callback: any) => callback(ccServiceResponse),
      });
      sessionServiceMock.login = jasmine.createSpy().and.returnValue({
        subscribe: (callback: any) => callback(loginResponse),
      });

      const emailControl: AbstractControl<any, any> =
        component['_loginForm'].get('email')!;
      const passwordControl: AbstractControl<any, any> =
        component['_loginForm'].get('password')!;

      spyOn(emailControl, 'setErrors');
      spyOn(passwordControl, 'setErrors');

      component.login();

      expect(ccServiceMock.ccInit).toHaveBeenCalled();
      expect(sessionServiceMock.login).toHaveBeenCalledWith(
        loginFormValue.email,
        loginFormValue.password,
        captchaModuleMock.getToken(),
        captchaModuleMock.getInput()
      );
      expect(routerMock.navigate).not.toHaveBeenCalled();
      expect(captchaModuleMock.clear).toHaveBeenCalled();
      expect(captchaModuleMock.fill).toHaveBeenCalledWith(
        'captcha-content',
        'captcha-token'
      );
      expect(emailControl.setErrors).toHaveBeenCalledWith({
        wrongCredentialError: true,
      });
      expect(passwordControl.setErrors).toHaveBeenCalledWith({
        wrongCredentialError: true,
      });
    });

    /**
     * Verifica la funzione di login in caso di credenziali errate
     */
    it('should handle BAD_CREDENTIAL error case', () => {
      captchaModuleMock.getInput = jasmine.createSpy().and.returnValue('12345');
      captchaModuleMock.getToken = jasmine
        .createSpy()
        .and.returnValue('captcha-token');

      const ccServiceResponse = {
        cc_content: 'captcha-content',
        cc_token: 'captcha-token',
      };
      loginResponse = { okay: false, case: 'BAD_CREDENTIAL' };

      captchaModuleMock.getInput = jasmine.createSpy().and.returnValue('12345');
      ccServiceMock.ccInit = jasmine.createSpy().and.returnValue({
        subscribe: (callback: any) => callback(ccServiceResponse),
      });
      sessionServiceMock.login = jasmine.createSpy().and.returnValue({
        subscribe: (callback: any) => callback(loginResponse),
      });

      const emailControl: AbstractControl<any, any> =
        component['_loginForm'].get('email')!;
      const passwordControl: AbstractControl<any, any> =
        component['_loginForm'].get('password')!;

      spyOn(emailControl, 'setErrors');
      spyOn(passwordControl, 'setErrors');

      component.login();

      expect(ccServiceMock.ccInit).toHaveBeenCalled();
      expect(sessionServiceMock.login).toHaveBeenCalledWith(
        loginFormValue.email,
        loginFormValue.password,
        captchaModuleMock.getToken(),
        captchaModuleMock.getInput()
      );
      expect(routerMock.navigate).not.toHaveBeenCalled();
      expect(captchaModuleMock.clear).toHaveBeenCalled();
      expect(captchaModuleMock.fill).toHaveBeenCalledWith(
        'captcha-content',
        'captcha-token'
      );
      expect(emailControl.setErrors).toHaveBeenCalledWith({
        wrongCredentialError: true,
      });
      expect(passwordControl.setErrors).toHaveBeenCalledWith({
        wrongCredentialError: true,
      });
    });

    /**
     * VErifica della funzione di login in caso di errore diverso dai precedenti errori
     */
    it('should handle default error case', () => {
      captchaModuleMock.getInput = jasmine.createSpy().and.returnValue('12345');
      captchaModuleMock.getToken = jasmine
        .createSpy()
        .and.returnValue('captcha-token');

      const ccServiceResponse = {
        cc_content: 'captcha-content',
        cc_token: 'captcha-token',
      };
      loginResponse = { okay: false, case: 'Some-Error' };

      ccServiceMock.ccInit = jasmine.createSpy().and.returnValue({
        subscribe: (callback: any) => callback(ccServiceResponse),
      });
      sessionServiceMock.login = jasmine.createSpy().and.returnValue({
        subscribe: (callback: any) => callback(loginResponse),
      });

      component.login();

      expect(ccServiceMock.ccInit).toHaveBeenCalled();
      expect(sessionServiceMock.login).toHaveBeenCalledWith(
        loginFormValue.email,
        loginFormValue.password,
        captchaModuleMock.getToken(),
        captchaModuleMock.getInput()
      );
      expect(routerMock.navigate).not.toHaveBeenCalled();
      expect(captchaModuleMock.clear).toHaveBeenCalled();
      expect(captchaModuleMock.fill).toHaveBeenCalledWith(
        'captcha-content',
        'captcha-token'
      );
      expect(snackBarMock.open).toHaveBeenCalledWith(
        'Errore interno al sito. Riprova tra qualche minuto.',
        'Ok'
      );
    });
  });
});
