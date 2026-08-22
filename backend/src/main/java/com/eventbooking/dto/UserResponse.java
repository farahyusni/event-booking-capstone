package com.eventbooking.dto;

// Deliberately NOT returning the User entity itself — that carries the BCrypt
// password hash, which would get serialised straight into the JSON response.
// This DTO exposes only the fields the admin UI actually needs.
public class UserResponse {

    private String id;
    private String name;
    private String email;
    private String role;

    public UserResponse(String id, String name, String email, String role) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
}
