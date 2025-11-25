package com.server.server.service;

import com.server.server.domain.Notification;
import com.server.server.domain.NotificationType;
import com.server.server.domain.User;
import com.server.server.dto.NotificationDto;
import com.server.server.repository.NotificationRepository;
import com.server.server.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository,
            org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public void createNotification(Long recipientId, Long actorId, NotificationType type, Long entityId) {
        if (recipientId.equals(actorId)) {
            return; // Don't notify self
        }

        User recipient = userRepository.findById(recipientId).orElseThrow();
        User actor = userRepository.findById(actorId).orElseThrow();

        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setActor(actor);
        notification.setType(type);
        notification.setEntityId(entityId);

        Notification savedNotification = notificationRepository.save(notification);

        // Send realtime notification
        NotificationDto dto = mapToDto(savedNotification);
        messagingTemplate.convertAndSendToUser(
                recipient.getUsername(),
                "/queue/notifications",
                dto);
    }

    public Page<NotificationDto> getUserNotifications(Long userId, Pageable pageable) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::mapToDto);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByRecipientIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getRecipient().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsRead(userId);
    }

    private NotificationDto mapToDto(Notification notification) {
        NotificationDto dto = new NotificationDto();
        dto.setId(notification.getId());
        dto.setType(notification.getType().name());
        dto.setEntityId(notification.getEntityId());
        dto.setRead(notification.isRead());
        dto.setCreatedAt(notification.getCreatedAt());

        if (notification.getActor() != null) {
            dto.setActorId(notification.getActor().getId());
            dto.setActorName(notification.getActor().getDisplayName());
            dto.setActorUsername(notification.getActor().getUsername());
            dto.setActorAvatarUrl(notification.getActor().getAvatarUrl());
        }

        return dto;
    }
}
