package com.eventbooking.dto;

public class EventBookingTotals {
    private String id;
    private long totalBookings;
    private int totalSeatsBooked;

    public String getId() { 
        return id; 
    }

    public void setId(String id) { 
        this.id = id; 
    }
    
    public long getTotalBookings() { 
        return totalBookings; 
    }
    
    public void setTotalBookings(long totalBookings) { 
        this.totalBookings = totalBookings; 
    }
    
    public int getTotalSeatsBooked() { 
        return totalSeatsBooked; 
    }
    
    public void setTotalSeatsBooked(int totalSeatsBooked) { 
        this.totalSeatsBooked = totalSeatsBooked; 
    }
}