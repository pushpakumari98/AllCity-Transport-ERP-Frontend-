import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PurchaseService } from '../vehicle-management/purchase/services/purchase.service';
import { VehiclePurchase } from '../vehicle-management/purchase/models/vehicle-purchase.model';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { AuthInterceptor } from '../../shared/interceptors/auth.interceptor';

describe('JWT Token Implementation Verification', () => {
  let purchaseService: PurchaseService;
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PurchaseService,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true
        }
      ]
    });

    purchaseService = TestBed.inject(PurchaseService);
    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);

    // Mock localStorage
    spyOn(localStorage, 'getItem').and.returnValue('test-jwt-token');
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add JWT token to PUT requests (updatePurchase)', () => {
    const testPurchase: VehiclePurchase = {
      id: 1,
      date: '2023-01-01',
      vehicleNo: 'KA01AB1234',
      bookingHire: 1000,
      bookingReceivingBalanceDate: '2023-01-02',
      fromLocation: 'Bangalore',
      toLocation: 'Mysore',
      transportName: 'Test Transport',
      detain: 'No',
      podReceivedDate: '2023-01-03',
      lorryBalancePaidDate: '2023-01-04'
    };

    purchaseService.updatePurchase(testPurchase).subscribe();

    const req = httpMock.expectOne(`${purchaseService['apiUrl']}/${testPurchase.id}`);
    expect(req.request.method).toBe('PUT');

    // Verify Authorization header is present
    expect(req.request.headers.has('Authorization')).toBeTrue();
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-jwt-token');
  });

  it('should add JWT token to DELETE requests (deletePurchase)', () => {
    const testId = 1;

    purchaseService.deletePurchase(testId).subscribe();

    const req = httpMock.expectOne(`${purchaseService['apiUrl']}/${testId}`);
    expect(req.request.method).toBe('DELETE');

    // Verify Authorization header is present
    expect(req.request.headers.has('Authorization')).toBeTrue();
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-jwt-token');
  });

  it('should add JWT token to POST requests (addPurchase)', () => {
    const testPurchase: VehiclePurchase = {
      date: '2023-01-01',
      vehicleNo: 'KA01AB1234',
      bookingHire: 1000,
      bookingReceivingBalanceDate: '2023-01-02',
      fromLocation: 'Bangalore',
      toLocation: 'Mysore',
      transportName: 'Test Transport',
      detain: 'No',
      podReceivedDate: '2023-01-03',
      lorryBalancePaidDate: '2023-01-04'
    };

    purchaseService.addPurchase(testPurchase).subscribe();

    const req = httpMock.expectOne(`${purchaseService['apiUrl']}`);
    expect(req.request.method).toBe('POST');

    // Verify Authorization header is present
    expect(req.request.headers.has('Authorization')).toBeTrue();
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-jwt-token');
  });

  it('should add JWT token to GET requests (getAllPurchases)', () => {
    purchaseService.getAllPurchases().subscribe();

    const req = httpMock.expectOne(`${purchaseService['apiUrl']}`);
    expect(req.request.method).toBe('GET');

    // Verify Authorization header is present
    expect(req.request.headers.has('Authorization')).toBeTrue();
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-jwt-token');
  });

  it('should not add Authorization header when no token is present', () => {
    // Override the mock to return null
    (localStorage.getItem as jasmine.Spy).and.returnValue(null);

    purchaseService.getAllPurchases().subscribe();

    const req = httpMock.expectOne(`${purchaseService['apiUrl']}`);
    expect(req.request.method).toBe('GET');

    // Verify Authorization header is NOT present
    expect(req.request.headers.has('Authorization')).toBeFalse();
  });
});
