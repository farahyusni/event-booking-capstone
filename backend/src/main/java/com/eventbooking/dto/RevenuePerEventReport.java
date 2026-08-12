package com.eventbooking.dto;

public class RevenuePerEventReport {
    private String eventId;
    private String eventTitle;
    private int totalSeatsBooked;
    private double revenue;

    public RevenuePerEventReport(String eventId, String eventTitle, int totalSeatsBooked, double revenue) {
        this.eventId = eventId;
        this.eventTitle = eventTitle;
        this.totalSeatsBooked = totalSeatsBooked;
        this.revenue = revenue;
    }

    public String getEventId() { 
        return eventId; 
    }

    public String getEventTitle() { 
        return eventTitle; 
    }

    public int getTotalSeatsBooked() { 
        return totalSeatsBooked; 
    }
    
    public double getRevenue() { 
        return revenue; 
    }
}