package com.eventbooking.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;

import com.eventbooking.dto.BookingsPerEventReport;
import com.eventbooking.dto.EventBookingTotals;
import com.eventbooking.dto.RevenuePerEventReport;
import com.eventbooking.model.Booking;
import com.eventbooking.model.Event;

@Service
public class ReportService {

    private final MongoTemplate mongoTemplate;
    private final EventService eventService;

    public ReportService(MongoTemplate mongoTemplate, EventService eventService) {
        this.mongoTemplate = mongoTemplate;
        this.eventService = eventService;
    }

    public List<BookingsPerEventReport> getBookingsPerEvent() {
        List<BookingsPerEventReport> report = new ArrayList<>();

        for (EventBookingTotals totals : getEventBookingTotals()) {
            Event event = eventService.getEventById(totals.getId());
            report.add(new BookingsPerEventReport(
                    event.getId(), event.getTitle(), totals.getTotalBookings(), totals.getTotalSeatsBooked()));
        }

        report.sort((a, b) -> Long.compare(b.getTotalBookings(), a.getTotalBookings()));
        return report;
    }

    public List<RevenuePerEventReport> getRevenuePerEvent() {
        List<RevenuePerEventReport> report = new ArrayList<>();

        for (EventBookingTotals totals : getEventBookingTotals()) {
            Event event = eventService.getEventById(totals.getId());
            double revenue = totals.getTotalSeatsBooked() * event.getPrice();
            report.add(new RevenuePerEventReport(
                    event.getId(), event.getTitle(), totals.getTotalSeatsBooked(), revenue));
        }

        report.sort((a, b) -> Double.compare(b.getRevenue(), a.getRevenue()));
        return report;
    }

    private List<EventBookingTotals> getEventBookingTotals() {
        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("status").is(Booking.Status.CONFIRMED)),
                Aggregation.group("eventId")
                        .count().as("totalBookings")
                        .sum("seatsBooked").as("totalSeatsBooked")
        );

        AggregationResults<EventBookingTotals> results =
                mongoTemplate.aggregate(aggregation, Booking.class, EventBookingTotals.class);

        return results.getMappedResults();
    }
}