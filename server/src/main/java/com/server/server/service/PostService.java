package com.server.server.service;

import com.server.server.domain.Category;
import com.server.server.domain.Post;
import com.server.server.domain.PostStatus;
import com.server.server.domain.User;
import com.server.server.dto.post.CreatePostRequest;
import com.server.server.dto.post.PostDto;
import com.server.server.dto.post.PostListDto;
import com.server.server.dto.post.UpdatePostRequest;
import com.server.server.repository.CategoryRepository;
import com.server.server.repository.PostRepository;
import com.server.server.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
@Transactional(readOnly = true)
public class PostService {
    
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    
    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");
    
    public PostService(PostRepository postRepository, 
                      UserRepository userRepository,
                      CategoryRepository categoryRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
    }
    
    @Transactional
    public PostDto createPost(Long authorId, CreatePostRequest request) {
        User author = userRepository.findById(authorId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Post post = new Post();
        post.setAuthor(author);
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setCoverImageUrl(request.getCoverImageUrl());
        post.setStatus(request.getStatus() != null ? request.getStatus() : PostStatus.DRAFT);
        
        // Generate unique slug
        String baseSlug = generateSlug(request.getTitle());
        String uniqueSlug = ensureUniqueSlug(baseSlug);
        post.setSlug(uniqueSlug);
        
        // Set category if provided
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
            post.setCategory(category);
        }
        
        // Set published_at if publishing
        if (post.getStatus() == PostStatus.PUBLISHED) {
            post.setPublishedAt(LocalDateTime.now());
        }
        
        post = postRepository.save(post);
        return mapToDto(post);
    }
    
    @Transactional
    public PostDto updatePost(Long postId, Long authorId, UpdatePostRequest request) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        
        // Check ownership
        if (!post.getAuthor().getId().equals(authorId)) {
            throw new RuntimeException("Unauthorized: You can only edit your own posts");
        }
        
        if (request.getTitle() != null) {
            post.setTitle(request.getTitle());
            // Regenerate slug if title changed
            String baseSlug = generateSlug(request.getTitle());
            if (!post.getSlug().startsWith(baseSlug)) {
                String uniqueSlug = ensureUniqueSlug(baseSlug);
                post.setSlug(uniqueSlug);
            }
        }
        
        if (request.getContent() != null) {
            post.setContent(request.getContent());
        }
        
        if (request.getCoverImageUrl() != null) {
            post.setCoverImageUrl(request.getCoverImageUrl());
        }
        
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
            post.setCategory(category);
        }
        
        if (request.getStatus() != null) {
            PostStatus oldStatus = post.getStatus();
            post.setStatus(request.getStatus());
            
            // Set published_at when changing from non-published to published
            if (oldStatus != PostStatus.PUBLISHED && request.getStatus() == PostStatus.PUBLISHED) {
                post.setPublishedAt(LocalDateTime.now());
            }
        }
        
        post = postRepository.save(post);
        return mapToDto(post);
    }
    
    @Transactional
    public void deletePost(Long postId, Long authorId) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        
        if (!post.getAuthor().getId().equals(authorId)) {
            throw new RuntimeException("Unauthorized: You can only delete your own posts");
        }
        
        postRepository.delete(post);
    }
    
    public PostDto getPostById(Long id) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        return mapToDto(post);
    }
    
    public PostDto getPostBySlug(String slug) {
        Post post = postRepository.findBySlug(slug)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        return mapToDto(post);
    }
    
    public Page<PostListDto> getPublishedPosts(Pageable pageable) {
        return postRepository.findByStatus(PostStatus.PUBLISHED, pageable)
            .map(this::mapToListDto);
    }
    
    public Page<PostListDto> getMyPosts(Long authorId, PostStatus status, Pageable pageable) {
        if (status != null) {
            return postRepository.findByAuthorIdAndStatus(authorId, status, pageable)
                .map(this::mapToListDto);
        } else {
            return postRepository.findByAuthorId(authorId, pageable)
                .map(this::mapToListDto);
        }
    }
    
    private String generateSlug(String input) {
        String nowhitespace = WHITESPACE.matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH);
    }
    
    private String ensureUniqueSlug(String baseSlug) {
        String slug = baseSlug;
        int counter = 1;
        while (postRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter;
            counter++;
        }
        return slug;
    }
    
    private PostDto mapToDto(Post post) {
        PostDto dto = new PostDto();
        dto.setId(post.getId());
        dto.setAuthorId(post.getAuthor().getId());
        dto.setAuthorUsername(post.getAuthor().getUsername());
        dto.setAuthorDisplayName(post.getAuthor().getDisplayName());
        dto.setAuthorAvatarUrl(post.getAuthor().getAvatarUrl());
        
        if (post.getCategory() != null) {
            dto.setCategoryId(post.getCategory().getId());
            dto.setCategoryName(post.getCategory().getName());
            dto.setCategorySlug(post.getCategory().getSlug());
        }
        
        dto.setTitle(post.getTitle());
        dto.setSlug(post.getSlug());
        dto.setContent(post.getContent());
        dto.setCoverImageUrl(post.getCoverImageUrl());
        dto.setStatus(post.getStatus());
        dto.setViews(post.getViews());
        dto.setPublishedAt(post.getPublishedAt());
        dto.setCreatedAt(post.getCreatedAt());
        dto.setUpdatedAt(post.getUpdatedAt());
        return dto;
    }
    
    private PostListDto mapToListDto(Post post) {
        PostListDto dto = new PostListDto();
        dto.setId(post.getId());
        dto.setAuthorUsername(post.getAuthor().getUsername());
        dto.setAuthorDisplayName(post.getAuthor().getDisplayName());
        dto.setAuthorAvatarUrl(post.getAuthor().getAvatarUrl());
        
        if (post.getCategory() != null) {
            dto.setCategoryName(post.getCategory().getName());
        }
        
        dto.setTitle(post.getTitle());
        dto.setSlug(post.getSlug());
        dto.setCoverImageUrl(post.getCoverImageUrl());
        dto.setStatus(post.getStatus());
        dto.setViews(post.getViews());
        dto.setPublishedAt(post.getPublishedAt());
        dto.setCreatedAt(post.getCreatedAt());
        return dto;
    }
}
