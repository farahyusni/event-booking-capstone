package com.eventbooking.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.eventbooking.dto.EventRequest;
import com.eventbooking.model.Event;
import com.eventbooking.repository.EventRepository;

@Service
public class EventService {

    private final EventRepository eventRepository;

    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public Event getEventById(String id) {
        return eventRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found" + id));
    }

    public Event createEvent(EventRequest request, String adminUserId) {
        Event event = Event.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .eventDate(request.getEventDate())
                .venue(request.getVenue())
                .capacity(request.getCapacity())
                .seatsAvailable(request.getCapacity())
                .price(request.getPrice())
                .cancelled(false)
                .createdBy(adminUserId)
                .createdAt(LocalDateTime.now())
                .build();

        return eventRepository.save(event);
    }

    public Event updateEvent(String id, EventRequest request) {
        Event event = getEventById(id);

        //seatsAvailable must track capacity changes without losing existing bookings
        int bookedSeats = event.getCapacity() - event.getSeatsAvailable();
        if (request.getCapacity() < bookedSeats) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Capacity cannot be less than the number of booked seats: " + bookedSeats);
        }

        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setCategory(request.getCategory());
        event.setEventDate(request.getEventDate());
        event.setVenue(request.getVenue());
        event.setCapacity(request.getCapacity());
        event.setSeatsAvailable(request.getCapacity() - bookedSeats); 
        event.setPrice(request.getPrice());

        return eventRepository.save(event);
    }

    public void deactivateEvent(String id) {
        Event event = getEventById(id);
        event.setCancelled(true);
        eventRepository.save(event);
    }
}
