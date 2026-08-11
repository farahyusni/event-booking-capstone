package com.eventbooking.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.eventbooking.model.Booking;

public interface BookingRepository extends MongoRepository<Booking, String>{

    List<Booking> findByUserId(String userId);  // customer can view their own bookings by userId
    List<Booking> findByEventId(String eventId);    // admin can view all bookings for a specific event by eventId
}
