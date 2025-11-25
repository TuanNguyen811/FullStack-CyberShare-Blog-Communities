package com.server.server.repository;

import com.server.server.domain.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    
    @Query("SELECT c FROM Comment c LEFT JOIN FETCH c.author WHERE c.post.id = :postId ORDER BY c.createdAt ASC")
    List<Comment> findByPostIdWithAuthor(@Param("postId") Long postId);
    
    @Query("SELECT c FROM Comment c LEFT JOIN FETCH c.author WHERE c.post.slug = :slug ORDER BY c.createdAt ASC")
    List<Comment> findByPostSlugWithAuthor(@Param("slug") String slug);
    
    long countByPostId(Long postId);
    
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.parent.id = :parentId")
    long countReplies(@Param("parentId") Long parentId);
}
