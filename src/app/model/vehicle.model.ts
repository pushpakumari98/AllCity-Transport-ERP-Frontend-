import { PermitLevel } from '../enums/permit-level.enum';
import { VehicleType } from '../enums/vehicle-type.enum';
import { VehicleStatus } from '../enums/vehicle-status.enum';

export interface Vehicle {
  id?: number;
  vehicleId?: string;
  vehicleRegNo: string;
  vehicleType: VehicleType;
  permitLevel?: PermitLevel;
  driverMob?: number;
  price?: number;
  capacity?: number;
  description?: string;
  originCity?: string;
  destinationCity?: string;
  vehicleStatus?: VehicleStatus;
}
