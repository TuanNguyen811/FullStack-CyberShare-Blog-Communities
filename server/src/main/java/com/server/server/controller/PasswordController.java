package com.server.server.controller;

import com.server.server.dto.auth.ChangePasswordRequest;
import com.server.server.dto.auth.ForgotPasswordRequest;
import com.server.server.dto.auth.ResetPasswordRequest;
import com.server.server.security.UserPrincipal;
import com.server.server.service.PasswordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/password")
@Tag(name = "Password", description = "Password management endpoints")
public class PasswordController {

    private final PasswordService passwordService;

    public PasswordController(PasswordService passwordService) {
        this.passwordService = passwordService;
    }

    @PostMapping("/change")
    @Operation(summary = "Change password", description = "Change password for authenticated user")
    public ResponseEntity<Map<String, String>> changePassword(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody ChangePasswordRequest request) {
        
        passwordService.changePassword(userPrincipal.getId(), request);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password changed successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot")
    @Operation(summary = "Forgot password", description = "Request password reset email")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        
        passwordService.forgotPassword(request.getEmail());
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "If an account exists with this email, you will receive a password reset link");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset")
    @Operation(summary = "Reset password", description = "Reset password using token from email")
    public ResponseEntity<Map<String, String>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        
        passwordService.resetPassword(request.getToken(), request.getNewPassword());
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password has been reset successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/reset/validate")
    @Operation(summary = "Validate reset token", description = "Check if password reset token is valid")
    public ResponseEntity<Map<String, Object>> validateResetToken(@RequestParam String token) {
        boolean isValid = passwordService.validateResetToken(token);
        
        Map<String, Object> response = new HashMap<>();
        response.put("valid", isValid);
        return ResponseEntity.ok(response);
    }
}
