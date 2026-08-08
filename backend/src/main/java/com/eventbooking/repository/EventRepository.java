package com.eventbooking.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.eventbooking.model.Event;

public interface EventRepository extends MongoRepository<Event, String> {

    Page<Event> findByCategoryIgnoreCase(String category, Pageable pageable);

    Page<Event> findByTitleContainingIgnoreCase(String keyword, Pageable pageable);

    Page<Event> findByCategoryIgnoreCaseAndTitleContainingIgnoreCase(String category, String keyword, Pageable pageable);
}