package com.example.demo.dto.response;

import com.example.demo.entity.PostType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PostResponse {
    private Long id;
    private String content;
    private UserResponse author;
    private SubjectResponse subject;
    private GroupResponse group;
    private PostType type;
    private long commentCount;
    private long likeCount;
    private Map<String, Long> reactionCounts;
    private boolean likedByCurrentUser;
    private String currentUserReaction;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
