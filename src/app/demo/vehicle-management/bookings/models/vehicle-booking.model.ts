export interface Vehicle {
  id: number;
  vehicleId?: string;
  vehicleNumber: string;
  vehicleModel?: string;
  vehicleType: string;
  status: string;
  model?: string;
}

export interface VehicleBooking {
  id: number;
  bookingId: string;
  vehicleId?: number;
  vehicle?: Vehicle;
  vehicleNo?: string;
  vehicleType: string;
  driverName: string;
  startedFrom: string;
  destination: string;
  date?: string;   // keep as string, Angular will parse it
  bookingStatus: string;
  vehicleStatus: string;
  bookingHire?: number;
  bookingAdvance?: number;
  bookingBalance?: number;
  bookingReceivedDate?: string;
  detain?: string;
  podReceived?: boolean;
  podDocument?: string;
  lorryBalancePaidDate?: string;
  bookingDate?: string;
}
