package com.server.server.repository;

import com.server.server.domain.PasswordReset;
import com.server.server.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetRepository extends JpaRepository<PasswordReset, Long> {
    
    Optional<PasswordReset> findByToken(String token);
    
    Optional<PasswordReset> findByUser(User user);
    
    void deleteByUser(User user);
    
    @Modifying
    void deleteByExpiryDateBefore(LocalDateTime dateTime);
}
