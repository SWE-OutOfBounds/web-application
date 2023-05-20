import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HomepageComponent } from './homepage.component';
import { SessionService } from '../../services/session/session.service';
import { BehaviorSubject } from 'rxjs';
import { User } from 'src/app/services/session/user.model';
import { Router } from '@angular/router';
import { LoginComponent } from '../login/login.component';



describe('HomepageComponent', () => {
  let component: HomepageComponent;
  let fixture: ComponentFixture<HomepageComponent>;

  let sessionServiceMock: SessionService;
  let router: Router;


  beforeEach(() => {
    sessionServiceMock = jasmine.createSpyObj('SessionService', ['logout']);
    //definisco l'utente per il test della sottoscrizione
    sessionServiceMock.user = new BehaviorSubject<User | null>(null);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([
        {path: '', component:HomepageComponent},
        {path: 'login', component:LoginComponent}])],
      providers: [
        { provide: SessionService, useValue: sessionServiceMock}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomepageComponent);
    component = fixture.componentInstance;
    sessionServiceMock = TestBed.inject(SessionService);
    router = TestBed.inject(Router);
    component['userSub'] = sessionServiceMock.user.subscribe();
  });

  afterEach(()=>{
    fixture.destroy();
  })

  // Test costruttore
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('OnInit', ()=>{

    it('should initialize properties with user value when data are available', () => {
      const userMock = new User(
        'Marione',
        'mario.rossi@example.it',
        'sessionToken',
        new Date()
      );
      sessionServiceMock.user.next(userMock);


      component.ngOnInit();

      expect(component.isSessionOpen).toBeTrue();
      expect(component.userName).toBe(userMock.name);
      expect(component.userEmail).toBe(userMock.email);
    });

    it('should initialize properties with default value when data are not available', () => {
      sessionServiceMock.user.next(null);

      component.ngOnInit();

      expect(component.isSessionOpen).toBeFalse();
      expect(component.userName).toBe('Ospite');
      expect(component.userEmail).toBe('');
    });

  })

  it('should log out and refresh page', fakeAsync(()=>{
    component.userName = 'Mario';
    component.userEmail = 'example@test.com';
    component.currentUrl = '';

    const navigateByUrlSpy = spyOn(router, 'navigateByUrl').and.returnValue(Promise.resolve(true));
    const navigateSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    component.logOut();

    expect(sessionServiceMock.logout).toHaveBeenCalled();
    expect(component.userName).toBe('Ospite');
    expect(component.userEmail).toBe('');

    tick();

    expect(navigateByUrlSpy).toHaveBeenCalledWith('/login', { skipLocationChange: true });
    expect(navigateSpy).toHaveBeenCalledWith([component.currentUrl]);

  }));

  it('should unsubscribe from user subscription', () => {
    spyOn(component['userSub'], 'unsubscribe');

    component.ngOnDestroy();

    expect(component['userSub'].unsubscribe).toHaveBeenCalled();
  });

});



