import { TestBed } from '@angular/core/testing';

import { TokeninterceptorserviceService } from './tokeninterceptorservice.service';

describe('TokeninterceptorserviceService', () => {
  let service: TokeninterceptorserviceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokeninterceptorserviceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
