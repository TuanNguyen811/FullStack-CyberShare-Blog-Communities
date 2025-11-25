package com.server.server.service;

import com.server.server.domain.Follow;
import com.server.server.domain.NotificationType;
import com.server.server.domain.User;
import com.server.server.dto.user.UserDto;
import com.server.server.repository.FollowRepository;
import com.server.server.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public FollowService(FollowRepository followRepository, UserRepository userRepository,
            NotificationService notificationService) {
        this.followRepository = followRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public void followUser(Long followerId, String followingUsername) {
        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        User following = userRepository.findByUsername(followingUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User to follow not found"));

        if (follower.getId().equals(following.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot follow yourself");
        }

        if (followRepository.existsByFollowerIdAndFollowingId(follower.getId(), following.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Already following");
        }

        Follow follow = new Follow();
        follow.setFollower(follower);
        follow.setFollowing(following);
        followRepository.save(follow);

        // Send notification
        notificationService.createNotification(following.getId(), follower.getId(), NotificationType.FOLLOW, null);
    }

    @Transactional
    public void unfollowUser(Long followerId, String followingUsername) {
        User following = userRepository.findByUsername(followingUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User to unfollow not found"));

        Follow follow = followRepository.findByFollowerIdAndFollowingId(followerId, following.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Not following"));

        followRepository.delete(follow);
    }

    public boolean isFollowing(Long followerId, String followingUsername) {
        User following = userRepository.findByUsername(followingUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        return followRepository.existsByFollowerIdAndFollowingId(followerId, following.getId());
    }

    public Page<UserDto> getFollowers(String username, Pageable pageable) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        return followRepository.findByFollowingId(user.getId(), pageable)
                .map(follow -> mapToUserDto(follow.getFollower()));
    }

    public Page<UserDto> getFollowing(String username, Pageable pageable) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        return followRepository.findByFollowerId(user.getId(), pageable)
                .map(follow -> mapToUserDto(follow.getFollowing()));
    }

    public long getFollowersCount(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return followRepository.countByFollowingId(user.getId());
    }

    public long getFollowingCount(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return followRepository.countByFollowerId(user.getId());
    }

    private UserDto mapToUserDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setDisplayName(user.getDisplayName());
        dto.setAvatarUrl(user.getAvatarUrl());
        dto.setBio(user.getBio());
        return dto;
    }
}
