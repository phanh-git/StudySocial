package com.example.demo.service;

import com.example.demo.dto.request.ReactionRequest;
import com.example.demo.dto.response.LikeResponse;
import com.example.demo.entity.Like;
import com.example.demo.entity.Post;
import com.example.demo.entity.ReactionType;
import com.example.demo.entity.User;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.LikeRepository;
import com.example.demo.repository.PostRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LikeService {

    private final LikeRepository likeRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    @Transactional
    public LikeResponse react(Long postId, ReactionRequest request, String username) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        ReactionType reactionType = request.getReactionType() != null ? request.getReactionType() : ReactionType.LIKE;
        Optional<Like> existingLike = likeRepository.findByUserIdAndPostId(user.getId(), postId);
        if (existingLike.isPresent()) {
            Like like = existingLike.get();
            if (like.getReactionType() == reactionType) {
                likeRepository.delete(like);
                long count = likeRepository.countByPostId(postId);
                return LikeResponse.builder()
                        .postId(postId)
                        .likeCount(count)
                        .liked(false)
                        .reactionType(null)
                        .build();
            } else {
                like.setReactionType(reactionType);
                likeRepository.save(like);
                long count = likeRepository.countByPostId(postId);
                return LikeResponse.builder()
                        .postId(postId)
                        .likeCount(count)
                        .liked(true)
                        .reactionType(reactionType)
                        .build();
            }
        }
        Like newLike = Like.builder()
                .user(user)
                .post(post)
                .reactionType(reactionType)
                .build();
        likeRepository.save(newLike);
        long count = likeRepository.countByPostId(postId);
        return LikeResponse.builder()
                .postId(postId)
                .likeCount(count)
                .liked(true)
                .reactionType(reactionType)
                .build();
    }

    @Transactional
    public LikeResponse unlike(Long postId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        likeRepository.findByUserIdAndPostId(user.getId(), postId)
                .ifPresent(likeRepository::delete);
        long count = likeRepository.countByPostId(postId);
        return LikeResponse.builder()
                .postId(postId)
                .likeCount(count)
                .liked(false)
                .build();
    }
}
