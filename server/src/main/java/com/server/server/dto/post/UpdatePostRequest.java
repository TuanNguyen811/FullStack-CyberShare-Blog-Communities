package com.server.server.dto.post;

import com.server.server.domain.PostStatus;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdatePostRequest {
    
    @Size(min = 3, max = 255, message = "Title must be between 3 and 255 characters")
    private String title;
    
    private String content;
    
    private Long categoryId;
    
    @Size(max = 500, message = "Cover image URL must not exceed 500 characters")
    private String coverImageUrl;
    
    private PostStatus status;
}
