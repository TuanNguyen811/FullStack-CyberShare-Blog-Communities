package com.server.server.controller;

import com.server.server.dto.user.UpdateProfileRequest;
import com.server.server.dto.user.UserDto;
import com.server.server.security.UserPrincipal;
import com.server.server.service.UserService;
import com.server.server.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@Tag(name = "User", description = "User profile management endpoints")
@SecurityRequirement(name = "Bearer Authentication")
public class UserController {

    private final UserService userService;
    private final FileStorageService fileStorageService;

    public UserController(UserService userService, FileStorageService fileStorageService) {
        this.userService = userService;
        this.fileStorageService = fileStorageService;
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user profile", description = "Get authenticated user's profile information")
    public ResponseEntity<UserDto> getCurrentUser(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        UserDto userDto = userService.getUserById(userPrincipal.getId());
        return ResponseEntity.ok(userDto);
    }

    @GetMapping("/top-authors")
    @Operation(summary = "Get top authors", description = "Get top authors by followers count")
    public ResponseEntity<List<UserDto>> getTopAuthors(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(userService.getTopAuthors(limit));
    }

    @GetMapping("/search")
    @Operation(summary = "Search users", description = "Search users by username or display name")
    public ResponseEntity<Page<UserDto>> searchUsers(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(userService.searchUsers(q, PageRequest.of(page, size)));
    }

    @GetMapping("/{username}")
    @Operation(summary = "Get user by username", description = "Get user profile information by username")
    public ResponseEntity<UserDto> getUserByUsername(@PathVariable String username) {
        UserDto userDto = userService.getUserByUsername(username);
        return ResponseEntity.ok(userDto);
    }

    @PatchMapping("/me")
    @Operation(summary = "Update current user profile", description = "Update authenticated user's profile information")
    public ResponseEntity<UserDto> updateCurrentUser(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody UpdateProfileRequest request) {
        UserDto userDto = userService.updateUser(userPrincipal.getId(), request);
        return ResponseEntity.ok(userDto);
    }

    @PostMapping("/me/avatar")
    @Operation(summary = "Upload avatar", description = "Upload avatar image for current user")
    public ResponseEntity<Map<String, String>> uploadAvatar(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam("file") MultipartFile file) {
        
        // Ensure the request is authenticated
        if (userPrincipal == null) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Unauthorized: missing authentication");
            return ResponseEntity.status(401).body(error);
        }

        try {
            // Validate file
            if (file.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Please select a file to upload");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Only image files are allowed");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Store file
            String fileName = fileStorageService.storeFile(file);
            
            // Build avatar URL
            String avatarUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/uploads/avatars/")
                    .path(fileName)
                    .toUriString();
            
            // Update user avatar
            UpdateProfileRequest updateRequest = new UpdateProfileRequest();
            updateRequest.setAvatarUrl(avatarUrl);
            userService.updateUser(userPrincipal.getId(), updateRequest);
            
            Map<String, String> response = new HashMap<>();
            response.put("avatarUrl", avatarUrl);
            response.put("message", "Avatar uploaded successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Log the actual error
            System.err.println("Error uploading avatar: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to upload avatar: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
}
