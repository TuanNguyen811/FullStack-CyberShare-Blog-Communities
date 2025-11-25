package com.server.server.service;

import com.server.server.domain.Comment;
import com.server.server.domain.NotificationType;
import com.server.server.domain.Post;
import com.server.server.domain.User;
import com.server.server.dto.AuthorDto;
import com.server.server.dto.CommentDto;
import com.server.server.dto.CreateCommentRequest;
import com.server.server.dto.UpdateCommentRequest;
import com.server.server.repository.CommentRepository;
import com.server.server.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final NotificationService notificationService;

    public List<CommentDto> getCommentsByPostSlug(String slug) {
        List<Comment> allComments = commentRepository.findByPostSlugWithAuthor(slug);
        return buildCommentTree(allComments);
    }

    public List<CommentDto> getCommentsByPostId(Long postId) {
        List<Comment> allComments = commentRepository.findByPostIdWithAuthor(postId);
        return buildCommentTree(allComments);
    }

    @Transactional
    public CommentDto createComment(Long postId, CreateCommentRequest request, User author) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));

        Comment comment = new Comment();
        comment.setPost(post);
        comment.setAuthor(author);
        comment.setContent(request.getContent());

        if (request.getParentId() != null) {
            Comment parent = commentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new IllegalArgumentException("Parent comment not found"));

            if (!parent.getPost().getId().equals(postId)) {
                throw new IllegalArgumentException("Parent comment does not belong to this post");
            }

            comment.setParent(parent);
        }

        Comment saved = commentRepository.save(comment);

        // Increment post comments count
        postRepository.incrementCommentsCount(postId);

        // Send notification
        if (request.getParentId() == null) {
            // Comment on post -> notify post author
            if (!post.getAuthor().getId().equals(author.getId())) {
                notificationService.createNotification(
                        post.getAuthor().getId(),
                        author.getId(),
                        NotificationType.COMMENT,
                        postId);
            }
        } else {
            // Reply to comment -> notify parent comment author
            Comment parent = commentRepository.findById(request.getParentId()).orElseThrow();
            if (!parent.getAuthor().getId().equals(author.getId())) {
                notificationService.createNotification(
                        parent.getAuthor().getId(),
                        author.getId(),
                        NotificationType.COMMENT,
                        postId);
            }
        }

        return mapToDto(saved);
    }

    @Transactional
    public CommentDto updateComment(Long commentId, UpdateCommentRequest request, User currentUser) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found"));

        if (!comment.getAuthor().getId().equals(currentUser.getId())) {
            throw new SecurityException("You can only update your own comments");
        }

        comment.setContent(request.getContent());
        Comment updated = commentRepository.save(comment);

        return mapToDto(updated);
    }

    @Transactional
    public void deleteComment(Long commentId, User currentUser) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found"));

        if (!comment.getAuthor().getId().equals(currentUser.getId())
                && !currentUser.getRole().name().equals("ADMIN")) {
            throw new SecurityException("You can only delete your own comments");
        }

        Long postId = comment.getPost().getId();
        long repliesToDelete = countAllReplies(comment);

        commentRepository.delete(comment);

        // Decrement post comments count (including all nested replies)
        postRepository.decrementCommentsCount(postId, (int) (repliesToDelete + 1));
    }

    private long countAllReplies(Comment comment) {
        long count = comment.getChildren().size();
        for (Comment child : comment.getChildren()) {
            count += countAllReplies(child);
        }
        return count;
    }

    private List<CommentDto> buildCommentTree(List<Comment> allComments) {
        Map<Long, CommentDto> commentMap = new HashMap<>();
        List<CommentDto> rootComments = new ArrayList<>();

        // First pass: create DTOs
        for (Comment comment : allComments) {
            CommentDto dto = mapToDto(comment);
            commentMap.put(comment.getId(), dto);
        }

        // Second pass: build tree structure
        for (Comment comment : allComments) {
            CommentDto dto = commentMap.get(comment.getId());

            if (comment.getParent() == null) {
                rootComments.add(dto);
            } else {
                CommentDto parentDto = commentMap.get(comment.getParent().getId());
                if (parentDto != null) {
                    parentDto.getChildren().add(dto);
                }
            }
        }

        return rootComments;
    }

    private CommentDto mapToDto(Comment comment) {
        CommentDto dto = new CommentDto();
        dto.setId(comment.getId());
        dto.setPostId(comment.getPost().getId());
        dto.setParentId(comment.getParent() != null ? comment.getParent().getId() : null);
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());

        // Map author
        User author = comment.getAuthor();
        AuthorDto authorDto = new AuthorDto();
        authorDto.setId(author.getId());
        authorDto.setUsername(author.getUsername());
        authorDto.setDisplayName(author.getDisplayName());
        authorDto.setAvatarUrl(author.getAvatarUrl());
        dto.setAuthor(authorDto);

        dto.setChildren(new ArrayList<>());

        return dto;
    }
}
