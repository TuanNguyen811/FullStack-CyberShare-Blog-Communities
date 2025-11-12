package com.server.server.controller;

import com.server.server.domain.PostStatus;
import com.server.server.dto.post.CreatePostRequest;
import com.server.server.dto.post.PostDto;
import com.server.server.dto.post.PostListDto;
import com.server.server.dto.post.UpdatePostRequest;
import com.server.server.security.UserPrincipal;
import com.server.server.service.PostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
@Tag(name = "Post", description = "Post management endpoints")
public class PostController {
    
    private final PostService postService;
    
    public PostController(PostService postService) {
        this.postService = postService;
    }
    
    @PostMapping
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Create post", description = "Create a new post (authenticated users only)")
    public ResponseEntity<PostDto> createPost(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreatePostRequest request) {
        
        if (userPrincipal == null) {
            return ResponseEntity.status(401).build();
        }
        
        PostDto post = postService.createPost(userPrincipal.getId(), request);
        return ResponseEntity.ok(post);
    }
    
    @PatchMapping("/{id}")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Update post", description = "Update an existing post (author only)")
    public ResponseEntity<PostDto> updatePost(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody UpdatePostRequest request) {
        
        if (userPrincipal == null) {
            return ResponseEntity.status(401).build();
        }
        
        PostDto post = postService.updatePost(id, userPrincipal.getId(), request);
        return ResponseEntity.ok(post);
    }
    
    @DeleteMapping("/{id}")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Delete post", description = "Delete a post (author only)")
    public ResponseEntity<Void> deletePost(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        if (userPrincipal == null) {
            return ResponseEntity.status(401).build();
        }
        
        postService.deletePost(id, userPrincipal.getId());
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get post by ID", description = "Get post details by ID")
    public ResponseEntity<PostDto> getPostById(@PathVariable Long id) {
        return ResponseEntity.ok(postService.getPostById(id));
    }
    
    @GetMapping("/slug/{slug}")
    @Operation(summary = "Get post by slug", description = "Get post details by slug")
    public ResponseEntity<PostDto> getPostBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(postService.getPostBySlug(slug));
    }
    
    @GetMapping
    @Operation(summary = "Get published posts", description = "Get paginated list of published posts")
    public ResponseEntity<Page<PostListDto>> getPublishedPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "publishedAt,desc") String sort) {
        
        String[] sortParams = sort.split(",");
        Sort sortOrder = Sort.by(Sort.Direction.fromString(sortParams[1]), sortParams[0]);
        Pageable pageable = PageRequest.of(page, size, sortOrder);
        
        return ResponseEntity.ok(postService.getPublishedPosts(pageable));
    }
    
    @GetMapping("/my-posts")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Get my posts", description = "Get current user's posts with optional status filter")
    public ResponseEntity<Page<PostListDto>> getMyPosts(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) PostStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        
        if (userPrincipal == null) {
            return ResponseEntity.status(401).build();
        }
        
        String[] sortParams = sort.split(",");
        Sort sortOrder = Sort.by(Sort.Direction.fromString(sortParams[1]), sortParams[0]);
        Pageable pageable = PageRequest.of(page, size, sortOrder);
        
        return ResponseEntity.ok(postService.getMyPosts(userPrincipal.getId(), status, pageable));
    }
}
