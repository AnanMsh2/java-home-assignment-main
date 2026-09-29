import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LeaveService } from '../services/leave.service';
import { Employee, LeaveRequest, LeaveType, LeaveStatus } from '../models/leave-request.model';

@Component({
  selector: 'app-leave-requests',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './leave-requests.component.html',
  styleUrls: ['./leave-requests.component.css']
})
export class LeaveRequestsComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private leaveService = inject(LeaveService);
  private fb = inject(FormBuilder);

  requests: LeaveRequest[] = [];
  employees: Employee[] = [];
  loading = false;
  submitting = false;

  // Track per-row approval loading state
  approvingIds: Set<number> = new Set();

  formMessage: { type: 'success' | 'error'; text: string } | null = null;
  tableMessage: { type: 'success' | 'error'; text: string } | null = null;

  requestForm: FormGroup = this.fb.group({
    employeeId: ['', Validators.required],
    type: [0, Validators.required],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required]
  }, { validators: this.dateRangeValidator });

  ngOnInit(): void {
    this.loadEmployees();
    this.loadRequests();
  }

  loadEmployees(): void {
    this.leaveService.getEmployees()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => (this.employees = data),
        error: (err) => console.error('Failed to load employees', err)
      });
  }

  loadRequests(): void {
    this.loading = true;
    this.leaveService.getRequests()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.requests = data;
          this.loading = false;
        },
        error: () => (this.loading = false)
      });
  }

  createRequest(): void {
    this.formMessage = null;

    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const val = this.requestForm.value;

    this.leaveService.createRequest({
      employeeId: Number(val.employeeId),
      type: Number(val.type),
      startDate: val.startDate,
      endDate: val.endDate
    })
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: () => {
        this.submitting = false;
        this.formMessage = { type: 'success', text: 'Leave request submitted successfully!' };
        this.requestForm.reset({ type: 0 });
        this.loadRequests();
      },
      error: (err) => {
        this.submitting = false;
        const msg = typeof err.error === 'string' ? err.error : 'Failed to create request';
        this.formMessage = { type: 'error', text: msg };
      }
    });
  }

  approve(id: number): void {
    this.tableMessage = null;
    this.approvingIds.add(id);

    this.leaveService.approveRequest(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updatedRequest) => {
          this.approvingIds.delete(id);
          
          const item = this.requests.find(r => r.id === id);
          if (item) {
            item.status = updatedRequest.status ?? LeaveStatus.APPROVED;
          }

          this.tableMessage = { 
            type: 'success', 
            text: `Request #${id} was approved successfully!` 
          };
        },
        error: (err) => {
          this.approvingIds.delete(id);
          const errorMsg = typeof err.error === 'string' ? err.error : 'Failed to approve request';
          this.tableMessage = { type: 'error', text: `Approval failed for request #${id}: ${errorMsg}` };
        }
      });
  }

  isApproving(id: number): boolean {
    return this.approvingIds.has(id);
  }

  typeLabel(type: number): string {
    if (type === LeaveType.VACATION || type === 0) return 'Vacation';
    if (type === LeaveType.SICK || type === 1) return 'Sick';
    return 'Unpaid';
  }

  statusLabel(status: number): string {
    if (status === LeaveStatus.PENDING || status === 0) return 'Pending';
    if (status === LeaveStatus.APPROVED || status === 1) return 'Approved';
    return 'Rejected';
  }

  private dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const start = control.get('startDate')?.value;
    const end = control.get('endDate')?.value;

    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);

      if (startDate > endDate) {
        return { invalidDateRange: true };
      }
    }
    return null;
  }
}
