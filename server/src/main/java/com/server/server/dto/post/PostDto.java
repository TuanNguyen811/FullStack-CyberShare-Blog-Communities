package com.server.server.dto.post;

import com.server.server.domain.PostStatus;
import com.server.server.dto.TagDto;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data
public class PostDto {
    private Long id;
    private Long authorId;
    private String authorUsername;
    private String authorDisplayName;
    private String authorAvatarUrl;
    private Long categoryId;
    private String categoryName;
    private String categorySlug;
    private String title;
    private String slug;
    private String summary;
    private Set<TagDto> tags;
    private String content;
    private String coverImageUrl;
    private PostStatus status;
    private Long views;
    private Integer likesCount;
    private Integer commentsCount;
    private Integer bookmarksCount;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
