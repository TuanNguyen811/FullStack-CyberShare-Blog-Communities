package com.server.server.repository;

import com.server.server.domain.User;
import com.server.server.domain.UserRole;
import com.server.server.domain.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByUsernameOrEmail(String username, String email);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
    
    // Top authors by followers count
    @Query("SELECT u FROM User u WHERE u.status = 'ACTIVE' " +
           "ORDER BY (SELECT COUNT(f) FROM Follow f WHERE f.following.id = u.id) DESC")
    List<User> findTopAuthors(Pageable pageable);
    
    // Admin queries
    long countByStatus(UserStatus status);
    long countByCreatedAtAfter(LocalDateTime date);
    
    Page<User> findByStatus(UserStatus status, Pageable pageable);
    Page<User> findByRole(UserRole role, Pageable pageable);
    Page<User> findByStatusAndRole(UserStatus status, UserRole role, Pageable pageable);
    Page<User> findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String username, String email, Pageable pageable);
    
    // Search users by username or display name
    Page<User> findByUsernameContainingIgnoreCaseOrDisplayNameContainingIgnoreCase(
            String username, String displayName, Pageable pageable);
}
