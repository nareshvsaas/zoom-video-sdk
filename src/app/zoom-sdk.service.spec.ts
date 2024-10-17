import { TestBed } from '@angular/core/testing';

import { ZoomSdkService } from './zoom-sdk.service';

describe('ZoomSdkService', () => {
  let service: ZoomSdkService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ZoomSdkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
