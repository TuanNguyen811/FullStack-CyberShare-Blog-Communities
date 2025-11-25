package com.server.server.controller;

import com.server.server.domain.User;
import com.server.server.dto.CommentDto;
import com.server.server.dto.CreateCommentRequest;
import com.server.server.dto.UpdateCommentRequest;
import com.server.server.repository.UserRepository;
import com.server.server.security.UserPrincipal;
import com.server.server.service.CommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Comments", description = "Comment management endpoints")
public class CommentController {
    
    private final CommentService commentService;
    private final UserRepository userRepository;
    
    @GetMapping("/posts/{slug}/comments")
    @Operation(summary = "Get post comments", description = "Get all comments for a post by slug, organized in a tree structure")
    public ResponseEntity<List<CommentDto>> getComments(@PathVariable String slug) {
        return ResponseEntity.ok(commentService.getCommentsByPostSlug(slug));
    }
    
    @PostMapping("/posts/{id}/comments")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Create comment", description = "Create a new comment or reply on a post")
    public ResponseEntity<CommentDto> createComment(
            @PathVariable Long id,
            @Valid @RequestBody CreateCommentRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return ResponseEntity.ok(commentService.createComment(id, request, user));
    }
    
    @PatchMapping("/comments/{id}")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Update comment", description = "Update your own comment")
    public ResponseEntity<CommentDto> updateComment(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCommentRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return ResponseEntity.ok(commentService.updateComment(id, request, user));
    }
    
    @DeleteMapping("/comments/{id}")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Delete comment", description = "Delete your own comment (cascades to all replies)")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        commentService.deleteComment(id, user);
        return ResponseEntity.noContent().build();
    }
}
