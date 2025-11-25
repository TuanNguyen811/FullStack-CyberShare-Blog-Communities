package com.server.server.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateTagRequest {
    @Size(max = 50, message = "Name must not exceed 50 characters")
    private String name;

    @Size(max = 200, message = "Description must not exceed 200 characters")
    private String description;
}
