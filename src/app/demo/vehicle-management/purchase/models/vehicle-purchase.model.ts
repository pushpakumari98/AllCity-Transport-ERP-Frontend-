export interface VehiclePurchase {
  slNo?: number;
  id?: number;
  date: string;
  purchaseDate?: string;
  vehicleNo: string;
  vehicleNumber?: string;
  vehicleModel?: string;
  price?: number;
  vendorName?: string;
  paymentMode?: string;
  bookingHire?: number;
  bookingReceivingBalanceDate?: string;
  fromLocation?: string;
  toLocation?: string;
  transportName?: string;
  detain?: string;
  podReceivedDate?: string;
  lorryBalancePaidDate?: string;
}
