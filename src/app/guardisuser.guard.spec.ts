import { TestBed } from '@angular/core/testing';

import { GuardisuserGuard } from './guardisuser.guard';

describe('GuardisuserGuard', () => {
  let guard: GuardisuserGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(GuardisuserGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
