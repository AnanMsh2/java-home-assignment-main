package com.example.leavemanagement.repository;

import com.example.leavemanagement.model.LeaveRequest;
import com.example.leavemanagement.model.LeaveStatus;
import com.example.leavemanagement.model.LeaveType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {

    List<LeaveRequest> findByEmployeeIdAndTypeAndStatus(Long employeeId, LeaveType type, LeaveStatus status);

    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.employeeId IN " +
           "(SELECT e.id FROM Employee e WHERE LOWER(e.name) LIKE LOWER(CONCAT('%', :name, '%')))")
    List<LeaveRequest> searchByEmployeeName(@Param("name") String name);
}
