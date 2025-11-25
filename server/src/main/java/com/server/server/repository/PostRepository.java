package com.server.server.repository;

import com.server.server.domain.Post;
import com.server.server.domain.PostStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;

import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

        @EntityGraph(attributePaths = {"tags", "author", "category"})
        @Query("SELECT p FROM Post p WHERE p.id = :id")
        Optional<Post> findByIdWithGraph(@Param("id") Long id);

        @EntityGraph(attributePaths = {"tags", "author", "category"})
        Optional<Post> findBySlug(String slug);

        boolean existsBySlug(String slug);

        @EntityGraph(attributePaths = {"tags", "author", "category"})
        Page<Post> findByStatus(PostStatus status, Pageable pageable);

        @EntityGraph(attributePaths = {"tags", "author", "category"})
        Page<Post> findByAuthorIdAndStatus(Long authorId, PostStatus status, Pageable pageable);

        @EntityGraph(attributePaths = {"tags", "author", "category"})
        Page<Post> findByAuthorId(Long authorId, Pageable pageable);

        @EntityGraph(attributePaths = {"tags", "author", "category"})
        Page<Post> findByAuthorUsernameAndStatus(String username, PostStatus status, Pageable pageable);

        @EntityGraph(attributePaths = {"tags", "author", "category"})
        Page<Post> findByCategoryIdAndStatus(Long categoryId, PostStatus status, Pageable pageable);

        // Find posts by tag ID
        @EntityGraph(attributePaths = {"tags", "author", "category"})
        @Query("SELECT DISTINCT p FROM Post p JOIN p.tags t WHERE t.id = :tagId AND p.status = :status")
        Page<Post> findByTagIdAndStatus(
                        @Param("tagId") Long tagId,
                        @Param("status") PostStatus status,
                        Pageable pageable);

        // Find posts by tag slug
        @EntityGraph(attributePaths = {"tags", "author", "category"})
        @Query("SELECT DISTINCT p FROM Post p JOIN p.tags t WHERE t.slug = :tagSlug AND p.status = :status")
        Page<Post> findByTagSlugAndStatus(
                        @Param("tagSlug") String tagSlug,
                        @Param("status") PostStatus status,
                        Pageable pageable);

        @EntityGraph(attributePaths = {"tags", "author", "category"})
        @Query("SELECT p FROM Post p WHERE p.author.id = :authorId AND " +
                        "(:status IS NULL OR p.status = :status)")
        Page<Post> findByAuthorIdAndOptionalStatus(
                        @Param("authorId") Long authorId,
                        @Param("status") PostStatus status,
                        Pageable pageable);

        @Lock(LockModeType.PESSIMISTIC_WRITE)
        @Query("SELECT p FROM Post p WHERE p.id = :id")
        Optional<Post> findByIdWithLock(@Param("id") Long id);

        @Modifying(clearAutomatically = true, flushAutomatically = true)
        @Query("UPDATE Post p SET p.likesCount = p.likesCount + 1 WHERE p.id = :postId")
        void incrementLikesCount(@Param("postId") Long postId);

        @Modifying(clearAutomatically = true, flushAutomatically = true)
        @Query("UPDATE Post p SET p.likesCount = p.likesCount - 1 WHERE p.id = :postId AND p.likesCount > 0")
        void decrementLikesCount(@Param("postId") Long postId);

        @Modifying(clearAutomatically = true, flushAutomatically = true)
        @Query("UPDATE Post p SET p.commentsCount = p.commentsCount + 1 WHERE p.id = :postId")
        void incrementCommentsCount(@Param("postId") Long postId);

        @Modifying(clearAutomatically = true, flushAutomatically = true)
        @Query("UPDATE Post p SET p.commentsCount = p.commentsCount - :count WHERE p.id = :postId AND p.commentsCount >= :count")
        void decrementCommentsCount(@Param("postId") Long postId, @Param("count") int count);

        @Modifying(clearAutomatically = true, flushAutomatically = true)
        @Query("UPDATE Post p SET p.bookmarksCount = p.bookmarksCount + 1 WHERE p.id = :postId")
        void incrementBookmarksCount(@Param("postId") Long postId);

        @Modifying(clearAutomatically = true, flushAutomatically = true)
        @Query("UPDATE Post p SET p.bookmarksCount = p.bookmarksCount - 1 WHERE p.id = :postId AND p.bookmarksCount > 0")
        void decrementBookmarksCount(@Param("postId") Long postId);

        @Query(value = "SELECT * FROM posts p WHERE p.status = 'PUBLISHED' AND " +
                        "MATCH(p.title, p.content_md, p.content_html) AGAINST(:query IN BOOLEAN MODE)", countQuery = "SELECT count(*) FROM posts p WHERE p.status = 'PUBLISHED' AND "
                                        +
                                        "MATCH(p.title, p.content_md, p.content_html) AGAINST(:query IN BOOLEAN MODE)", nativeQuery = true)
        Page<Post> searchPosts(@Param("query") String query, Pageable pageable);

        @EntityGraph(attributePaths = {"tags", "author", "category"})
        @Query("SELECT p FROM Post p WHERE p.status = 'PUBLISHED' AND p.publishedAt >= :since " +
                        "ORDER BY (p.views + (p.likesCount * 3) + (p.commentsCount * 5)) DESC")
        Page<Post> findTrendingPosts(@Param("since") LocalDateTime since, Pageable pageable);

        @EntityGraph(attributePaths = {"tags", "author", "category"})
        @Query("SELECT DISTINCT p FROM Post p " +
                        "LEFT JOIN p.tags t " +
                        "WHERE p.status = 'PUBLISHED' " +
                        "AND p.id != :postId " +
                        "AND (p.category.id = :categoryId OR t.id IN :tagIds) " +
                        "ORDER BY p.publishedAt DESC")
        Page<Post> findSimilarPosts(
                        @Param("postId") Long postId,
                        @Param("categoryId") Long categoryId,
                        @Param("tagIds") java.util.Set<Long> tagIds,
                        Pageable pageable);

        // Feed posts from followed authors
        @EntityGraph(attributePaths = {"tags", "author", "category"})
        @Query("SELECT p FROM Post p WHERE p.status = 'PUBLISHED' AND p.author.id IN " +
                        "(SELECT f.following.id FROM Follow f WHERE f.follower.id = :userId) " +
                        "ORDER BY p.publishedAt DESC")
        Page<Post> findFeedPosts(@Param("userId") Long userId, Pageable pageable);

        // Admin statistics queries
        long countByStatus(PostStatus status);
        long countByCreatedAtAfter(LocalDateTime date);

        @Query("SELECT COALESCE(SUM(p.views), 0) FROM Post p")
        Long sumViews();

        @Query("SELECT COALESCE(SUM(p.likesCount), 0) FROM Post p")
        Long sumLikes();

        @Query("SELECT COALESCE(SUM(p.commentsCount), 0) FROM Post p")
        Long sumComments();
}
