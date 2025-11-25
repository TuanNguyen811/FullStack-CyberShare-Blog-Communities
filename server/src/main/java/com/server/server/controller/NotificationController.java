package com.server.server.controller;

import com.server.server.dto.NotificationDto;
import com.server.server.security.UserPrincipal;
import com.server.server.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notification", description = "Notification management endpoints")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Get notifications", description = "Get paginated list of notifications for current user")
    public ResponseEntity<Page<NotificationDto>> getNotifications(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        if (userPrincipal == null) {
            return ResponseEntity.status(401).build();
        }

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(notificationService.getUserNotifications(userPrincipal.getId(), pageable));
    }

    @GetMapping("/unread-count")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Get unread count", description = "Get count of unread notifications")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        if (userPrincipal == null) {
            return ResponseEntity.status(401).build();
        }

        long count = notificationService.getUnreadCount(userPrincipal.getId());
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/read")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Mark as read", description = "Mark a notification as read")
    public ResponseEntity<Void> markAsRead(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {

        if (userPrincipal == null) {
            return ResponseEntity.status(401).build();
        }

        notificationService.markAsRead(id, userPrincipal.getId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/read-all")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Mark all as read", description = "Mark all notifications as read")
    public ResponseEntity<Void> markAllAsRead(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        if (userPrincipal == null) {
            return ResponseEntity.status(401).build();
        }

        notificationService.markAllAsRead(userPrincipal.getId());
        return ResponseEntity.ok().build();
    }
}
