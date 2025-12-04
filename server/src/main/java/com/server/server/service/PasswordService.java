package com.server.server.service;

import com.server.server.domain.PasswordReset;
import com.server.server.domain.User;
import com.server.server.dto.auth.ChangePasswordRequest;
import com.server.server.repository.PasswordResetRepository;
import com.server.server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordService {

    private final UserRepository userRepository;
    private final PasswordResetRepository passwordResetRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${app.password-reset.expiry-hours:24}")
    private int resetTokenExpiryHours;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    public PasswordService(
            UserRepository userRepository,
            PasswordResetRepository passwordResetRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordResetRepository = passwordResetRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Check if new password is different from current
        if (passwordEncoder.matches(request.getNewPassword(), user.getPasswordHash())) {
            throw new RuntimeException("New password must be different from current password");
        }

        // Update password
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public void forgotPassword(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        
        // Always return success to prevent email enumeration
        if (userOptional.isEmpty()) {
            return;
        }

        User user = userOptional.get();

        // Delete any existing reset tokens for this user
        passwordResetRepository.deleteByUser(user);

        // Generate new reset token
        String token = UUID.randomUUID().toString();
        
        PasswordReset passwordReset = PasswordReset.builder()
                .user(user)
                .token(token)
                .expiryDate(LocalDateTime.now().plusHours(resetTokenExpiryHours))
                .build();

        passwordResetRepository.save(passwordReset);

        // Send reset email
        String resetLink = frontendUrl + "/reset-password?token=" + token;
        emailService.sendPasswordResetEmail(user.getEmail(), user.getDisplayName(), resetLink);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordReset passwordReset = passwordResetRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));

        if (passwordReset.isExpired()) {
            passwordResetRepository.delete(passwordReset);
            throw new RuntimeException("Reset token has expired");
        }

        User user = passwordReset.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Delete the used reset token
        passwordResetRepository.delete(passwordReset);
    }

    public boolean validateResetToken(String token) {
        Optional<PasswordReset> resetOptional = passwordResetRepository.findByToken(token);
        
        if (resetOptional.isEmpty()) {
            return false;
        }

        PasswordReset reset = resetOptional.get();
        return !reset.isExpired();
    }

    @Transactional
    public void cleanupExpiredTokens() {
        passwordResetRepository.deleteByExpiryDateBefore(LocalDateTime.now());
    }
}
