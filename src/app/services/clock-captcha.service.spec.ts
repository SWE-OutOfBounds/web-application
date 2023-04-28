import { TestBed } from '@angular/core/testing';

import { ClockCaptchaService } from './clock-captcha.service';

describe('ClockCaptchaService', () => {
  let service: ClockCaptchaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClockCaptchaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
