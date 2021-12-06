import { TestBed } from '@angular/core/testing';

import { GuardisadminGuard } from './guardisadmin.guard';

describe('GuardisadminGuard', () => {
  let guard: GuardisadminGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(GuardisadminGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
