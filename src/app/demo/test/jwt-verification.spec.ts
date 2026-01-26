import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { AuthInterceptor } from '../../shared/interceptors/auth.interceptor';

describe('AuthInterceptor JWT Verification', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true
        }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should not add Authorization header when no token is present', () => {
    // Ensure no token is in localStorage
    (localStorage.getItem as jasmine.Spy).and.returnValue(null);

    // Make a test request
    http.get('/test').subscribe();

    // Verify the request
    const req = httpMock.expectOne('/test');

    // Check that Authorization header is not present
    expect(req.request.headers.has('Authorization')).toBeFalse();

    req.flush({});
  });

  it('should add Authorization header when token is present', () => {
    // Mock token in localStorage
    spyOn(localStorage, 'getItem').and.returnValue('test-token-123');

    // Make a test request
    http.get('/test').subscribe();

    // Verify the request
    const req = httpMock.expectOne('/test');

    // Check that Authorization header is present with correct format
    expect(req.request.headers.has('Authorization')).toBeTrue();
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token-123');

    req.flush({});
  });
});
