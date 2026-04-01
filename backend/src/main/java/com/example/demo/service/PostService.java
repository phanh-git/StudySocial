package com.example.demo.service;

import com.example.demo.dto.request.PostRequest;
import com.example.demo.dto.response.PostResponse;
import com.example.demo.dto.response.SubjectResponse;
import com.example.demo.entity.*;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.exception.UnauthorizedException;
import com.example.demo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final StudyGroupRepository groupRepository;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;
    private final AuthService authService;

    public Page<PostResponse> getPosts(Long subjectId, Long groupId, PostType type, String keyword, String currentUsername, Pageable pageable) {
        Page<Post> posts;
        if (keyword != null && !keyword.isBlank() && subjectId != null) {
            posts = postRepository.searchByContentAndSubject(keyword, subjectId, pageable);
        } else if (keyword != null && !keyword.isBlank()) {
            posts = postRepository.searchByContent(keyword, pageable);
        } else if (subjectId != null) {
            posts = postRepository.findBySubjectId(subjectId, pageable);
        } else if (groupId != null) {
            posts = postRepository.findByGroupId(groupId, pageable);
        } else if (type != null) {
            posts = postRepository.findByType(type, pageable);
        } else {
            posts = postRepository.findAll(pageable);
        }
        User currentUser = currentUsername != null ? userRepository.findByUsername(currentUsername).orElse(null) : null;
        return posts.map(p -> mapToResponse(p, currentUser));
    }

    public PostResponse getPostById(Long id, String currentUsername) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        User currentUser = currentUsername != null ? userRepository.findByUsername(currentUsername).orElse(null) : null;
        return mapToResponse(post, currentUser);
    }

    @Transactional
    public PostResponse createPost(PostRequest request, String username) {
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Subject subject = null;
        if (request.getSubjectId() != null) {
            subject = subjectRepository.findById(request.getSubjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
        }
        StudyGroup group = null;
        if (request.getGroupId() != null) {
            group = groupRepository.findById(request.getGroupId())
                    .orElseThrow(() -> new ResourceNotFoundException("Group not found"));
        }
        Post post = Post.builder()
                .content(request.getContent())
                .author(author)
                .subject(subject)
                .group(group)
                .type(request.getType() != null ? request.getType() : PostType.DISCUSSION)
                .build();
        return mapToResponse(postRepository.save(post), author);
    }

    @Transactional
    public PostResponse updatePost(Long id, PostRequest request, String username) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        if (!post.getAuthor().getUsername().equals(username)) {
            throw new UnauthorizedException("You can only edit your own posts");
        }
        post.setContent(request.getContent());
        if (request.getType() != null) {
            post.setType(request.getType());
        }
        if (request.getSubjectId() != null) {
            Subject subject = subjectRepository.findById(request.getSubjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
            post.setSubject(subject);
        }
        User author = userRepository.findByUsername(username).orElse(null);
        return mapToResponse(postRepository.save(post), author);
    }

    @Transactional
    public void deletePost(Long id, String username) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!post.getAuthor().getUsername().equals(username) && user.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("You can only delete your own posts");
        }
        postRepository.delete(post);
    }

    public PostResponse mapToResponse(Post post, User currentUser) {
        long likeCount = likeRepository.countByPostId(post.getId());
        long commentCount = commentRepository.countByPostId(post.getId());
        boolean liked = false;
        String currentUserReaction = null;
        Map<String, Long> reactionCounts = new HashMap<>();
        if (currentUser != null) {
            var likeOpt = likeRepository.findByUserIdAndPostId(currentUser.getId(), post.getId());
            if (likeOpt.isPresent()) {
                liked = true;
                currentUserReaction = likeOpt.get().getReactionType().name();
            }
        }
        post.getLikes().forEach(like -> {
            String key = like.getReactionType().name();
            reactionCounts.merge(key, 1L, Long::sum);
        });
        SubjectResponse subjectResponse = null;
        if (post.getSubject() != null) {
            subjectResponse = SubjectResponse.builder()
                    .id(post.getSubject().getId())
                    .name(post.getSubject().getName())
                    .description(post.getSubject().getDescription())
                    .build();
        }
        return PostResponse.builder()
                .id(post.getId())
                .content(post.getContent())
                .author(authService.mapToUserResponse(post.getAuthor()))
                .subject(subjectResponse)
                .type(post.getType())
                .commentCount(commentCount)
                .likeCount(likeCount)
                .reactionCounts(reactionCounts)
                .likedByCurrentUser(liked)
                .currentUserReaction(currentUserReaction)
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }
}
