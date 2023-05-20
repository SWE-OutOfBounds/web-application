import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ClockCAPTCHAView } from '../../../../../clock-captcha/dist/index';
import { ClockCaptchaService } from 'src/app/services/clock-captcha/clock-captcha.service';
import { RegistrationService } from 'src/app/services/session/registration.service';
import { RegistrationComponent } from './registration.component';
import { of } from 'rxjs';

describe('RegistrationComponent', () => {
  let component: RegistrationComponent;
  let fixture: ComponentFixture<RegistrationComponent>;
  let routerMock: Router;
  let snackBarMock: MatSnackBar;
  let registrationServiceMock: RegistrationService;
  let ccServiceMock: ClockCaptchaService;
  let captchaModuleMock: ClockCAPTCHAView;
  let getElementByIdSpy: jasmine.Spy;

  beforeEach(() => {
    routerMock = jasmine.createSpyObj('Router', ['navigate']);
    snackBarMock = jasmine.createSpyObj('MatSnackBar', ['open']);
    registrationServiceMock = jasmine.createSpyObj('RegistrationService', [
      'signUp',
    ]);
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
        RegistrationComponent,
        { provide: Router, useValue: routerMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        { provide: RegistrationService, useValue: registrationServiceMock },
        { provide: ClockCaptchaService, useValue: ccServiceMock },
        { provide: ClockCAPTCHAView, useValue: captchaModuleMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrationComponent);
    component = fixture.componentInstance;
    component['_captchaModule'] = captchaModuleMock;

    routerMock = TestBed.inject(Router);
    snackBarMock = TestBed.inject(MatSnackBar);
    registrationServiceMock = TestBed.inject(RegistrationService);
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
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    /**
     * Verifica della corretta creazione del form per la registrazione di un nuovo utente
     */
    it('should initialize the signupForm', () => {
      expect(component['_signupForm']).toBeInstanceOf(FormGroup);
      expect(component['_signupForm'].get('firstName')).toBeInstanceOf(
        FormControl
      );
      expect(component['_signupForm'].get('lastName')).toBeInstanceOf(
        FormControl
      );
      expect(component['_signupForm'].get('username')).toBeInstanceOf(
        FormControl
      );
      expect(component['_signupForm'].get('email')).toBeInstanceOf(FormControl);
      expect(component['_signupForm'].get('password')).toBeInstanceOf(
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
      component.ngOnInit();

      expect(getElementByIdSpy).toHaveBeenCalledWith('clock-captcha_signup');
      expect(captchaModuleMock.inject).toHaveBeenCalledWith(
        jasmine.any(HTMLElement)
      );

      expect(component['_captchaModule']).toBeDefined();

      //Simula il passaggio di 2000 millisecondi
      tick(2000);

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

      expect(getElementByIdSpy).toHaveBeenCalledWith('clock-captcha_signup');
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

  describe('signUp', () => {
    let signupFormValue: any;
    let signupForm: FormGroup;
    let signupResponse: {
      okay: boolean;
      case?: string;
    };

    beforeEach(() => {
      // assegnazione delle variabili necessarie ai test
      signupFormValue = {
        firstName: 'Mario',
        lastName: 'Rossi',
        username: 'BigMario',
        email: 'test@example.com',
        password: 'password',
      };
      signupForm = new FormGroup({
        firstName: new FormControl(),
        lastName: new FormControl(),
        username: new FormControl(),
        email: new FormControl(),
        password: new FormControl(),
      });
      signupForm.setValue(signupFormValue);
      component['_signupForm'] = signupForm;
    });

    /**
     * Verifica se viene restituito un messaggio di errore nel caso in cui l'input fornito nel modulo di test abbia lunghezza diversa da 5
     */
    it('should display error message for invalid input', () => {
      // imposta input nel formato errato
      captchaModuleMock.getInput = jasmine.createSpy().and.returnValue('1234');

      component.signUp();

      expect(captchaModuleMock.getInput).toHaveBeenCalled();
      expect(captchaModuleMock.error).toHaveBeenCalledWith(
        'Controlla il formato!'
      );
    });

    /**
     * Verifica il funzionamento di registrazione in caso di successo
     */
    it('should navigate to login page on successful registration', () => {
      //imposta correttamente mock input e mock token del clock captcha
      captchaModuleMock.getInput = jasmine.createSpy().and.returnValue('12345');
      captchaModuleMock.getToken = jasmine.createSpy().and.returnValue('token');

      //imposta mock risposta di registrazione avvenuta con successo
      signupResponse = { okay: true };
      registrationServiceMock.signUp = jasmine.createSpy().and.returnValue({
        subscribe: (callback: Function) => callback(signupResponse),
      });

      component.signUp();

      expect(registrationServiceMock.signUp).toHaveBeenCalledWith(
        signupFormValue.firstName,
        signupFormValue.lastName,
        signupFormValue.username,
        signupFormValue.email,
        signupFormValue.password,
        captchaModuleMock.getToken(),
        captchaModuleMock.getInput()
      );
      expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    });

    /**
     * Verifica la funzione di registrazione in caso di errore commesso nel clock CAPTCHA
     */
    it('should handle BAD_CAPTCHA error case', () => {
      //imposta correttamente mock input e mock token del clock captcha
      captchaModuleMock.getInput = jasmine.createSpy().and.returnValue('12345');
      captchaModuleMock.getToken = jasmine
        .createSpy()
        .and.returnValue('captcha-token');

      //imposta mock errore di registrazione
      signupResponse = { okay: false, case: 'BAD_CAPTCHA' };
      const ccServiceResponse = {
        cc_content: 'captcha-content',
        cc_token: 'captcha-token',
      };

      registrationServiceMock.signUp = jasmine.createSpy().and.returnValue({
        subscribe: (callback: any) => callback(signupResponse),
      });
      ccServiceMock.ccInit = jasmine.createSpy().and.returnValue({
        subscribe: (callback: any) => callback(ccServiceResponse),
      });

      //esegui funzione da testare
      component.signUp();

      //test risultati attesi
      expect(registrationServiceMock.signUp).toHaveBeenCalledWith(
        signupFormValue.firstName,
        signupFormValue.lastName,
        signupFormValue.username,
        signupFormValue.email,
        signupFormValue.password,
        captchaModuleMock.getToken(),
        captchaModuleMock.getInput()
      );
      expect(routerMock.navigate).not.toHaveBeenCalled();

      expect(captchaModuleMock.clear).toHaveBeenCalled();
      expect(captchaModuleMock.error).toHaveBeenCalledWith(
        'OPS, ORARIO SCORRETTO!'
      );
      expect(ccServiceMock.ccInit).toHaveBeenCalled();
      expect(captchaModuleMock.fill).toHaveBeenCalledWith(
        'captcha-content',
        'captcha-token'
      );
    });

    /**
     * Verifica la funzione di registrazione nel caso di token scaduto
     */
    it('should handle USED_TOKEN error case', () => {
      //imposta correttamente mock input e mock token del clock captcha
      captchaModuleMock.getInput = jasmine.createSpy().and.returnValue('12345');
      captchaModuleMock.getToken = jasmine
        .createSpy()
        .and.returnValue('captcha-token');

      //imposta mock errore di registrazione
      signupResponse = { okay: false, case: 'USED_TOKEN' };
      const ccServiceResponse = {
        cc_content: 'captcha-content',
        cc_token: 'captcha-token',
      };

      registrationServiceMock.signUp = jasmine.createSpy().and.returnValue({
        subscribe: (callback: any) => callback(signupResponse),
      });
      ccServiceMock.ccInit = jasmine.createSpy().and.returnValue({
        subscribe: (callback: any) => callback(ccServiceResponse),
      });

      //esegui funzione da testare
      component.signUp();

      //test risultati attesi
      expect(registrationServiceMock.signUp).toHaveBeenCalledWith(
        signupFormValue.firstName,
        signupFormValue.lastName,
        signupFormValue.username,
        signupFormValue.email,
        signupFormValue.password,
        captchaModuleMock.getToken(),
        captchaModuleMock.getInput()
      );
      expect(routerMock.navigate).not.toHaveBeenCalled();

      expect(captchaModuleMock.clear).toHaveBeenCalled();
      expect(captchaModuleMock.error).toHaveBeenCalledWith(
        'Qualcosa è andato storto. Riprova'
      );
      expect(ccServiceMock.ccInit).toHaveBeenCalled();
      expect(captchaModuleMock.fill).toHaveBeenCalledWith(
        'captcha-content',
        'captcha-token'
      );
    });

    /**
     * Verifica la funzione di registrazione nel caso di formato nome errato
     */
    it('should handle INVALID_FORMAT_FIRSTNAME error case', () => {
      //imposta correttamente mock input e mock token del clock captcha
      captchaModuleMock.getInput = jasmine.createSpy().and.returnValue('12345');
      captchaModuleMock.getToken = jasmine
        .createSpy()
        .and.returnValue('captcha-token');

      //imposta mock errore di registrazione
      const ccServiceResponse = {
        cc_content: 'captcha-content',
        cc_token: 'captcha-token',
      };
      signupResponse = { okay: false, case: 'INVALID_FORMAT_FIRSTNAME' };

      ccServiceMock.ccInit = jasmine.createSpy().and.returnValue({
        subscribe: (callback: any) => callback(ccServiceResponse),
      });
      registrationServiceMock.signUp = jasmine.createSpy().and.returnValue({
        subscribe: (callback: any) => callback(signupResponse),
      });

      //imposta mock set di errore
      const firstNameControl: AbstractControl<any, any> =
        component['_signupForm'].get('firstName')!;
      spyOn(firstNameControl, 'setErrors');

      //esegue funzione da testare
      component.signUp();

      //test risultati attesi
      expect(registrationServiceMock.signUp).toHaveBeenCalledWith(
        signupFormValue.firstName,
        signupFormValue.lastName,
        signupFormValue.username,
        signupFormValue.email,
        signupFormValue.password,
        captchaModuleMock.getToken(),
        captchaModuleMock.getInput()
      );
      expect(routerMock.navigate).not.toHaveBeenCalled();
      expect(captchaModuleMock.clear).toHaveBeenCalled();
      expect(ccServiceMock.ccInit).toHaveBeenCalled();
      expect(captchaModuleMock.fill).toHaveBeenCalledWith(
        'captcha-content',
        'captcha-token'
      );
      expect(firstNameControl.setErrors).toHaveBeenCalledWith({
        pattern: true,
      });
    });

    /**
     * Verifica la funzione di registrazione nel caso di formato cognome errato
     */
    it('should handle INVALID_FORMAT_LASTNAME error case', () => {
      //imposta correttamente mock input e mock token del clock captcha
      captchaModuleMock.getInput = jasmine.createSpy().and.returnValue('12345');
      captchaModuleMock.getToken = jasmine
        .createSpy()
        .and.returnValue('captcha-token');

      //imposta mock errore di registrazione
      const ccServiceResponse = {
        cc_content: 'captcha-content',
        cc_token: 'captcha-token',
      };
      signupResponse = { okay: false, case: 'INVALID_FORMAT_LASTNAME' };

      ccServiceMock.ccInit = jasmine.createSpy().and.returnValue({
        subscribe: (callback: any) => callback(ccServiceResponse),
      });
      registrationServiceMock.signUp = jasmine.createSpy().and.returnValue({
        subscribe: (callback: any) => callback(signupResponse),
      });

      //imposta mock set di errore
      const lastNameControl: AbstractControl<any, any> =
        component['_signupForm'].get('lastName')!;
      spyOn(lastNameControl, 'setErrors');

      //esegue funzione da testare
      component.signUp();

      //test risultati attesi
      expect(registrationServiceMock.signUp).toHaveBeenCalledWith(
        signupFormValue.firstName,
        signupFormValue.lastName,
        signupFormValue.username,
        signupFormValue.email,
        signupFormValue.password,
        captchaModuleMock.getToken(),
        captchaModuleMock.getInput()
      );
      expect(routerMock.navigate).not.toHaveBeenCalled();
      expect(captchaModuleMock.clear).toHaveBeenCalled();
      expect(ccServiceMock.ccInit).toHaveBeenCalled();
      expect(captchaModuleMock.fill).toHaveBeenCalledWith(
        'captcha-content',
        'captcha-token'
      );
      expect(lastNameControl.setErrors).toHaveBeenCalledWith({ pattern: true });
    });

    /**
     * Verifica la funzione di registrazione nel caso di formato username errato
     */
    it('should handle INVALID_FORMAT_USERNAME error case', () => {
      //imposta correttamente mock input e mock token del clock captcha
      captchaModuleMock.getInput = jasmine.createSpy().and.returnValue('12345');
      captchaModuleMock.getToken = jasmine
        .createSpy()
        .and.returnValue('captcha-token');

      //imposta mock errore di registrazione
      const ccServiceResponse = {
        cc_content: 'captcha-content',
        cc_token: 'captcha-token',
      };
      signupResponse = { okay: false, case: 'INVALID_FORMAT_USERNAME' };

      ccServiceMock.ccInit = jasmine.createSpy().and.returnValue({
        subscribe: (callback: any) => callback(ccServiceResponse),
      });
      registrationServiceMock.signUp = jasmine.createSpy().and.returnValue({
        subscribe: (callback: any) => callback(signupResponse),
      });

      //imposta mock set di errore
      const usernameControl: AbstractControl<any, any> =
        component['_signupForm'].get('username')!;
      spyOn(usernameControl, 'setErrors');

      //esegue funzione da testare
      component.signUp();

      //test risultati attesi
      expect(registrationServiceMock.signUp).toHaveBeenCalledWith(
        signupFormValue.firstName,
        signupFormValue.lastName,
        signupFormValue.username,
        signupFormValue.email,
        signupFormValue.password,
        captchaModuleMock.getToken(),
        captchaModuleMock.getInput()
      );
      expect(routerMock.navigate).not.toHaveBeenCalled();
      expect(captchaModuleMock.clear).toHaveBeenCalled();
      expect(ccServiceMock.ccInit).toHaveBeenCalled();
      expect(captchaModuleMock.fill).toHaveBeenCalledWith(
        'captcha-content',
        'captcha-token'
      );
      expect(usernameControl.setErrors).toHaveBeenCalledWith({
        required: true,
      });
    });

    /**
     * Verifica la funzione di registrazione nel caso di formato email errato
     */
    it('should handle INVALID_FORMAT_EMAIL error case', () => {
      //imposta correttamente mock input e mock token del clock captcha
      captchaModuleMock.getInput = jasmine.createSpy().and.returnValue('12345');
      captchaModuleMock.getToken = jasmine
        .createSpy()
        .and.returnValue('captcha-token');

      //imposta mock errore di registrazione
      const ccServiceResponse = {
        cc_content: 'captcha-content',
        cc_token: 'captcha-token',
      };
      signupResponse = { okay: false, case: 'INVALID_FORMAT_EMAIL' };

      ccServiceMock.ccInit = jasmine.createSpy().and.returnValue({
        subscribe: (callback: any) => callback(ccServiceResponse),
      });
      registrationServiceMock.signUp = jasmine.createSpy().and.returnValue({
        subscribe: (callback: any) => callback(signupResponse),
      });

      //imposta mock set di errore
      const emailControl: AbstractControl<any, any> =
        component['_signupForm'].get('email')!;
      spyOn(emailControl, 'setErrors');

      //esegue funzione da testare
      component.signUp();

      //test risultati attesi
      expect(registrationServiceMock.signUp).toHaveBeenCalledWith(
        signupFormValue.firstName,
        signupFormValue.lastName,
        signupFormValue.username,
        signupFormValue.email,
        signupFormValue.password,
        captchaModuleMock.getToken(),
        captchaModuleMock.getInput()
      );
      expect(routerMock.navigate).not.toHaveBeenCalled();
      expect(captchaModuleMock.clear).toHaveBeenCalled();
      expect(ccServiceMock.ccInit).toHaveBeenCalled();
      expect(captchaModuleMock.fill).toHaveBeenCalledWith(
        'captcha-content',
        'captcha-token'
      );
      expect(emailControl.setErrors).toHaveBeenCalledWith({ pattern: true });
    });

    /**
     * Verifica la funzione di registrazione nel caso di formato password errato
     */
    it('should handle INVALID_FORMAT_PASSWORD error case', () => {
      //imposta correttamente mock input e mock token del clock captcha
      captchaModuleMock.getInput = jasmine.createSpy().and.returnValue('12345');
      captchaModuleMock.getToken = jasmine
        .createSpy()
        .and.returnValue('captcha-token');

      //imposta mock errore di registrazione
      const ccServiceResponse = {
        cc_content: 'captcha-content',
        cc_token: 'captcha-token',
      };
      signupResponse = { okay: false, case: 'INVALID_FORMAT_PASSWORD' };

      ccServiceMock.ccInit = jasmine.createSpy().and.returnValue({
        subscribe: (callback: any) => callback(ccServiceResponse),
      });
      registrationServiceMock.signUp = jasmine.createSpy().and.returnValue({
        subscribe: (callback: any) => callback(signupResponse),
      });

      //imposta mock set di errore
      const passwordControl: AbstractControl<any, any> =
        component['_signupForm'].get('password')!;
      spyOn(passwordControl, 'setErrors');

      //esegue funzione da testare
      component.signUp();

      //test risultati attesi
      expect(registrationServiceMock.signUp).toHaveBeenCalledWith(
        signupFormValue.firstName,
        signupFormValue.lastName,
        signupFormValue.username,
        signupFormValue.email,
        signupFormValue.password,
        captchaModuleMock.getToken(),
        captchaModuleMock.getInput()
      );
      expect(routerMock.navigate).not.toHaveBeenCalled();
      expect(captchaModuleMock.clear).toHaveBeenCalled();
      expect(ccServiceMock.ccInit).toHaveBeenCalled();
      expect(captchaModuleMock.fill).toHaveBeenCalledWith(
        'captcha-content',
        'captcha-token'
      );
      expect(passwordControl.setErrors).toHaveBeenCalledWith({ pattern: true });
    });

    /**
     * Verifica la funzione di registrazione nel caso di email già in uso
     */
    it('should handle USED_EMAIL error case', () => {
      //imposta correttamente mock input e mock token del clock captcha
      captchaModuleMock.getInput = jasmine.createSpy().and.returnValue('12345');
      captchaModuleMock.getToken = jasmine
        .createSpy()
        .and.returnValue('captcha-token');

      //imposta mock errore di registrazione
      const ccServiceResponse = {
        cc_content: 'captcha-content',
        cc_token: 'captcha-token',
      };
      signupResponse = { okay: false, case: 'USED_EMAIL' };

      ccServiceMock.ccInit = jasmine.createSpy().and.returnValue({
        subscribe: (callback: any) => callback(ccServiceResponse),
      });
      registrationServiceMock.signUp = jasmine.createSpy().and.returnValue({
        subscribe: (callback: any) => callback(signupResponse),
      });

      //imposta mock set di errore
      const emailControl: AbstractControl<any, any> =
        component['_signupForm'].get('email')!;
      spyOn(emailControl, 'setErrors');

      //esegue funzione da testare
      component.signUp();

      //test risultati attesi
      expect(registrationServiceMock.signUp).toHaveBeenCalledWith(
        signupFormValue.firstName,
        signupFormValue.lastName,
        signupFormValue.username,
        signupFormValue.email,
        signupFormValue.password,
        captchaModuleMock.getToken(),
        captchaModuleMock.getInput()
      );
      expect(routerMock.navigate).not.toHaveBeenCalled();
      expect(captchaModuleMock.clear).toHaveBeenCalled();
      expect(ccServiceMock.ccInit).toHaveBeenCalled();
      expect(captchaModuleMock.fill).toHaveBeenCalledWith(
        'captcha-content',
        'captcha-token'
      );
      expect(emailControl.setErrors).toHaveBeenCalledWith({
        alreadyExisted: true,
      });
    });

    /**
     * Verifica la funzione di registrazione nel caso di errore diverso dai precedenti
     */
    it('should handle default error case', () => {
      //imposta correttamente mock input e mock token del clock captcha
      captchaModuleMock.getInput = jasmine.createSpy().and.returnValue('12345');
      captchaModuleMock.getToken = jasmine
        .createSpy()
        .and.returnValue('captcha-token');

      //imposta mock errore di registrazione
      const ccServiceResponse = {
        cc_content: 'captcha-content',
        cc_token: 'captcha-token',
      };
      signupResponse = { okay: false, case: 'Some-Error' };

      ccServiceMock.ccInit = jasmine.createSpy().and.returnValue({
        subscribe: (callback: any) => callback(ccServiceResponse),
      });
      registrationServiceMock.signUp = jasmine.createSpy().and.returnValue({
        subscribe: (callback: any) => callback(signupResponse),
      });

      //esegue funzione da testare
      component.signUp();

      //test risultati attesi
      expect(registrationServiceMock.signUp).toHaveBeenCalledWith(
        signupFormValue.firstName,
        signupFormValue.lastName,
        signupFormValue.username,
        signupFormValue.email,
        signupFormValue.password,
        captchaModuleMock.getToken(),
        captchaModuleMock.getInput()
      );
      expect(routerMock.navigate).not.toHaveBeenCalled();
      expect(captchaModuleMock.clear).toHaveBeenCalled();
      expect(ccServiceMock.ccInit).toHaveBeenCalled();
      expect(captchaModuleMock.fill).toHaveBeenCalledWith(
        'captcha-content',
        'captcha-token'
      );
      expect(snackBarMock.open).toHaveBeenCalledWith(
        'Errore interno al sito. Riprova tra qualche minuto.',
        'OK'
      );
    });
  });
});
