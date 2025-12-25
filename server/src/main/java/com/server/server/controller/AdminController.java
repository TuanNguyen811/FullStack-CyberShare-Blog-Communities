package com.server.server.controller;

import com.server.server.domain.PostStatus;
import com.server.server.domain.User;
import com.server.server.domain.UserRole;
import com.server.server.domain.UserStatus;
import com.server.server.dto.UserDTO;
import com.server.server.dto.TagDto;
import com.server.server.dto.CreateTagRequest;
import com.server.server.dto.UpdateTagRequest;
import com.server.server.dto.category.CategoryDto;
import com.server.server.dto.category.CreateCategoryRequest;
import com.server.server.dto.category.UpdateCategoryRequest;
import com.server.server.repository.PostRepository;
import com.server.server.repository.UserRepository;
import com.server.server.service.PostService;
import com.server.server.service.UserService;
import com.server.server.service.CategoryService;
import com.server.server.service.TagService;
import com.server.server.service.NotificationService;
import com.server.server.domain.NotificationType;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
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
    private final CategoryService categoryService;
    private final TagService tagService;
    private final NotificationService notificationService;

    // ==================== STATISTICS ====================
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        // User statistics
        stats.put("totalUsers", userRepository.count());
        stats.put("activeUsers", userRepository.countByStatus(UserStatus.ACTIVE));
        stats.put("bannedUsers", userRepository.countByStatus(UserStatus.BANNED));
        
        // Post statistics (exclude DRAFT - private to authors)
        long publishedPosts = postRepository.countByStatus(PostStatus.PUBLISHED);
        long pendingPosts = postRepository.countByStatus(PostStatus.PENDING_REVIEW);
        long hiddenPosts = postRepository.countByStatus(PostStatus.HIDDEN);
        stats.put("totalPosts", publishedPosts + pendingPosts + hiddenPosts);
        stats.put("publishedPosts", publishedPosts);
        stats.put("pendingPosts", pendingPosts);
        stats.put("hiddenPosts", hiddenPosts);
        
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
        
        UserRole oldRole = user.getRole();
        UserRole newRole = UserRole.valueOf(role);
        
        user.setRole(newRole);
        User savedUser = userRepository.save(user);
        
        // Send notification to user about role change
        if (oldRole != newRole) {
            String message = getRoleChangeMessage(oldRole, newRole);
            notificationService.createSystemNotification(userId, NotificationType.ROLE_CHANGE, message);
        }
        
        return ResponseEntity.ok(convertToDTO(savedUser));
    }
    
    private String getRoleChangeMessage(UserRole oldRole, UserRole newRole) {
        if (newRole == UserRole.AUTHOR) {
            return "🎉 Chúc mừng! Bạn đã được cấp quyền AUTHOR. Bây giờ bạn có thể đăng bài viết trên CyberShare.";
        } else if (newRole == UserRole.ADMIN) {
            return "🛡️ Bạn đã được cấp quyền ADMIN. Bạn có toàn quyền quản lý hệ thống CyberShare.";
        } else if (newRole == UserRole.USER) {
            return "ℹ️ Quyền của bạn đã được thay đổi thành USER.";
        }
        return "ℹ️ Quyền của bạn đã được cập nhật thành " + newRole.name() + ".";
    }

    // ==================== POST MODERATION ====================
    @GetMapping("/posts")
    public ResponseEntity<?> getAllPosts(
            @RequestParam(required = false) PostStatus status,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 15, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        if (status != null) {
            return ResponseEntity.ok(postService.getPostsByStatus(status, pageable));
        }
        return ResponseEntity.ok(postService.getAllPostsForAdmin(pageable));
    }

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

    // ==================== CATEGORY MANAGEMENT ====================
    @PostMapping("/categories")
    public ResponseEntity<CategoryDto> createCategory(@Valid @RequestBody CreateCategoryRequest request) {
        return ResponseEntity.ok(categoryService.createCategory(request));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<CategoryDto> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCategoryRequest request) {
        return ResponseEntity.ok(categoryService.updateCategory(id, request));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== TAG MANAGEMENT ====================
    @PostMapping("/tags")
    public ResponseEntity<TagDto> createTag(@Valid @RequestBody CreateTagRequest request) {
        return ResponseEntity.ok(tagService.createTag(request));
    }

    @PutMapping("/tags/{id}")
    public ResponseEntity<TagDto> updateTag(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTagRequest request) {
        return ResponseEntity.ok(tagService.updateTag(id, request));
    }

    @DeleteMapping("/tags/{id}")
    public ResponseEntity<Void> deleteTag(@PathVariable Long id) {
        tagService.deleteTag(id);
        return ResponseEntity.noContent().build();
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
