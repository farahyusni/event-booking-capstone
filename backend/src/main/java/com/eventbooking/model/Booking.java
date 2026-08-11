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
    private String id;  // PK for Booking

    @Indexed
    private String userId;  // is indexed for faster search

    @Indexed
    private String eventId; // is indexed for faster search

    private int seatsBooked;

    private Status status; 

    private LocalDateTime bookedAt;

    public enum Status {
        CONFIRMED, CANCELLED
    }
}
