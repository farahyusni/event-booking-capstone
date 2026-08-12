package com.eventbooking.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eventbooking.dto.BookingsPerEventReport;
import com.eventbooking.dto.RevenuePerEventReport;
import com.eventbooking.service.ReportService;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/bookings-per-event")
    public List<BookingsPerEventReport> getBookingsPerEvent() {
        return reportService.getBookingsPerEvent();
    }

    @GetMapping("/revenue-per-event")
    public List<RevenuePerEventReport> getRevenuePerEvent() {
        return reportService.getRevenuePerEvent();
    }
}