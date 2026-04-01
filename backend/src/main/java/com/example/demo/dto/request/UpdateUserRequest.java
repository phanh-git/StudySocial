package com.example.demo.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateUserRequest {
    @Size(max = 200, message = "Bio must be at most 200 characters")
    private String bio;

    private String avatarUrl;
}
