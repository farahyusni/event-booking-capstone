package com.eventbooking.service;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.eventbooking.dto.BookingRequest;
import com.eventbooking.model.Booking;
import com.eventbooking.model.Event;
import com.eventbooking.repository.BookingRepository;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final EventService eventService;

    public BookingService(BookingRepository bookingRepository, EventService eventService) {
        this.bookingRepository = bookingRepository;
        this.eventService = eventService;
    }

    public Booking createBooking(BookingRequest request, String userId) {
        // Check if the event exists
        Event event = eventService.getEventById(request.getEventId());

        if (event.isCancelled()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Event is cancelled");
        }

        if (event.getEventDate().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot book a past event");
        }

        boolean reserved = eventService.reserveSeats(event.getId(), request.getSeatsRequested());
        // Check if there are enough seats available
        if (!reserved) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Not enough seats available");
        }

        // Create the booking
        Booking booking = Booking.builder()
                .userId(userId)
                .eventId(event.getId())
                .seatsBooked(request.getSeatsRequested())
                .status(Booking.Status.CONFIRMED)
                .bookedAt(LocalDateTime.now())
                .build();
        

        return bookingRepository.save(booking);
    }
}
