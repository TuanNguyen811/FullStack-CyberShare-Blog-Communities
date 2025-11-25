package com.server.server.service;

import com.server.server.domain.Category;
import com.server.server.domain.Post;
import com.server.server.domain.PostStatus;
import com.server.server.domain.PostView;
import com.server.server.domain.Tag;
import com.server.server.domain.User;
import com.server.server.dto.post.CreatePostRequest;
import com.server.server.dto.post.PostDto;
import com.server.server.dto.post.PostListDto;
import com.server.server.dto.post.UpdatePostRequest;
import com.server.server.repository.CategoryRepository;
import com.server.server.repository.PostRepository;
import com.server.server.repository.PostViewRepository;
import com.server.server.repository.TagRepository;
import com.server.server.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final PostViewRepository postViewRepository;

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    public PostService(PostRepository postRepository,
            UserRepository userRepository,
            CategoryRepository categoryRepository,
            TagRepository tagRepository,
            PostViewRepository postViewRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.tagRepository = tagRepository;
        this.postViewRepository = postViewRepository;
    }

    @Transactional
    public PostDto createPost(Long authorId, CreatePostRequest request) {
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Post post = new Post();
        post.setAuthor(author);
        post.setTitle(request.getTitle());
        post.setSummary(request.getSummary());
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
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
            post.setCategory(category);
        }

        // Set tags if provided
        if (request.getTags() != null && !request.getTags().isEmpty()) {
            Set<Tag> tags = new HashSet<>();
            for (String tagName : request.getTags()) {
                Tag tag = tagRepository.findByName(tagName)
                        .orElseGet(() -> {
                            Tag newTag = new Tag();
                            newTag.setName(tagName);
                            newTag.setSlug(ensureUniqueTagSlug(toSlug(tagName)));
                            return tagRepository.save(newTag);
                        });
                tags.add(tag);
            }
            post.setTags(tags);
        }

        // Set published_at if status is PUBLISHED
        if (post.getStatus() == PostStatus.PUBLISHED) {
            post.setPublishedAt(LocalDateTime.now());
        }

        post = postRepository.save(post);
        return mapToDto(post);
    }

    @Transactional
    public PostDto updatePost(Long postId, Long authorId, UpdatePostRequest request) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        // Check ownership
        if (!post.getAuthor().getId().equals(authorId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only edit your own posts");
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

        if (request.getSummary() != null) {
            post.setSummary(request.getSummary());
        }

        if (request.getCoverImageUrl() != null) {
            post.setCoverImageUrl(request.getCoverImageUrl());
        }

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
            post.setCategory(category);
        } else if (request.getCategoryId() == null) {
            // Allow clearing category if explicitly set to null (though logic might need
            // adjustment depending on requirements)
            // For now, assuming UpdatePostRequest categoryId null means "no change" unless
            // we want a way to clear it.
            // If we want to clear, we might need a specific flag or treat null as "no
            // change" and -1 as clear.
            // Let's assume null means no change for now, consistent with other fields.
            // To clear category, we'd need explicit instruction.
        }

        if (request.getTags() != null) {
            Set<Tag> tags = new HashSet<>();
            for (String tagName : request.getTags()) {
                Tag tag = tagRepository.findByName(tagName)
                        .orElseGet(() -> {
                            Tag newTag = new Tag();
                            newTag.setName(tagName);
                            newTag.setSlug(ensureUniqueTagSlug(toSlug(tagName)));
                            return tagRepository.save(newTag);
                        });
                tags.add(tag);
            }
            post.setTags(tags);
        }

        if (request.getStatus() != null) {
            PostStatus oldStatus = post.getStatus();
            post.setStatus(request.getStatus());

            // Set published_at when changing to PUBLISHED
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
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        if (!post.getAuthor().getId().equals(authorId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own posts");
        }

        postRepository.delete(post);
    }

    public PostDto getPostById(Long id) {
        Post post = postRepository.findByIdWithGraph(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        return mapToDto(post);
    }

    public PostDto getPostBySlug(String slug) {
        Post post = postRepository.findBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        return mapToDto(post);
    }

    public Page<PostListDto> getPublicPosts(Pageable pageable) {
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

    @Transactional
    public void incrementView(Long postId, Long userId, String ipAddress) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        boolean alreadyViewed = false;

        if (userId != null) {
            alreadyViewed = postViewRepository.existsByPostIdAndUserId(postId, userId);
        } else if (ipAddress != null) {
            alreadyViewed = postViewRepository.existsByPostIdAndIpAddress(postId, ipAddress);
        }

        if (!alreadyViewed) {
            PostView postView = new PostView();
            postView.setPost(post);
            postView.setIpAddress(ipAddress);

            if (userId != null) {
                User user = userRepository.findById(userId).orElse(null);
                postView.setUser(user);
            }

            postViewRepository.save(postView);

            // Increment view count in Post entity
            post.setViews(post.getViews() + 1);
            postRepository.save(post);
        }
    }

    public Page<PostListDto> getPostsByAuthorUsername(String username, PostStatus status, Pageable pageable) {
        if (status != null) {
            return postRepository.findByAuthorUsernameAndStatus(username, status, pageable)
                    .map(this::mapToListDto);
        } else {
            // If no status specified, default to PUBLISHED for public author pages
            return postRepository.findByAuthorUsernameAndStatus(username, PostStatus.PUBLISHED, pageable)
                    .map(this::mapToListDto);
        }
    }

    public Page<PostListDto> getPostsByCategory(Long categoryId, PostStatus status, Pageable pageable) {
        return postRepository.findByCategoryIdAndStatus(categoryId, status, pageable)
                .map(this::mapToListDto);
    }

    public Page<PostListDto> getPostsByTagId(Long tagId, PostStatus status, Pageable pageable) {
        return postRepository.findByTagIdAndStatus(tagId, status, pageable)
                .map(this::mapToListDto);
    }

    public Page<PostListDto> getPostsByTagSlug(String tagSlug, PostStatus status, Pageable pageable) {
        return postRepository.findByTagSlugAndStatus(tagSlug, status, pageable)
                .map(this::mapToListDto);
    }

    public Page<PostListDto> searchPosts(String query, Pageable pageable) {
        return postRepository.searchPosts(query, pageable)
                .map(this::mapToListDto);
    }

    public Page<PostListDto> getTrendingPosts(LocalDateTime since, Pageable pageable) {
        return postRepository.findTrendingPosts(since, pageable)
                .map(this::mapToListDto);
    }

    public Page<PostListDto> getFeedPosts(Long userId, Pageable pageable) {
        return postRepository.findFeedPosts(userId, pageable)
                .map(this::mapToListDto);
    }

    public Page<PostListDto> getSimilarPosts(Long postId, Pageable pageable) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        java.util.Set<Long> tagIds = post.getTags().stream()
                .map(com.server.server.domain.Tag::getId)
                .collect(java.util.stream.Collectors.toSet());

        if (tagIds.isEmpty()) {
            tagIds.add(-1L);
        }

        return postRepository.findSimilarPosts(
                postId,
                post.getCategory().getId(),
                tagIds,
                pageable)
                .map(this::mapToListDto);
    }

    // Admin methods
    public Page<PostListDto> getPostsByStatus(PostStatus status, Pageable pageable) {
        return postRepository.findByStatus(status, pageable)
                .map(this::mapToListDto);
    }

    @Transactional
    public void updatePostStatus(Long postId, PostStatus newStatus) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        
        PostStatus oldStatus = post.getStatus();
        post.setStatus(newStatus);
        
        // Set published_at when approving to PUBLISHED
        if (oldStatus != PostStatus.PUBLISHED && newStatus == PostStatus.PUBLISHED) {
            post.setPublishedAt(LocalDateTime.now());
        }
        
        postRepository.save(post);
    }

    @Transactional
    public void deletePost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        postRepository.delete(post);
    }

    private String generateSlug(String input) {
        String nowhitespace = WHITESPACE.matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH);
    }

    private String toSlug(String input) {
        return generateSlug(input);
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

    private String ensureUniqueTagSlug(String baseSlug) {
        String slug = baseSlug;
        int counter = 1;
        while (tagRepository.existsBySlug(slug)) {
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

        if (post.getTags() != null) {
            dto.setTags(post.getTags().stream()
                    .map(tag -> new com.server.server.dto.TagDto(
                        tag.getId(),
                        tag.getName(),
                        tag.getSlug(),
                        tag.getDescription(),
                        null
                    ))
                    .collect(Collectors.toSet()));
        }

        dto.setTitle(post.getTitle());
        dto.setSlug(post.getSlug());
        dto.setSummary(post.getSummary());
        dto.setContent(post.getContent());
        dto.setCoverImageUrl(post.getCoverImageUrl());
        dto.setStatus(post.getStatus());
        dto.setViews(post.getViews());
        dto.setLikesCount(post.getLikesCount());
        dto.setCommentsCount(post.getCommentsCount());
        dto.setBookmarksCount(post.getBookmarksCount());
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
        dto.setSummary(post.getSummary());
        dto.setCoverImageUrl(post.getCoverImageUrl());
        dto.setStatus(post.getStatus());
        dto.setViews(post.getViews());
        dto.setLikesCount(post.getLikesCount());
        dto.setCommentsCount(post.getCommentsCount());
        dto.setBookmarksCount(post.getBookmarksCount());
        
        if (post.getTags() != null) {
            dto.setTags(post.getTags().stream()
                    .map(tag -> new com.server.server.dto.TagDto(
                        tag.getId(),
                        tag.getName(),
                        tag.getSlug(),
                        tag.getDescription(),
                        null
                    ))
                    .collect(Collectors.toSet()));
        }
        
        dto.setPublishedAt(post.getPublishedAt());
        dto.setCreatedAt(post.getCreatedAt());
        return dto;
    }
}
