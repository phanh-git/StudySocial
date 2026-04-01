package com.example.demo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GroupResponse {
    private Long id;
    private String name;
    private String description;
    private SubjectResponse subject;
    private UserResponse creator;
    private int memberCount;
    private LocalDateTime createdAt;
    private boolean isMember;
}
