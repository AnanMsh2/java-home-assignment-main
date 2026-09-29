package com.example.leavemanagement.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonValue;

@JsonFormat(shape = JsonFormat.Shape.NUMBER)
public enum LeaveStatus {
    PENDING,    // 0
    APPROVED,   // 1
    REJECTED;   // 2

    @JsonValue
    public int toValue() {
        return ordinal();
    }

    @JsonCreator
    public static LeaveStatus fromValue(int value) {
        for (LeaveStatus status : LeaveStatus.values()) {
            if (status.ordinal() == value) {
                return status;
            }
        }
        return PENDING;
    }
}
