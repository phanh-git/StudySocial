package com.example.demo.dto.request;

import com.example.demo.entity.PostType;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PostRequest {
    @NotBlank(message = "Content is required")
    private String content;

    private PostType type = PostType.DISCUSSION;

    private Long subjectId;

    private Long groupId;
}
