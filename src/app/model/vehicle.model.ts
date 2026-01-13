import { PermitLevel } from '../enums/permit-level.enum';
import { VehicleType } from '../enums/vehicle-type.enum';
import { VehicleStatus } from '../enums/vehicle-status.enum';

export interface Vehicle {
  id?: number;
  vehicleId?: string;
  vehicleRegNo: string;
  permitLevel: PermitLevel;
  driverMob: number;
  vehicleType: VehicleType;
  price: number;
  capacity: number;
  description?: string;
  imageUrl?: string;
  originCity?: string;
  destinationCity?: string;
  vehicleStatus?: VehicleStatus;
  imageFile?: File;
}
