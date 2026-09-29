export interface Employee {
  id: number;
  name: string;
  annualQuota: number;
}

export enum LeaveType {
  VACATION = 0,
  SICK = 1,
  UNPAID = 2
}

export enum LeaveStatus {
  PENDING = 0,
  APPROVED = 1,
  REJECTED = 2
}

export interface LeaveRequest {
  id: number;
  employeeId: number;
  employee?: Employee;
  type: LeaveType | number;
  startDate: string;
  endDate: string;
  status: LeaveStatus | number;
  days: number;
}

export interface CreateLeaveRequestDto {
  employeeId: number;
  type: LeaveType | number;
  startDate: string;
  endDate: string;
}
