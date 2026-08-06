package com.eventbooking.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.eventbooking.model.Event;

public interface EventRepository extends MongoRepository<Event, String>{

}
