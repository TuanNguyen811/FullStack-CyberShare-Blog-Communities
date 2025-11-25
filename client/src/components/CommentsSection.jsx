import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import CommentItem from './CommentItem';
import { useAuth } from '../contexts/AuthContext';
import { getPostComments, createComment, updateComment, deleteComment } from '../services/interactions';

const CommentsSection = ({ postId, slug, onCommentCountChange }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [slug]);

  const loadComments = async () => {
    try {
      const data = await getPostComments(slug);
      setComments(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load comments:', error);
      setLoading(false);
    }
  };

  const handleCreateComment = async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      await createComment(postId, { content: newComment, parentId: null });
      setNewComment('');
      await loadComments();
      if (onCommentCountChange) onCommentCountChange(1);
    } catch (error) {
      console.error('Failed to create comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentId, content) => {
    try {
      await createComment(postId, { content, parentId });
      await loadComments();
      if (onCommentCountChange) onCommentCountChange(1);
    } catch (error) {
      console.error('Failed to create reply:', error);
      alert('Failed to post reply. Please try again.');
    }
  };

  const handleEdit = async (commentId, content) => {
    try {
      await updateComment(commentId, { content });
      await loadComments();
    } catch (error) {
      console.error('Failed to update comment:', error);
      alert('Failed to update comment. Please try again.');
    }
  };

  const countComments = (commentList) => {
    let count = commentList.length;
    commentList.forEach(comment => {
      if (comment.children && comment.children.length > 0) {
        count += countComments(comment.children);
      }
    });
    return count;
  };

  const handleDelete = async (commentId) => {
    try {
      // Count how many comments will be deleted (including children)
      const findComment = (comments, id) => {
        for (const comment of comments) {
          if (comment.id === id) return comment;
          if (comment.children) {
            const found = findComment(comment.children, id);
            if (found) return found;
          }
        }
        return null;
      };

      const comment = findComment(comments, commentId);
      const deletedCount = comment ? countComments([comment]) : 1;

      await deleteComment(commentId);
      await loadComments();
      if (onCommentCountChange) onCommentCountChange(-deletedCount);
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('Failed to delete comment. Please try again.');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading comments...</div>;
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">
        Comments ({countComments(comments)})
      </h2>

      {user ? (
        <div className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="4"
          />
          <div className="mt-3 flex justify-end">
            <Button
              onClick={handleCreateComment}
              disabled={!newComment.trim() || submitting}
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600">Please log in to comment</p>
        </div>
      )}

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CommentsSection;
