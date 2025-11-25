package com.server.server.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private String displayName;
    private String bio;
    private String avatarUrl;
    private String role;
    private String status;
    private String authProvider;
    private Boolean emailVerified;
    private LocalDateTime createdAt;
    private Integer followersCount;
    private Integer followingCount;
    private Integer postsCount;
}
