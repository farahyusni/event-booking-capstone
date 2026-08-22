package com.eventbooking.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.eventbooking.dto.UserResponse;
import com.eventbooking.model.User;
import com.eventbooking.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Used by the admin "All Bookings" page to turn a booking's stored userId
    // into a readable name/email — Booking documents only reference the id.
    public UserResponse getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + id));

        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole().name());
    }
}
