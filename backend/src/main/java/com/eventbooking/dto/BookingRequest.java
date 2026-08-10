package com.eventbooking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public class BookingRequest {

    @NotBlank(message = "Event ID is required")
    private String eventId;

    @Positive(message = "Seats must be greater than 0")
    private int seatsRequested;

    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public int getSeatsRequested() {
        return seatsRequested;
    }

    public void setSeatsRequested(int seatsRequested) {
        this.seatsRequested = seatsRequested;
    }
}
