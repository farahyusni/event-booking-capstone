package com.eventbooking.service;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.eventbooking.dto.AuthResponse;
import com.eventbooking.dto.LoginRequest;
import com.eventbooking.dto.RegisterRequest;
import com.eventbooking.model.User;
import com.eventbooking.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        // Registration : Create a new user, encode the password, save to the database, and generate a JWT token
        // Return an AuthResponse with the token and user details

        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {  // Check if the email already exists in the database
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists: " + email);
        }

        User user = User.builder()
                .name(request.getName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))    // Encode the password before saving, never store raw passwords
                .role(User.Role.CUSTOMER) // Default role for new users
                .createdAt(LocalDateTime.now())
                .build();

        User savedUser = userRepository.save(user);

        return buildAuthResponse(savedUser);    // generate jwt token
    }

    public AuthResponse login(LoginRequest request) {
        // Authentication logic : Authenticate the user, generate a JWT token, and return an AuthResponse

        String email = request.getEmail().trim().toLowerCase();

        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, request.getPassword()));  //verify the email and password, if invalid, it will throw an exception

        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        return buildAuthResponse(user); // generate jwt token
    }

    private AuthResponse buildAuthResponse(User user) {
        String token = jwtService.generateToken(user);

        return new AuthResponse(token, "Bearer", jwtService.getExpirationMinutes(), user.getId(), user.getName(),user.getEmail(), user.getRole().name());
    }   // token contains userId, name, email, role, and expiration time in minutes
}
