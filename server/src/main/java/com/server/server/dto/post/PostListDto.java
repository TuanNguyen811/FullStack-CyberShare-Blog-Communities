package com.server.server.dto.post;

import com.server.server.domain.PostStatus;
import com.server.server.dto.TagDto;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data
public class PostListDto {
    private Long id;
    private String authorUsername;
    private String authorDisplayName;
    private String authorAvatarUrl;
    private String categoryName;
    private String title;
    private String summary;
    private String slug;
    private String coverImageUrl;
    private PostStatus status;
    private Long views;
    private Integer likesCount;
    private Integer commentsCount;
    private Integer bookmarksCount;
    private Set<TagDto> tags;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
}
