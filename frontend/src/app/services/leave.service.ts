import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee, LeaveRequest, CreateLeaveRequestDto } from '../models/leave-request.model';

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private apiUrl = 'http://localhost:5080/api/leave-requests';
  private employeesUrl = 'http://localhost:5080/api/employees';

  constructor(private http: HttpClient) {}

  getRequests(): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(this.apiUrl);
  }

  searchRequests(name: string): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(`${this.apiUrl}/search?name=${encodeURIComponent(name)}`);
  }

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.employeesUrl);
  }

  createRequest(dto: CreateLeaveRequestDto): Observable<LeaveRequest> {
    return this.http.post<LeaveRequest>(this.apiUrl, dto);
  }

  approveRequest(id: number): Observable<LeaveRequest> {
    return this.http.post<LeaveRequest>(`${this.apiUrl}/${id}/approve`, {});
  }
}
