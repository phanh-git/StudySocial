package com.example.demo.dto.response;

import com.example.demo.entity.ReactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LikeResponse {
    private Long postId;
    private long likeCount;
    private boolean liked;
    private ReactionType reactionType;
}
