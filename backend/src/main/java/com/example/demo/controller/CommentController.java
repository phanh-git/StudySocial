package com.example.demo.controller;

import com.example.demo.dto.request.CommentRequest;
import com.example.demo.dto.response.CommentResponse;
import com.example.demo.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts/{postId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @GetMapping
    public ResponseEntity<Page<CommentResponse>> getComments(
            @PathVariable Long postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").ascending());
        return ResponseEntity.ok(commentService.getCommentsByPost(postId, pageable));
    }

    @PostMapping
    public ResponseEntity<CommentResponse> createComment(
            @PathVariable Long postId,
            @Valid @RequestBody CommentRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(commentService.createComment(postId, request, userDetails.getUsername()));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long postId,
            @PathVariable Long commentId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        commentService.deleteComment(postId, commentId, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
