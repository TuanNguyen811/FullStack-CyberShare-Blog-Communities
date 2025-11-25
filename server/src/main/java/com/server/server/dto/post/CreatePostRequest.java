package com.server.server.dto.post;

import com.server.server.domain.PostStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Set;

@Data
public class CreatePostRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 255, message = "Title must be between 3 and 255 characters")
    private String title;

    @NotBlank(message = "Content is required")
    private String content;

    @Size(max = 500, message = "Summary must not exceed 500 characters")
    private String summary;

    private Set<String> tags;

    private Long categoryId;

    @Size(max = 500, message = "Cover image URL must not exceed 500 characters")
    private String coverImageUrl;

    private PostStatus status = PostStatus.DRAFT;
}
