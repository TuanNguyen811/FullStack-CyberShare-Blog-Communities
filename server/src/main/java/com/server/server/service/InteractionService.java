package com.server.server.service;

import com.server.server.domain.Bookmark;
import com.server.server.domain.Like;
import com.server.server.domain.NotificationType;
import com.server.server.domain.Post;
import com.server.server.domain.User;
import com.server.server.dto.InteractionStatusDto;
import com.server.server.dto.post.PostListDto;
import com.server.server.repository.BookmarkRepository;
import com.server.server.repository.LikeRepository;
import com.server.server.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class InteractionService {

    private final LikeRepository likeRepository;
    private final BookmarkRepository bookmarkRepository;
    private final PostRepository postRepository;
    private final NotificationService notificationService;

    @Transactional
    public InteractionStatusDto toggleLike(Long postId, User user) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        Post post = postRepository.findByIdWithLock(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        log.debug("[LIKE] User={} Post={} currentLikes={}", user.getId(), postId, post.getLikesCount());

        boolean exists = likeRepository.existsByPostIdAndUserId(postId, user.getId());

        if (exists) {
            log.debug("[LIKE] Already liked -> will unlike");
            // Unlike
            likeRepository.deleteByPostIdAndUserId(postId, user.getId());
            postRepository.decrementLikesCount(postId);
            log.debug("[LIKE] After unlike likesCount={}",
                    postRepository.findById(postId).map(Post::getLikesCount).orElse(-1));
            return getInteractionStatus(postId, user.getId(), false);
        } else {
            log.debug("[LIKE] Not liked yet -> will like");
            // Like
            Like like = new Like();
            like.setPost(post);
            like.setUser(user);
            likeRepository.save(like);
            postRepository.incrementLikesCount(postId);

            // Send notification
            if (!post.getAuthor().getId().equals(user.getId())) {
                notificationService.createNotification(
                        post.getAuthor().getId(),
                        user.getId(),
                        NotificationType.LIKE,
                        postId);
            }

            log.debug("[LIKE] After like likesCount={}",
                    postRepository.findById(postId).map(Post::getLikesCount).orElse(-1));
            return getInteractionStatus(postId, user.getId(), true);
        }
    }

    @Transactional
    public InteractionStatusDto toggleBookmark(Long postId, User user) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        Post post = postRepository.findByIdWithLock(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        log.debug("[BOOKMARK] User={} Post={} currentBookmarks={}", user.getId(), postId, post.getBookmarksCount());

        boolean exists = bookmarkRepository.existsByPostIdAndUserId(postId, user.getId());

        if (exists) {
            log.debug("[BOOKMARK] Already bookmarked -> will remove");
            // Remove bookmark
            bookmarkRepository.deleteByPostIdAndUserId(postId, user.getId());
            postRepository.decrementBookmarksCount(postId);
            log.debug("[BOOKMARK] After remove bookmarksCount={}",
                    postRepository.findById(postId).map(Post::getBookmarksCount).orElse(-1));
            return getInteractionStatus(postId, user.getId(), null);
        } else {
            log.debug("[BOOKMARK] Not bookmarked yet -> will add");
            // Add bookmark
            Bookmark bookmark = new Bookmark();
            bookmark.setPost(post);
            bookmark.setUser(user);
            bookmarkRepository.save(bookmark);
            postRepository.incrementBookmarksCount(postId);
            log.debug("[BOOKMARK] After add bookmarksCount={}",
                    postRepository.findById(postId).map(Post::getBookmarksCount).orElse(-1));
            return getInteractionStatus(postId, user.getId(), null);
        }
    }

    public InteractionStatusDto getInteractionStatus(Long postId, Long userId, Boolean justLiked) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        log.debug("[STATUS] postId={} userId={} likes={} comments={} bookmarks={}", postId, userId,
                post.getLikesCount(), post.getCommentsCount(), post.getBookmarksCount());

        boolean liked = false;
        boolean bookmarked = false;

        if (userId != null) {
            liked = justLiked != null ? justLiked : likeRepository.existsByPostIdAndUserId(postId, userId);
            bookmarked = bookmarkRepository.existsByPostIdAndUserId(postId, userId);
        }

        InteractionStatusDto status = new InteractionStatusDto();
        status.setLiked(liked);
        status.setBookmarked(bookmarked);
        status.setLikesCount(post.getLikesCount());
        status.setBookmarksCount(post.getBookmarksCount());
        status.setCommentsCount(post.getCommentsCount());

        return status;
    }

    public Page<PostListDto> getUserBookmarks(Long userId, Pageable pageable) {
        Page<Bookmark> bookmarks = bookmarkRepository.findByUserIdWithPost(userId, pageable);

        return bookmarks.map(bookmark -> {
            Post post = bookmark.getPost();
            PostListDto dto = new PostListDto();
            dto.setId(post.getId());
            dto.setTitle(post.getTitle());
            dto.setSlug(post.getSlug());
            dto.setCoverImageUrl(post.getCoverImageUrl());
            dto.setStatus(post.getStatus());
            dto.setViews(post.getViews());
            dto.setLikesCount(post.getLikesCount());
            dto.setCommentsCount(post.getCommentsCount());
            dto.setBookmarksCount(post.getBookmarksCount());
            dto.setPublishedAt(post.getPublishedAt());
            dto.setCreatedAt(post.getCreatedAt());

            if (post.getAuthor() != null) {
                dto.setAuthorUsername(post.getAuthor().getUsername());
                dto.setAuthorDisplayName(post.getAuthor().getDisplayName());
                dto.setAuthorAvatarUrl(post.getAuthor().getAvatarUrl());
            }

            if (post.getCategory() != null) {
                dto.setCategoryName(post.getCategory().getName());
            }

            return dto;
        });
    }
}
