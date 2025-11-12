package com.server.server.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "posts", indexes = {
    @Index(name = "idx_author_id", columnList = "author_id"),
    @Index(name = "idx_category_id", columnList = "category_id"),
    @Index(name = "idx_slug", columnList = "slug"),
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_published_at", columnList = "published_at"),
    @Index(name = "idx_author_status", columnList = "author_id, status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Post {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;
    
    @Column(nullable = false)
    private String title;
    
    @Column(nullable = false, unique = true)
    private String slug;
    
    @Column(name = "content_md", columnDefinition = "TEXT")
    private String content;
    
    @Column(name = "content_html", columnDefinition = "TEXT")
    private String contentHtml;
    
    @Column(name = "cover_image_url", length = 500)
    private String coverImageUrl;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PostStatus status = PostStatus.DRAFT;
    
    @Column(nullable = false)
    private Long views = 0L;
    
    @Column(name = "published_at")
    private LocalDateTime publishedAt;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
