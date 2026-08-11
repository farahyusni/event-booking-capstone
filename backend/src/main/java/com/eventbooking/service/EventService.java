package com.eventbooking.service;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.eventbooking.dto.EventRequest;
import com.eventbooking.model.Event;
import com.eventbooking.repository.EventRepository;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final MongoTemplate mongoTemplate;

    public EventService(EventRepository eventRepository, MongoTemplate mongoTemplate) {
        this.eventRepository = eventRepository;
        this.mongoTemplate = mongoTemplate;
    }

    public Page<Event> getEvents(String category, String keyword, Pageable pageable) {  // filter/search/plain-list from the repository
        boolean hasCategory = category != null && !category.isBlank();
        boolean hasKeyword = keyword != null && !keyword.isBlank();

        if (hasCategory && hasKeyword) {
            return eventRepository.findByCategoryIgnoreCaseAndTitleContainingIgnoreCase(category, keyword, pageable);
        }

        if(hasCategory) {
            return eventRepository.findByCategoryIgnoreCase(category, pageable);
        }

        if(hasKeyword) {
            return eventRepository.findByTitleContainingIgnoreCase(keyword, pageable);
        }

        return eventRepository.findAll(pageable);
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

        //seatsAvailable must track capacity changes without losing existing bookings\
        // Calculate the number of booked seats, so admin cannot reduce capacity below the number of already booked seats
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

    // to avoid race conditions when multiple users are booking the same event at the same time
    public boolean reserveSeats(String eventId, int seats) {    // use MongoTemplate to atomically do the check and update in one operation 
        Query query = new Query(Criteria.where("id").is(eventId)    // check event id, not cancelled, and enough seats available
                .and("cancelled").is(false)
                .and("seatsAvailable").gte(seats));
        Update update = new Update().inc("seatsAvailable", -seats); // decrement the seatsAvailable by the number of seats requested

        Event updated = mongoTemplate.findAndModify(query, update, FindAndModifyOptions.options().returnNew(true), Event.class);

        return updated != null; // booking proceeds
    }

    public void releaseSeats(String eventId, int seats) {
        Query query = new Query(Criteria.where("id").is(eventId));
        Update update = new Update().inc("seatsAvailable", seats);
        mongoTemplate.updateFirst(query, update, Event.class);
    }
}
