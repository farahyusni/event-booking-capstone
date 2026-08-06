package com.eventbooking.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "events")
public class Event {

    @Id
    private String id;

    private String title;

    private String description;

    @Indexed
    private String category;

    private LocalDateTime eventDate;

    private String venue;

    private int capacity;

    private int seatsAvailable;

    private double price;

    private boolean cancelled;

    private String createdBy; // admin user id

    private LocalDateTime createdAt;
}
