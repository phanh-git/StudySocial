package com.example.demo.controller;

import com.example.demo.dto.response.UserResponse;
import com.example.demo.entity.User;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final AuthService authService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return ResponseEntity.ok(authService.mapToUserResponse(user));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateCurrentUser(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> body
    ) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (body.containsKey("bio")) {
            user.setBio(body.get("bio"));
        }
        if (body.containsKey("avatarUrl")) {
            user.setAvatarUrl(body.get("avatarUrl"));
        }
        return ResponseEntity.ok(authService.mapToUserResponse(userRepository.save(user)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return ResponseEntity.ok(authService.mapToUserResponse(user));
    }
}
