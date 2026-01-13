export interface Department {
  id: number;
  name: string;
}

export interface Employee {
  id?: number;
  name: string;
  contactNo: string;
  email: string;
  designation: string;
  departmentId: number;
  role?: number;
  dateOfJoining?: string;
  qualificationDocument?: string;
}
