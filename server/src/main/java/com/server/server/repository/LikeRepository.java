package com.server.server.repository;

import com.server.server.domain.Like;
import com.server.server.domain.LikeId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, LikeId> {
    
    @Query("SELECT CASE WHEN COUNT(l) > 0 THEN true ELSE false END FROM Like l WHERE l.post.id = :postId AND l.user.id = :userId")
    boolean existsByPostIdAndUserId(@Param("postId") Long postId, @Param("userId") Long userId);
    
    @Query("SELECT l FROM Like l WHERE l.post.id = :postId AND l.user.id = :userId")
    Optional<Like> findByPostIdAndUserId(@Param("postId") Long postId, @Param("userId") Long userId);
    
    @Modifying
    @Query("DELETE FROM Like l WHERE l.post.id = :postId AND l.user.id = :userId")
    void deleteByPostIdAndUserId(@Param("postId") Long postId, @Param("userId") Long userId);
    
    @Query("SELECT COUNT(l) FROM Like l WHERE l.post.id = :postId")
    long countByPostId(@Param("postId") Long postId);
}
