# JWT Token Implementation for PUT and DELETE Requests

## Overview

This document explains how JWT tokens are automatically added to all HTTP requests (including PUT and DELETE) in the AllCity Transport Angular application.

## Current Implementation

### 1. Auth Interceptor

The application uses an **AuthInterceptor** (`src/app/shared/interceptors/auth.interceptor.ts`) that automatically adds JWT tokens to **ALL** HTTP requests:

```typescript
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');

    // Add JWT token to all requests (GET, POST, PUT, DELETE)
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(req);
  }
}
```

### 2. Interceptor Registration

The interceptor is registered in `src/main.ts`:

```typescript
{
  provide: HTTP_INTERCEPTORS,
  useClass: AuthInterceptor,
  multi: true
}
```

### 3. How It Works

- **Automatic JWT Injection**: The interceptor automatically adds the `Authorization: Bearer <token>` header to **every** HTTP request made through Angular's `HttpClient`.
- **Token Storage**: The JWT token is stored in `localStorage` under the key `'token'`.
- **All HTTP Methods**: This includes GET, POST, PUT, DELETE, PATCH, etc.

## Services Using JWT

All services in the application automatically benefit from this implementation:

### ✅ Purchase Service (`purchase.service.ts`)
- `updatePurchase()` - PUT request with JWT
- `deletePurchase()` - DELETE request with JWT

### ✅ Vehicle Service (`vehicle.service.ts`)
- `updateVehicle()` - PUT request with JWT
- `updateVehicleWithFile()` - PUT request with JWT
- `deleteVehicle()` - DELETE request with JWT

### ✅ Booking Service (`booking.service.ts`)
- `updateBooking()` - PUT request with JWT
- `deleteBooking()` - DELETE request with JWT
- `updatePod()` - PUT request with JWT

### ✅ Admin Service (`admin.service.ts`)
- `updateEmployee()` - PUT request with JWT
- `deleteEmployee()` - DELETE request with JWT

## Testing the Implementation

### Example Usage

```typescript
// PUT request - JWT automatically added
this.purchaseService.updatePurchase(purchase).subscribe({
  next: (response) => console.log('Update successful', response),
  error: (error) => console.error('Update failed', error)
});

// DELETE request - JWT automatically added
this.purchaseService.deletePurchase(123).subscribe({
  next: () => console.log('Delete successful'),
  error: (error) => console.error('Delete failed', error)
});
```

### Verification

To verify that JWT tokens are being sent:

1. **Browser DevTools**: Open Network tab and check the request headers
2. **Backend Logs**: Check server logs for Authorization headers
3. **Error Handling**: If JWT is missing, the backend should return 401/403 errors

## Troubleshooting

### If JWT is not being sent:

1. **Check Token Storage**: Ensure `localStorage.getItem('token')` returns a valid token
2. **Verify Interceptor Registration**: Check that `HTTP_INTERCEPTORS` is properly configured
3. **Check Request Method**: Ensure you're using Angular's `HttpClient` (not raw fetch/XHR)
4. **Inspect Network Requests**: Use browser dev tools to verify headers

### Common Issues:

- **Token Expired**: The JWT token might be expired
- **No Token in Storage**: User might not be logged in
- **Interceptor Not Registered**: Check `main.ts` for proper registration
- **CORS Issues**: Backend might not accept Authorization header

## Best Practices

1. **Always use HttpClient**: The interceptor only works with Angular's `HttpClient`
2. **Handle token expiration**: Implement token refresh logic if needed
3. **Secure token storage**: Consider more secure storage options for production
4. **Error handling**: Properly handle 401/403 errors from the backend

## Conclusion

The AllCity Transport application **already implements JWT token sending for all HTTP requests**, including PUT and DELETE operations, through the AuthInterceptor. No additional changes are needed to the existing services as they automatically benefit from this global interceptor.
