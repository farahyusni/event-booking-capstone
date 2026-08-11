package com.eventbooking.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eventbooking.dto.BookingRequest;
import com.eventbooking.model.Booking;
import com.eventbooking.service.BookingService;

import jakarta.validation.Valid;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;



@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<Booking> createBooking(@Valid @RequestBody BookingRequest request, @AuthenticationPrincipal Jwt jwt) {
        Booking booking = bookingService.createBooking(request, jwt.getClaimAsString("userId"));

        return ResponseEntity.status(HttpStatus.CREATED).body(booking);
    }
    
    @GetMapping("/mine")
    public List<Booking> getMyBookings(@AuthenticationPrincipal Jwt jwt) {
        return bookingService.getMyBookings(jwt.getClaimAsString("userId"));
    }

    @GetMapping
    public List<Booking> getAllBookings() {
        return bookingService.getAllBookings();
    }
    
    @DeleteMapping("/{id}")
    public Booking cancelBooking(@PathVariable String id, @AuthenticationPrincipal Jwt jwt) {
        return bookingService.cancelBooking(id, jwt.getClaimAsString("userId"));
    }
}
