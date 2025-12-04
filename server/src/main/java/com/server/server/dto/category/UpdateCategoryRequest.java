package com.server.server.dto.category;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateCategoryRequest {
    @Size(max = 50, message = "Name must not exceed 50 characters")
    private String name;

    @Size(max = 200, message = "Description must not exceed 200 characters")
    private String description;
    
    @Size(max = 500, message = "Cover image URL must not exceed 500 characters")
    private String coverImageUrl;
}
