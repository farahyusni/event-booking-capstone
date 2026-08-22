package com.eventbooking.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.eventbooking.dto.EventRequest;
import com.eventbooking.model.Event;
import com.eventbooking.service.EventService;

import jakarta.validation.Valid;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public Page <Event> getAllEvents(
        @RequestParam(required = false) String category,
        @RequestParam(required = false) String keyword,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(defaultValue = "eventDate") String sortBy,
        @RequestParam(defaultValue = "asc") String direction,
        @RequestParam(defaultValue = "false") boolean includeInactive,
        @AuthenticationPrincipal Jwt jwt) {

            // Cancelled and past events are admin-only. The role is read from the signed
            // token, not from the request, so a customer passing includeInactive=true by
            // hand still gets the filtered list.
            boolean isAdmin = "ADMIN".equals(jwt.getClaimAsString("role"));
            boolean showInactive = includeInactive && isAdmin;

            Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);

            return eventService.getEvents(category, keyword, showInactive, pageable);
    }

    @GetMapping("/{id}")
    public Event getEventById(@PathVariable String id) {
        return eventService.getEventById(id);
    }
    
    @PostMapping
    public ResponseEntity<Event> createEvent(@Valid @RequestBody EventRequest request, @AuthenticationPrincipal Jwt jwt) {
        Event createdEvent = eventService.createEvent(request, jwt.getClaimAsString("userId"));
        return ResponseEntity.status(HttpStatus.CREATED).body(createdEvent);
    }

    @PutMapping("/{id}")
    public Event updateEvent(@PathVariable String id, @Valid @RequestBody EventRequest request) {
        return eventService.updateEvent(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivateEvent(@PathVariable String id) {
        eventService.deactivateEvent(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/reactivate")
    public ResponseEntity<Void> reactivateEvent(@PathVariable String id) {
        eventService.reactivateEvent(id);
        return ResponseEntity.noContent().build();
    }
}
