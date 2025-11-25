package com.server.server.controller;

import com.server.server.domain.PostStatus;
import com.server.server.domain.User;
import com.server.server.domain.UserRole;
import com.server.server.domain.UserStatus;
import com.server.server.dto.UserDTO;
import com.server.server.repository.PostRepository;
import com.server.server.repository.UserRepository;
import com.server.server.service.PostService;
import com.server.server.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final UserService userService;
    private final PostService postService;

    // ==================== STATISTICS ====================
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        // User statistics
        stats.put("totalUsers", userRepository.count());
        stats.put("activeUsers", userRepository.countByStatus(UserStatus.ACTIVE));
        stats.put("bannedUsers", userRepository.countByStatus(UserStatus.BANNED));
        
        // Post statistics
        stats.put("totalPosts", postRepository.count());
        stats.put("publishedPosts", postRepository.countByStatus(PostStatus.PUBLISHED));
        stats.put("pendingPosts", postRepository.countByStatus(PostStatus.PENDING_REVIEW));
        stats.put("draftPosts", postRepository.countByStatus(PostStatus.DRAFT));
        
        // Time-based statistics (last 7 days)
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        stats.put("newUsersThisWeek", userRepository.countByCreatedAtAfter(weekAgo));
        stats.put("newPostsThisWeek", postRepository.countByCreatedAtAfter(weekAgo));
        
        // Total interactions
        stats.put("totalViews", postRepository.sumViews());
        stats.put("totalLikes", postRepository.sumLikes());
        stats.put("totalComments", postRepository.sumComments());
        
        return ResponseEntity.ok(stats);
    }

    // ==================== USER MANAGEMENT ====================
    @GetMapping("/users")
    public ResponseEntity<Page<UserDTO>> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UserStatus status,
            @RequestParam(required = false) UserRole role,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        
        Page<User> users;
        
        if (search != null && !search.isEmpty()) {
            users = userRepository.findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                    search, search, pageable);
        } else if (status != null && role != null) {
            users = userRepository.findByStatusAndRole(status, role, pageable);
        } else if (status != null) {
            users = userRepository.findByStatus(status, pageable);
        } else if (role != null) {
            users = userRepository.findByRole(role, pageable);
        } else {
            users = userRepository.findAll(pageable);
        }
        
        Page<UserDTO> userDTOs = users.map(this::convertToDTO);
        return ResponseEntity.ok(userDTOs);
    }

    @PutMapping("/users/{userId}/status")
    public ResponseEntity<UserDTO> updateUserStatus(
            @PathVariable Long userId,
            @RequestBody Map<String, String> request) {
        
        String status = request.get("status");
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setStatus(UserStatus.valueOf(status));
        User savedUser = userRepository.save(user);
        
        return ResponseEntity.ok(convertToDTO(savedUser));
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<UserDTO> updateUserRole(
            @PathVariable Long userId,
            @RequestBody Map<String, String> request) {
        
        String role = request.get("role");
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setRole(UserRole.valueOf(role));
        User savedUser = userRepository.save(user);
        
        return ResponseEntity.ok(convertToDTO(savedUser));
    }

    // ==================== POST MODERATION ====================
    @GetMapping("/posts/pending")
    public ResponseEntity<?> getPendingPosts(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(postService.getPostsByStatus(PostStatus.PENDING_REVIEW, pageable));
    }

    @PutMapping("/posts/{postId}/approve")
    public ResponseEntity<?> approvePost(@PathVariable Long postId) {
        postService.updatePostStatus(postId, PostStatus.PUBLISHED);
        // TODO: Create notification for author
        return ResponseEntity.ok(Map.of("message", "Post approved successfully"));
    }

    @PutMapping("/posts/{postId}/reject")
    public ResponseEntity<?> rejectPost(
            @PathVariable Long postId,
            @RequestBody(required = false) Map<String, String> request) {
        String reason = request != null ? request.get("reason") : null;
        postService.updatePostStatus(postId, PostStatus.DRAFT);
        // TODO: Create notification for author with rejection reason
        return ResponseEntity.ok(Map.of("message", "Post rejected"));
    }

    @PutMapping("/posts/{postId}/hide")
    public ResponseEntity<?> hidePost(@PathVariable Long postId) {
        postService.updatePostStatus(postId, PostStatus.HIDDEN);
        return ResponseEntity.ok(Map.of("message", "Post hidden successfully"));
    }

    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<?> deletePost(@PathVariable Long postId) {
        postService.deletePost(postId);
        return ResponseEntity.ok(Map.of("message", "Post deleted successfully"));
    }

    private UserDTO convertToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .bio(user.getBio())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole().name())
                .status(user.getStatus().name())
                .authProvider(user.getAuthProvider() != null ? user.getAuthProvider().name() : "local")
                .emailVerified(user.getEmailVerified())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
