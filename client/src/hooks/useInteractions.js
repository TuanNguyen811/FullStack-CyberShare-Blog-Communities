import { useState, useEffect } from 'react';
import { getInteractionStatus, toggleLike, toggleBookmark } from '../services/interactions';

export const useInteractions = (postId) => {
  const [status, setStatus] = useState({
    liked: false,
    bookmarked: false,
    likesCount: 0,
    bookmarksCount: 0,
    commentsCount: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (postId) {
      loadStatus();
    }
  }, [postId]);

  const loadStatus = async () => {
    try {
      const data = await getInteractionStatus(postId);
      setStatus(data);
    } catch (error) {
      console.error('Failed to load interaction status:', error);
    }
  };

  const handleLike = async () => {
    if (loading) return; // Prevent double clicks

    setLoading(true);

    // Save current state for rollback
    const previousState = { ...status };

    // Optimistic update - update UI immediately
    setStatus(prev => ({
      ...prev,
      liked: !prev.liked,
      likesCount: prev.liked ? prev.likesCount - 1 : prev.likesCount + 1,
    }));

    try {
      const data = await toggleLike(postId);
      console.log('[Like] Server response:', data); // Debug log
      // Update with server response to ensure accuracy
      // Update with server response to ensure accuracy
      setStatus(prev => ({
        ...prev,
        ...data,
      }));
    } catch (error) {
      console.error('Failed to toggle like:', error);
      // Rollback on error
      setStatus(previousState);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (loading) return; // Prevent double clicks

    setLoading(true);

    // Save current state for rollback
    const previousState = { ...status };

    // Optimistic update - update UI immediately
    setStatus(prev => ({
      ...prev,
      bookmarked: !prev.bookmarked,
      bookmarksCount: prev.bookmarked ? prev.bookmarksCount - 1 : prev.bookmarksCount + 1,
    }));

    try {
      const data = await toggleBookmark(postId);
      console.log('[Bookmark] Server response:', data); // Debug log
      // Update with server response to ensure accuracy
      // Update with server response to ensure accuracy
      setStatus(prev => ({
        ...prev,
        ...data,
      }));
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      // Rollback on error
      setStatus(previousState);
    } finally {
      setLoading(false);
    }
  };

  const incrementComments = () => {
    setStatus(prev => ({
      ...prev,
      commentsCount: prev.commentsCount + 1,
    }));
  };

  const decrementComments = (count = 1) => {
    setStatus(prev => ({
      ...prev,
      commentsCount: Math.max(0, prev.commentsCount - count),
    }));
  };

  return {
    liked: status.liked,
    bookmarked: status.bookmarked,
    likesCount: status.likesCount,
    bookmarksCount: status.bookmarksCount,
    commentsCount: status.commentsCount,
    loading,
    handleLike,
    handleBookmark,
    incrementComments,
    decrementComments,
    refresh: loadStatus,
  };
};
