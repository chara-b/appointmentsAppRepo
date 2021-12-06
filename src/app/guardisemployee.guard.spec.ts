import { TestBed } from '@angular/core/testing';

import { GuardisemployeeGuard } from './guardisemployee.guard';

describe('GuardisemployeeGuard', () => {
  let guard: GuardisemployeeGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(GuardisemployeeGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
