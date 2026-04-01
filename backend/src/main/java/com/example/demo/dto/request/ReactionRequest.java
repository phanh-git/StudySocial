package com.example.demo.dto.request;

import com.example.demo.entity.ReactionType;
import lombok.Data;

@Data
public class ReactionRequest {
    private ReactionType reactionType = ReactionType.LIKE;
}
