export interface Driver {
  id?: number;
  serialNumber: string;
  date: string;
  vehicleNumber: string;
  driverName: string;
  startedFrom: string;
  destination: string;
  carryMaterialType: string;
  contactNumber: string;
  address: string;
  document?: string;
}
