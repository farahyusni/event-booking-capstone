package com.eventbooking.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "bookings")
public class Booking {

    @Id
    private String id;

    @Indexed
    private String userId;

    @Indexed
    private String eventId;

    private int seatsBooked;

    private Status status; // CONFIRMED, CANCELLED

    private LocalDateTime bookedAt;

    public enum Status {
        CONFIRMED, CANCELLED
    }
}
