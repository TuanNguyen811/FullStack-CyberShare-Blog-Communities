package com.server.server.dto.post;

import com.server.server.domain.PostStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PostListDto {
    private Long id;
    private String authorUsername;
    private String authorDisplayName;
    private String authorAvatarUrl;
    private String categoryName;
    private String title;
    private String slug;
    private String coverImageUrl;
    private PostStatus status;
    private Long views;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
}
