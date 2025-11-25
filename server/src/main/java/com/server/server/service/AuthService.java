package com.server.server.service;

import com.server.server.domain.RefreshToken;
import com.server.server.domain.User;
import com.server.server.domain.UserRole;
import com.server.server.dto.auth.AuthResponse;
import com.server.server.dto.auth.LoginRequest;
import com.server.server.dto.auth.RegisterRequest;
import com.server.server.repository.UserRepository;
import com.server.server.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtTokenProvider jwtTokenProvider;
        private final RefreshTokenService refreshTokenService;
        private final AuthenticationManager authenticationManager;

        public AuthService(
                        UserRepository userRepository,
                        PasswordEncoder passwordEncoder,
                        JwtTokenProvider jwtTokenProvider,
                        RefreshTokenService refreshTokenService,
                        AuthenticationManager authenticationManager) {
                this.userRepository = userRepository;
                this.passwordEncoder = passwordEncoder;
                this.jwtTokenProvider = jwtTokenProvider;
                this.refreshTokenService = refreshTokenService;
                this.authenticationManager = authenticationManager;
        }

        @Transactional
        public AuthResponse register(RegisterRequest request) {
                // Generate username if not provided
                String username = request.getUsername();
                if (username == null || username.trim().isEmpty()) {
                        username = generateUniqueUsername(request.getEmail());
                }

                // Check if username exists (only if manually provided or after generation
                // collision check needed)
                if (userRepository.existsByUsername(username)) {
                        // If manual username is taken
                        if (request.getUsername() != null && !request.getUsername().trim().isEmpty()) {
                                throw new RuntimeException("Username is already taken");
                        }
                        // If generated username is taken (should be handled by generateUniqueUsername
                        // but double check)
                        username = generateUniqueUsername(request.getEmail());
                }

                // Check if email exists
                if (userRepository.existsByEmail(request.getEmail())) {
                        throw new RuntimeException("Email is already in use");
                }

                // Create new user
                User user = User.builder()
                                .username(username)
                                .email(request.getEmail())
                                .passwordHash(passwordEncoder.encode(request.getPassword()))
                                .displayName(request.getDisplayName() != null ? request.getDisplayName() : username)
                                .role(UserRole.USER)
                                .build();

                User savedUser = userRepository.save(user);

                // Generate tokens
                String accessToken = jwtTokenProvider.generateAccessToken(savedUser.getUsername());
                RefreshToken refreshToken = refreshTokenService.createRefreshToken(savedUser);

                return AuthResponse.builder()
                                .accessToken(accessToken)
                                .refreshToken(refreshToken.getToken())
                                .userId(savedUser.getId())
                                .username(savedUser.getUsername())
                                .email(savedUser.getEmail())
                                .displayName(savedUser.getDisplayName())
                                .role(savedUser.getRole().name())
                                .build();
        }

        public AuthResponse login(LoginRequest request) {
                // Authenticate using email
                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getEmail(),
                                                request.getPassword()));

                SecurityContextHolder.getContext().setAuthentication(authentication);

                // Find user by email
                User user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                String accessToken = jwtTokenProvider.generateAccessToken(authentication);
                RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

                return AuthResponse.builder()
                                .accessToken(accessToken)
                                .refreshToken(refreshToken.getToken())
                                .userId(user.getId())
                                .username(user.getUsername())
                                .email(user.getEmail())
                                .displayName(user.getDisplayName())
                                .role(user.getRole().name())
                                .build();
        }

        public AuthResponse refreshToken(String refreshTokenStr) {
                return refreshTokenService.findByToken(refreshTokenStr)
                                .map(refreshTokenService::verifyExpiration)
                                .map(RefreshToken::getUser)
                                .map(user -> {
                                        String accessToken = jwtTokenProvider.generateAccessToken(user.getUsername());
                                        return AuthResponse.builder()
                                                        .accessToken(accessToken)
                                                        .refreshToken(refreshTokenStr)
                                                        .userId(user.getId())
                                                        .username(user.getUsername())
                                                        .email(user.getEmail())
                                                        .displayName(user.getDisplayName())
                                                        .role(user.getRole().name())
                                                        .build();
                                })
                                .orElseThrow(() -> new RuntimeException("Refresh token is not in database"));
        }

        @Transactional
        public void logout(String username) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                refreshTokenService.deleteByUser(user);
        }

        private String generateUniqueUsername(String email) {
                String baseUsername = email.split("@")[0];
                // Remove non-alphanumeric characters to be safe
                baseUsername = baseUsername.replaceAll("[^a-zA-Z0-9]", "");

                if (baseUsername.length() < 3) {
                        baseUsername = "user" + baseUsername;
                }

                String username = baseUsername;
                int counter = 1;

                while (userRepository.existsByUsername(username)) {
                        // Append random 4 digit number or just increment
                        username = baseUsername + (int) (Math.random() * 10000);
                        counter++;
                        // Safety break
                        if (counter > 100) {
                                username = baseUsername + System.currentTimeMillis();
                                break;
                        }
                }
                return username;
        }
}
