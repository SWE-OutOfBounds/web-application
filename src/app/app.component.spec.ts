import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { SessionService } from './services/session/session.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  let sessionServiceMock: jasmine.SpyObj<SessionService>;

  beforeEach(() => {
    const mock = jasmine.createSpyObj<SessionService>('SessionService', [
      'autoLogin',
    ]);

    TestBed.configureTestingModule({
      declarations: [AppComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{ provide: SessionService, useValue: mock }],
    });

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    sessionServiceMock = TestBed.inject(
      SessionService
    ) as jasmine.SpyObj<SessionService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call autoLogin during initialization', () => {
    component.ngOnInit();
    expect(sessionServiceMock.autoLogin).toHaveBeenCalled();
  });
});
