package com.server.server.repository;

import com.server.server.domain.Bookmark;
import com.server.server.domain.BookmarkId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, BookmarkId> {
    
    @Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END FROM Bookmark b WHERE b.post.id = :postId AND b.user.id = :userId")
    boolean existsByPostIdAndUserId(@Param("postId") Long postId, @Param("userId") Long userId);
    
    @Query("SELECT b FROM Bookmark b WHERE b.post.id = :postId AND b.user.id = :userId")
    Optional<Bookmark> findByPostIdAndUserId(@Param("postId") Long postId, @Param("userId") Long userId);
    
    @Modifying
    @Query("DELETE FROM Bookmark b WHERE b.post.id = :postId AND b.user.id = :userId")
    void deleteByPostIdAndUserId(@Param("postId") Long postId, @Param("userId") Long userId);
    
    @Query("SELECT b FROM Bookmark b JOIN FETCH b.post p LEFT JOIN FETCH p.author LEFT JOIN FETCH p.category WHERE b.user.id = :userId")
    Page<Bookmark> findByUserIdWithPost(@Param("userId") Long userId, Pageable pageable);
    
    @Query("SELECT COUNT(b) FROM Bookmark b WHERE b.post.id = :postId")
    long countByPostId(@Param("postId") Long postId);
}
