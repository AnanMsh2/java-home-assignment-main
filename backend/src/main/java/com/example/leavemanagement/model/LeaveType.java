package com.example.leavemanagement.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonValue;

// Serialized as a number (0/1/2) to match the Angular client, which works with
// numeric codes. Mirrors how the original .NET POC exposed the enum.
@JsonFormat(shape = JsonFormat.Shape.NUMBER)
public enum LeaveType {
    VACATION,   // 0
    SICK,       // 1
    UNPAID;     // 2

    @JsonValue
    public int toValue() {
        return ordinal();
    }

    @JsonCreator
    public static LeaveType fromValue(int value) {
        for (LeaveType type : LeaveType.values()) {
            if (type.ordinal() == value) {
                return type;
            }
        }
        return VACATION;
    }
}
