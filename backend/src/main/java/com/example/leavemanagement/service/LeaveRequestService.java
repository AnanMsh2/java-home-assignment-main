package com.example.leavemanagement.service;

import com.example.leavemanagement.dto.CreateLeaveRequestDto;
import com.example.leavemanagement.model.Employee;
import com.example.leavemanagement.model.LeaveRequest;
import com.example.leavemanagement.model.LeaveStatus;
import com.example.leavemanagement.model.LeaveType;
import com.example.leavemanagement.repository.EmployeeRepository;
import com.example.leavemanagement.repository.LeaveRequestRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class LeaveRequestService {

    private final EmployeeRepository employeeRepository;
    private final LeaveRequestRepository leaveRequestRepository;

    public LeaveRequestService(EmployeeRepository employeeRepository,
                               LeaveRequestRepository leaveRequestRepository) {
        this.employeeRepository = employeeRepository;
        this.leaveRequestRepository = leaveRequestRepository;
    }

    public List<LeaveRequest> getAll() {
        return leaveRequestRepository.findAll().stream()
                .sorted((a, b) -> b.getStartDate().compareTo(a.getStartDate()))
                .toList();
    }

    public List<LeaveRequest> search(String name) {
        return leaveRequestRepository.searchByEmployeeName(name);
    }

    @Transactional
    public ResponseEntity<?> create(CreateLeaveRequestDto dto) {
        Employee employee = employeeRepository.findById(dto.getEmployeeId()).orElse(null);
        if (employee == null) {
            return ResponseEntity.status(404).body("Employee not found");
        }

        int days = (int) ChronoUnit.DAYS.between(dto.getStartDate(), dto.getEndDate()) + 1;

        int used = leaveRequestRepository
                .findByEmployeeIdAndTypeAndStatus(dto.getEmployeeId(), LeaveType.VACATION, LeaveStatus.APPROVED)
                .stream()
                .mapToInt(LeaveRequest::getDays)
                .sum();

        if (dto.getType() == LeaveType.VACATION && (used + days) > employee.getAnnualQuota()) {
            return ResponseEntity.badRequest().body("Not enough vacation balance");
        }

        LeaveRequest request = new LeaveRequest();
        request.setEmployeeId(dto.getEmployeeId());
        request.setType(dto.getType());
        request.setStartDate(dto.getStartDate());
        request.setEndDate(dto.getEndDate());
        request.setDays(days);
        request.setStatus(LeaveStatus.PENDING);

        leaveRequestRepository.save(request);

        return ResponseEntity.ok(request);
    }

    @Transactional
    public ResponseEntity<?> approve(Long id) {
        LeaveRequest request = leaveRequestRepository.findById(id).orElse(null);
        if (request == null) {
            return ResponseEntity.status(404).body("Leave request not found");
        }

        if (request.getStatus() != LeaveStatus.PENDING) {
            return ResponseEntity.badRequest().body("Request is already " + request.getStatus());
        }

        if (request.getType() == LeaveType.VACATION) {
            Employee employee = employeeRepository.findById(request.getEmployeeId()).orElse(null);
            if (employee == null) {
                return ResponseEntity.status(404).body("Employee not found");
            }

            int usedDays = leaveRequestRepository
                    .findByEmployeeIdAndTypeAndStatus(employee.getId(), LeaveType.VACATION, LeaveStatus.APPROVED)
                    .stream()
                    .mapToInt(LeaveRequest::getDays)
                    .sum();

            if ((usedDays + request.getDays()) > employee.getAnnualQuota()) {
                return ResponseEntity.badRequest().body("Approving this request exceeds annual quota");
            }
        }

        request.setStatus(LeaveStatus.APPROVED);
        leaveRequestRepository.save(request);

        return ResponseEntity.ok(request);
    }
}
