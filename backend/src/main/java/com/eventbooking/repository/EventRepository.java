package com.eventbooking.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.eventbooking.model.Event;

// Only the inherited CRUD methods are needed here (save, findById, findAll).
// Search/filter/sort/pagination moved to EventService.getEvents(), which builds
// one composed MongoTemplate query instead of needing a separate derived method
// for every combination of optional filters.
public interface EventRepository extends MongoRepository<Event, String> {

}
