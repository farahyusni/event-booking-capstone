package com.eventbooking.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.eventbooking.model.User;

public interface UserRepository extends MongoRepository<User, String>{

    Optional<User> findByEmail(String email);   // use in login to find user by email for authentication
    boolean existsByEmail(String email);    // use in registration to check if email already exists
}
