package com.server.server.repository;

import com.server.server.domain.Post;
import com.server.server.domain.PostStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    
    Optional<Post> findBySlug(String slug);
    
    boolean existsBySlug(String slug);
    
    Page<Post> findByStatus(PostStatus status, Pageable pageable);
    
    Page<Post> findByAuthorIdAndStatus(Long authorId, PostStatus status, Pageable pageable);
    
    Page<Post> findByAuthorId(Long authorId, Pageable pageable);
    
    @Query("SELECT p FROM Post p WHERE p.author.id = :authorId AND " +
           "(:status IS NULL OR p.status = :status)")
    Page<Post> findByAuthorIdAndOptionalStatus(
        @Param("authorId") Long authorId,
        @Param("status") PostStatus status,
        Pageable pageable
    );
}
