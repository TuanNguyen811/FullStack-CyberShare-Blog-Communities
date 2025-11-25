package com.server.server.controller;

import com.server.server.dto.user.UserDto;
import com.server.server.security.UserPrincipal;
import com.server.server.service.FollowService;
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
@RequestMapping("/api")
@Tag(name = "Follow", description = "User follow management endpoints")
public class FollowController {

    private final FollowService followService;

    public FollowController(FollowService followService) {
        this.followService = followService;
    }

    @PostMapping("/follows/{username}")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Follow user", description = "Follow another user")
    public ResponseEntity<Void> followUser(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String username) {

        if (userPrincipal == null) {
            return ResponseEntity.status(401).build();
        }

        followService.followUser(userPrincipal.getId(), username);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/follows/{username}")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Unfollow user", description = "Unfollow another user")
    public ResponseEntity<Void> unfollowUser(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String username) {

        if (userPrincipal == null) {
            return ResponseEntity.status(401).build();
        }

        followService.unfollowUser(userPrincipal.getId(), username);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/users/{username}/followers")
    @Operation(summary = "Get followers", description = "Get list of followers for a user")
    public ResponseEntity<Page<UserDto>> getFollowers(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(followService.getFollowers(username, pageable));
    }

    @GetMapping("/users/{username}/following")
    @Operation(summary = "Get following", description = "Get list of users followed by a user")
    public ResponseEntity<Page<UserDto>> getFollowing(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(followService.getFollowing(username, pageable));
    }

    @GetMapping("/users/{username}/follow-stats")
    @Operation(summary = "Get follow stats", description = "Get follower and following counts")
    public ResponseEntity<Map<String, Long>> getFollowStats(@PathVariable String username) {
        Map<String, Long> stats = new HashMap<>();
        stats.put("followers", followService.getFollowersCount(username));
        stats.put("following", followService.getFollowingCount(username));
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/follows/{username}/check")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Check follow status", description = "Check if current user is following the specified user")
    public ResponseEntity<Map<String, Boolean>> checkFollowStatus(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String username) {

        if (userPrincipal == null) {
            return ResponseEntity.status(401).build();
        }

        boolean isFollowing = followService.isFollowing(userPrincipal.getId(), username);
        Map<String, Boolean> response = new HashMap<>();
        response.put("isFollowing", isFollowing);
        return ResponseEntity.ok(response);
    }
}
