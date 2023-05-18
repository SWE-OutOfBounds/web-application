import { ComponentFixture, TestBed,fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { SessionService } from 'src/app/services/session/session.service';
import { ClockCaptchaService } from 'src/app/services/clock-captcha/clock-captcha.service';
import { ClockCAPTCHAView } from '../../../../../clock-captcha/dist/front-end/ClockCAPTCHA';
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
    //crea tutti i mock necessari
    routerMock = jasmine.createSpyObj('Router', ['navigate']);
    snackBarMock = jasmine.createSpyObj('MatSnackBar', ['open']);
    sessionServiceMock = jasmine.createSpyObj('SessionService', ['login']);
    ccServiceMock = jasmine.createSpyObj('ClockCaptchaService', ['ccInit']);
    captchaModuleMock = jasmine.createSpyObj('ClockCAPTCHAView', ['inject', 'fill','getInput', 'getToken','error','clear']);


    TestBed.configureTestingModule({
      providers: [
        LoginComponent,
        { provide: Router, useValue: routerMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: ClockCaptchaService, useValue: ccServiceMock },
        { provide: ClockCAPTCHAView, useValue: captchaModuleMock }
      ]
    });

    //component = new LoginComponent(routerMock, snackBarMock, sessionServiceMock, ccServiceMock);
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    component['_captchaModule'] = captchaModuleMock;

    routerMock = TestBed.inject(Router);
    snackBarMock = TestBed.inject(MatSnackBar);
    sessionServiceMock = TestBed.inject(SessionService);
    ccServiceMock.ccInit = jasmine.createSpy().and.returnValue(of({ cc_content: 'content', cc_token: 'token' }));
    getElementByIdSpy = spyOn(document, 'getElementById').and.returnValue(document.createElement('div'));

  });

  //Test costruttore
  it('should create the LoginComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the loginForm', () => {
    expect(component['_loginForm']).toBeInstanceOf(FormGroup);
    expect(component['_loginForm'].get('email')).toBeInstanceOf(FormControl);
    expect(component['_loginForm'].get('password')).toBeInstanceOf(FormControl);
  });

  it('should create the istance of the captchaModule', () => {
    expect(component['_captchaModule']).toBeTruthy();
  });

  // Test ngOnInit
  it('should initialize the clock-captcha in ngOnInit', fakeAsync(() => {
    component.ngOnInit();

    expect(getElementByIdSpy).toHaveBeenCalledWith('clock-captcha');
    expect(captchaModuleMock.inject).toHaveBeenCalledWith(jasmine.any(HTMLElement));

    expect(component['_captchaModule']).toBeDefined();

    //Simula il passaggio di 2000 millisecondi
    tick(2000);

    expect(ccServiceMock.ccInit).toHaveBeenCalled();
    expect(component['_captchaModule'].fill).toHaveBeenCalledWith('content', 'token');

  }));

  //login
  it('should display error message for invalid input', () => {
    captchaModuleMock.getInput = jasmine.createSpy().and.returnValue('1234'); // Set the mock return value for getInput()

    component.login();

    expect(captchaModuleMock.getInput).toHaveBeenCalled();
    expect(captchaModuleMock.error).toHaveBeenCalledWith("Controlla il formato!");
  });

  it('should navigate to home page on successful login', () => {
    const loginFormValue = { email: 'test@example.com', password: 'password' };
    const loginResult = { okay: true };

    const loginForm = new FormGroup({
      email: new FormControl(),
      password: new FormControl()
    });

    loginForm.setValue(loginFormValue);
    component['_loginForm'] = loginForm;

    captchaModuleMock.getInput = jasmine.createSpy().and.returnValue('12345');
    captchaModuleMock.getToken = jasmine.createSpy().and.returnValue('token')

    sessionServiceMock.login = jasmine.createSpy().and.returnValue({ subscribe: (callback: Function) => callback(loginResult) });

    component.login();

    expect(sessionServiceMock.login).toHaveBeenCalledWith(
      loginFormValue.email,
      loginFormValue.password,
      captchaModuleMock.getToken(),
      captchaModuleMock.getInput()
    );
    expect(routerMock.navigate).toHaveBeenCalledWith(['']);
  });


  it('should handle BAD_CAPTCHA error case', () => {
    const loginFormValue = { email: 'test@example.com', password: 'password' };
    const loginForm = new FormGroup({
      email: new FormControl(),
      password: new FormControl()
    });
    loginForm.setValue(loginFormValue);
    component['_loginForm'] = loginForm;

    captchaModuleMock.getInput = jasmine.createSpy().and.returnValue('12345');
    captchaModuleMock.getToken = jasmine.createSpy().and.returnValue('captcha-token')

    const loginResponse = { okay: false, case: 'BAD_CAPTCHA' };
    const ccServiceResponse = { cc_content: 'captcha-content', cc_token: 'captcha-token' };

    sessionServiceMock.login = jasmine.createSpy().and.returnValue({ subscribe: (callback: any) => callback(loginResponse) });
    ccServiceMock.ccInit = jasmine.createSpy().and.returnValue({ subscribe: (callback: any) => callback(ccServiceResponse) });

    component.login();

    expect(captchaModuleMock.clear).toHaveBeenCalled();
    expect(captchaModuleMock.error).toHaveBeenCalledWith('OPS, ORARIO SCORRETTO!');
    expect(ccServiceMock.ccInit).toHaveBeenCalled();
    expect(captchaModuleMock.fill).toHaveBeenCalledWith('captcha-content', 'captcha-token');
    expect(sessionServiceMock.login).toHaveBeenCalledWith('test@example.com', 'password', 'captcha-token', '12345');
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('should handle INVALID_EMAIL_FORMAT error case', () => {
    const loginFormValue = { email: 'test@example.com', password: 'password' };
    const loginForm = new FormGroup({
      email: new FormControl(),
      password: new FormControl()
    });
    loginForm.setValue(loginFormValue);
    component['_loginForm'] = loginForm;

    captchaModuleMock.getInput = jasmine.createSpy().and.returnValue('12345');
    captchaModuleMock.getToken = jasmine.createSpy().and.returnValue('captcha-token')

    const ccServiceResponse = { cc_content: 'captcha-content', cc_token: 'captcha-token' };
    const loginResponse = { okay: false, case: 'INVALID_EMAIL_FORMAT' };

    ccServiceMock.ccInit = jasmine.createSpy().and.returnValue({ subscribe: (callback: any) => callback(ccServiceResponse) });
    sessionServiceMock.login = jasmine.createSpy().and.returnValue({ subscribe: (callback: any) => callback(loginResponse) });

    const emailControl: AbstractControl<any, any> = component['_loginForm'].get('email')!;
    const passwordControl: AbstractControl<any, any> = component['_loginForm'].get('password')!;

    spyOn(emailControl, 'setErrors');
    spyOn(passwordControl, 'setErrors');

    component.login();

    expect(ccServiceMock.ccInit).toHaveBeenCalled();
    expect(sessionServiceMock.login).toHaveBeenCalledWith('test@example.com', 'password', 'captcha-token', '12345');
    expect(routerMock.navigate).not.toHaveBeenCalled();
    expect(captchaModuleMock.clear).toHaveBeenCalled();
    expect(captchaModuleMock.fill).toHaveBeenCalledWith('captcha-content', 'captcha-token');
    expect(emailControl.setErrors).toHaveBeenCalledWith({ wrongCredentialError: true });
    expect(passwordControl.setErrors).toHaveBeenCalledWith({ wrongCredentialError: true });
  });

  it('should handle BAD_CREDENTIAL error case', () => {
    const loginFormValue = { email: 'test@example.com', password: 'password' };
    const loginForm = new FormGroup({
      email: new FormControl(),
      password: new FormControl()
    });
    loginForm.setValue(loginFormValue);
    component['_loginForm'] = loginForm;

    captchaModuleMock.getInput = jasmine.createSpy().and.returnValue('12345');
    captchaModuleMock.getToken = jasmine.createSpy().and.returnValue('captcha-token')

    const ccServiceResponse = { cc_content: 'captcha-content', cc_token: 'captcha-token' };
    const loginResponse = { okay: false, case: 'BAD_CREDENTIAL' };

    ccServiceMock.ccInit = jasmine.createSpy().and.returnValue({ subscribe: (callback: any) => callback(ccServiceResponse) });
    sessionServiceMock.login = jasmine.createSpy().and.returnValue({ subscribe: (callback: any) => callback(loginResponse) });

    const emailControl: AbstractControl<any, any> = component['_loginForm'].get('email')!;
    const passwordControl: AbstractControl<any, any> = component['_loginForm'].get('password')!;

    spyOn(emailControl, 'setErrors');
    spyOn(passwordControl, 'setErrors');

    component.login();

    expect(ccServiceMock.ccInit).toHaveBeenCalled();
    expect(sessionServiceMock.login).toHaveBeenCalledWith('test@example.com', 'password', 'captcha-token', '12345');
    expect(routerMock.navigate).not.toHaveBeenCalled();
    expect(captchaModuleMock.clear).toHaveBeenCalled();
    expect(captchaModuleMock.fill).toHaveBeenCalledWith('captcha-content', 'captcha-token');
    expect(emailControl.setErrors).toHaveBeenCalledWith({ wrongCredentialError: true });
    expect(passwordControl.setErrors).toHaveBeenCalledWith({ wrongCredentialError: true });
  });

  it('should handle default error case', () => {
    const loginFormValue = { email: 'test@example.com', password: 'password' };
    const loginForm = new FormGroup({
      email: new FormControl(),
      password: new FormControl()
    });
    loginForm.setValue(loginFormValue);
    component['_loginForm'] = loginForm;

    captchaModuleMock.getInput = jasmine.createSpy().and.returnValue('12345');
    captchaModuleMock.getToken = jasmine.createSpy().and.returnValue('captcha-token')

    const ccServiceResponse = { cc_content: 'captcha-content', cc_token: 'captcha-token' };
    const loginResponse = { okay: false, case: 'Some-Error' };

    ccServiceMock.ccInit = jasmine.createSpy().and.returnValue({ subscribe: (callback: any) => callback(ccServiceResponse) });
    sessionServiceMock.login = jasmine.createSpy().and.returnValue({ subscribe: (callback: any) => callback(loginResponse) });

    component.login();

    expect(ccServiceMock.ccInit).toHaveBeenCalled();
    expect(sessionServiceMock.login).toHaveBeenCalledWith('test@example.com', 'password', 'captcha-token', '12345');
    expect(routerMock.navigate).not.toHaveBeenCalled();
    expect(captchaModuleMock.clear).toHaveBeenCalled();
    expect(captchaModuleMock.fill).toHaveBeenCalledWith('captcha-content', 'captcha-token');
    expect(snackBarMock.open).toHaveBeenCalledWith("Errore interno al sito. Riprova tra qualche minuto.", 'Ok');
  });

});
