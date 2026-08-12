package com.eventbooking.dto;

public class BookingsPerEventReport {
    private String eventId;
    private String eventTitle;
    private long totalBookings;
    private int totalSeatsBooked;

    public BookingsPerEventReport(String eventId, String eventTitle, long totalBookings, int totalSeatsBooked) {
        this.eventId = eventId;
        this.eventTitle = eventTitle;
        this.totalBookings = totalBookings;
        this.totalSeatsBooked = totalSeatsBooked;
    }

    public String getEventId() { 
        return eventId; 
    }
    
    public String getEventTitle() { 
        return eventTitle; 
    }


    public long getTotalBookings() { 
        return totalBookings; 
    }
    
    public int getTotalSeatsBooked() { 
        return totalSeatsBooked; 
    }
}