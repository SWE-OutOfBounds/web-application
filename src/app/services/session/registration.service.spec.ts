import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { RegistrationService } from './registration.service';
import { environment } from 'src/environments/enviroment';


describe('RegistrationService', () => {
  let service: RegistrationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RegistrationService]
    });

    service = TestBed.inject(RegistrationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should send a POST request to register a user', () => {
    const mockResponse = { details: 'CREATED' };
    const mockUserData = {
      firstName: 'Mario',
      lastName: 'Rossi',
      username: 'BigMario',
      email: 'mario.rossi@example.com',
      password: 'Password123',
      cc_token: 'token123',
      cc_input: 'input123'
    };

    service.signUp(
      mockUserData.firstName,
      mockUserData.lastName,
      mockUserData.username,
      mockUserData.email,
      mockUserData.password,
      mockUserData.cc_token,
      mockUserData.cc_input
    ).subscribe(response => {
      expect(response.okay).toBeTrue();
      expect(httpRequest.request.method).toBe('POST');
      expect(httpRequest.request.url).toBe(environment.backendLocation + 'users');
      expect(httpRequest.request.body).toEqual(mockUserData);
    });

    const httpRequest = httpMock.expectOne(environment.backendLocation + 'users');
    expect(httpRequest.request.method).toBe('POST');
    expect(httpRequest.request.headers.get('Content-Type')).toBe('application/json');
    expect(httpRequest.request.headers.get('x-secret-key')).toBe('LQbHd5h334ciuy7');
    httpRequest.flush(mockResponse);
  });


  it('should return an object with okay false and the error case if the response details is not CREATED', () => {
    const mockResponse = {
      details: 'SOME_ERROR',
    };
    const mockUserData = {
      firstName: 'Mario',
      lastName: 'Rossi',
      username: 'BigMario',
      email: 'mario.rossi@example.com',
      password: 'Password123',
      cc_token: 'token123',
      cc_input: 'input123'
    };

    service.signUp(
      mockUserData.firstName,
      mockUserData.lastName,
      mockUserData.username,
      mockUserData.email,
      mockUserData.password,
      mockUserData.cc_token,
      mockUserData.cc_input
      ).subscribe((response) => {
      expect(response).toEqual({ okay: false, case: '???' });
    });

    const req = httpMock.expectOne(`${environment.backendLocation}users`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should return an object with okay false and the error details if the request fails with a 4xx or 5xx error', () => {
    const mockErrorResponse = {
      details: 'ERROR_DETAILS'
    };

    const mockUserData = {
      firstName: 'Mario',
      lastName: 'Rossi',
      username: 'BigMario',
      email: 'mario.rossi@example.com',
      password: 'Password123',
      cc_token: 'token123',
      cc_input: 'input123'
    };

    service.signUp(
      mockUserData.firstName,
      mockUserData.lastName,
      mockUserData.username,
      mockUserData.email,
      mockUserData.password,
      mockUserData.cc_token,
      mockUserData.cc_input
      ).subscribe((response) => {
      expect(response).toEqual({ okay: false, case: 'ERROR_DETAILS' });
    });

    const req = httpMock.expectOne(`${environment.backendLocation}users`);
    expect(req.request.method).toBe('POST');
    req.flush(mockErrorResponse, { status: 400, statusText: 'Bad Request' });
  });
});
