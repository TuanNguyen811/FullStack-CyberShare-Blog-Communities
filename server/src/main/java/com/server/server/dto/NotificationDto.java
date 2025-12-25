package com.server.server.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationDto {
    private Long id;
    private String type;
    private Long entityId;
    private String message;
    private boolean isRead;
    private LocalDateTime createdAt;
    private Long actorId;
    private String actorName;
    private String actorUsername;
    private String actorAvatarUrl;
}
