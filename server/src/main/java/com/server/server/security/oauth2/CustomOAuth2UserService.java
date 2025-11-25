package com.server.server.security.oauth2;

import com.server.server.domain.AuthProvider;
import com.server.server.domain.User;
import com.server.server.domain.UserRole;
import com.server.server.domain.UserStatus;
import com.server.server.exception.OAuth2AuthenticationProcessingException;
import com.server.server.repository.UserRepository;
import com.server.server.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest oAuth2UserRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(oAuth2UserRequest);

        try {
            return processOAuth2User(oAuth2UserRequest, oAuth2User);
        } catch (Exception ex) {
            throw new InternalAuthenticationServiceException(ex.getMessage(), ex.getCause());
        }
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest oAuth2UserRequest, OAuth2User oAuth2User) {
        String registrationId = oAuth2UserRequest.getClientRegistration().getRegistrationId();
        OAuth2UserInfo oAuth2UserInfo = OAuth2UserInfoFactory.getOAuth2UserInfo(registrationId, oAuth2User.getAttributes());
        
        if (!StringUtils.hasText(oAuth2UserInfo.getEmail())) {
            throw new OAuth2AuthenticationProcessingException("Email not found from OAuth2 provider");
        }

        Optional<User> userOptional = userRepository.findByEmail(oAuth2UserInfo.getEmail());
        User user;
        
        if (userOptional.isPresent()) {
            user = userOptional.get();
            if (!user.getAuthProvider().equals(AuthProvider.valueOf(registrationId))) {
                throw new OAuth2AuthenticationProcessingException(
                        "You're signed up with " + user.getAuthProvider() + " account. " +
                        "Please use your " + user.getAuthProvider() + " account to login.");
            }
            user = updateExistingUser(user, oAuth2UserInfo);
        } else {
            user = registerNewUser(oAuth2UserRequest, oAuth2UserInfo);
        }

        return UserPrincipal.create(user, oAuth2User.getAttributes());
    }

    private User registerNewUser(OAuth2UserRequest oAuth2UserRequest, OAuth2UserInfo oAuth2UserInfo) {
        String registrationId = oAuth2UserRequest.getClientRegistration().getRegistrationId();
        String email = oAuth2UserInfo.getEmail();
        String baseUsername = email.substring(0, email.indexOf('@'));
        String username = generateUniqueUsername(baseUsername);
        
        User user = User.builder()
                .username(username)
                .email(email)
                .displayName(oAuth2UserInfo.getName())
                .avatarUrl(oAuth2UserInfo.getImageUrl())
                .authProvider(AuthProvider.valueOf(registrationId))
                .providerId(oAuth2UserInfo.getId())
                .passwordHash("") // No password for OAuth2 users
                .role(UserRole.USER)
                .status(UserStatus.ACTIVE)
                .emailVerified(true) // Email is verified by OAuth provider
                .build();

        return userRepository.save(user);
    }

    private User updateExistingUser(User existingUser, OAuth2UserInfo oAuth2UserInfo) {
        // Update avatar and display name if they were changed in OAuth provider
        if (StringUtils.hasText(oAuth2UserInfo.getImageUrl()) && 
            (existingUser.getAvatarUrl() == null || existingUser.getAvatarUrl().startsWith("https://lh3.googleusercontent.com"))) {
            existingUser.setAvatarUrl(oAuth2UserInfo.getImageUrl());
        }
        if (existingUser.getDisplayName() == null && StringUtils.hasText(oAuth2UserInfo.getName())) {
            existingUser.setDisplayName(oAuth2UserInfo.getName());
        }
        existingUser.setEmailVerified(true);
        return userRepository.save(existingUser);
    }

    private String generateUniqueUsername(String baseUsername) {
        String username = baseUsername;
        int counter = 1;
        while (userRepository.existsByUsername(username)) {
            username = baseUsername + counter;
            counter++;
        }
        return username;
    }
}
