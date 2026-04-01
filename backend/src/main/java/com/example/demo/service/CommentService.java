package com.example.demo.service;

import com.example.demo.dto.request.CommentRequest;
import com.example.demo.dto.response.CommentResponse;
import com.example.demo.entity.Comment;
import com.example.demo.entity.Post;
import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.exception.UnauthorizedException;
import com.example.demo.repository.CommentRepository;
import com.example.demo.repository.PostRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final AuthService authService;

    public Page<CommentResponse> getCommentsByPost(Long postId, Pageable pageable) {
        if (!postRepository.existsById(postId)) {
            throw new ResourceNotFoundException("Post not found");
        }
        return commentRepository.findByPostId(postId, pageable).map(this::mapToResponse);
    }

    @Transactional
    public CommentResponse createComment(Long postId, CommentRequest request, String username) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Comment comment = Comment.builder()
                .content(request.getContent())
                .post(post)
                .author(author)
                .build();
        return mapToResponse(commentRepository.save(comment));
    }

    @Transactional
    public void deleteComment(Long postId, Long commentId, String username) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
        if (!comment.getPost().getId().equals(postId)) {
            throw new BadRequestException("Comment does not belong to post");
        }
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!comment.getAuthor().getUsername().equals(username) && user.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("You can only delete your own comments");
        }
        commentRepository.delete(comment);
    }

    private CommentResponse mapToResponse(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .author(authService.mapToUserResponse(comment.getAuthor()))
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
