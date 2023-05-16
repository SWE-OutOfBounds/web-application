import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ClockCaptchaService } from './clock-captcha.service';
import { environment } from 'src/environments/enviroment';


describe('ClockCaptchaService', () => {
  let service: ClockCaptchaService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ClockCaptchaService]
    });

    service = TestBed.inject(ClockCaptchaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#ccInit', () => {
    it('should return an Observable with clock captcha image and token', () => {
      const mockResponse = {
        image: 'https://example.com/clock-captcha.png',
        token: 'abc123'
      };

      service.ccInit().subscribe((response: any) => {
        expect(response.cc_content).toEqual(mockResponse.image);
        expect(response.cc_token).toEqual(mockResponse.token);
      });

      const req = httpMock.expectOne(environment.backendLocation + 'clock-captcha');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return an Observable with error if HTTP request fails', () => {
      const mockError = { status: 404, statusText: 'Not Found' };

      service.ccInit().subscribe((response: any) => {
        expect(response.success).toBeFalsy();
        expect(response.status).toEqual(mockError.status);
      });

      const req = httpMock.expectOne(environment.backendLocation + 'clock-captcha');
      expect(req.request.method).toBe('GET');
      req.flush(null, mockError);
    });
  });
});
