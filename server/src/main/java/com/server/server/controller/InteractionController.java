package com.server.server.controller;

import com.server.server.domain.User;
import com.server.server.dto.InteractionStatusDto;
import com.server.server.dto.post.PostListDto;
import com.server.server.repository.UserRepository;
import com.server.server.security.UserPrincipal;
import com.server.server.service.InteractionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Interactions", description = "Like and bookmark endpoints")
public class InteractionController {
    
    private final InteractionService interactionService;
    private final UserRepository userRepository;
    
    @PostMapping("/posts/{id}/like")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Toggle like", description = "Like or unlike a post (idempotent)")
    public ResponseEntity<InteractionStatusDto> toggleLike(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return ResponseEntity.ok(interactionService.toggleLike(id, user));
    }
    
    @PostMapping("/posts/{id}/bookmark")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Toggle bookmark", description = "Bookmark or unbookmark a post (idempotent)")
    public ResponseEntity<InteractionStatusDto> toggleBookmark(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return ResponseEntity.ok(interactionService.toggleBookmark(id, user));
    }
    
    @GetMapping("/posts/{id}/status")
    @Operation(summary = "Get interaction status", description = "Get like/bookmark status and counts for a post")
    public ResponseEntity<InteractionStatusDto> getStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal != null ? principal.getId() : null;
        return ResponseEntity.ok(interactionService.getInteractionStatus(id, userId, null));
    }
    
    @GetMapping("/me/bookmarks")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Get my bookmarks", description = "Get paginated list of bookmarked posts")
    public ResponseEntity<Page<PostListDto>> getMyBookmarks(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        
        String[] sortParams = sort.split(",");
        Sort sortOrder = Sort.by(Sort.Direction.fromString(sortParams[1]), sortParams[0]);
        Pageable pageable = PageRequest.of(page, size, sortOrder);
        
        return ResponseEntity.ok(interactionService.getUserBookmarks(principal.getId(), pageable));
    }
}
