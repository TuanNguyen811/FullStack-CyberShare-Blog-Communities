package com.server.server.service;

import com.server.server.domain.User;
import com.server.server.dto.user.UpdateProfileRequest;
import com.server.server.dto.user.UserDto;
import com.server.server.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return UserDto.fromEntity(user);
    }

    public UserDto getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
        return UserDto.fromEntity(user);
    }

    public List<UserDto> getTopAuthors(int limit) {
        return userRepository.findTopAuthors(PageRequest.of(0, limit))
                .stream()
                .map(UserDto::fromEntity)
                .collect(Collectors.toList());
    }

    public Page<UserDto> searchUsers(String query, Pageable pageable) {
        Page<User> users = userRepository.findByUsernameContainingIgnoreCaseOrDisplayNameContainingIgnoreCase(
                query, query, pageable);
        return users.map(UserDto::fromEntity);
    }

    @Transactional
    public UserDto updateUser(Long id, UpdateProfileRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update only non-null fields
        if (request.getDisplayName() != null) {
            user.setDisplayName(request.getDisplayName());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getAbout() != null) {
            user.setAbout(request.getAbout());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        User updatedUser = userRepository.save(user);
        return UserDto.fromEntity(updatedUser);
    }
}
