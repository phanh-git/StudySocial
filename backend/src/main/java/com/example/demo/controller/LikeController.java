package com.example.demo.controller;

import com.example.demo.dto.request.ReactionRequest;
import com.example.demo.dto.response.LikeResponse;
import com.example.demo.service.LikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts/{postId}/reactions")
@RequiredArgsConstructor
public class LikeController {

    private final LikeService likeService;

    @PostMapping
    public ResponseEntity<LikeResponse> react(
            @PathVariable Long postId,
            @RequestBody(required = false) ReactionRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        if (request == null) request = new ReactionRequest();
        return ResponseEntity.ok(likeService.react(postId, request, userDetails.getUsername()));
    }

    @DeleteMapping
    public ResponseEntity<LikeResponse> unlike(
            @PathVariable Long postId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(likeService.unlike(postId, userDetails.getUsername()));
    }
}
