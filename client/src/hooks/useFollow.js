import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api';

export function useFollow(username) {
  const { user, isAuthenticated } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Check if viewing own profile
  const isOwnProfile = user?.username === username;

  // Fetch follow status and stats
  useEffect(() => {
    if (!username) return;

    const fetchData = async () => {
      setInitialLoading(true);
      try {
        // Fetch follow stats (public)
        const statsResponse = await apiClient.get(`/api/users/${username}/follow-stats`);
        setFollowersCount(statsResponse.data.followers || 0);
        setFollowingCount(statsResponse.data.following || 0);

        // Check follow status (requires auth)
        if (isAuthenticated && !isOwnProfile) {
          const checkResponse = await apiClient.get(`/api/follows/${username}/check`);
          setIsFollowing(checkResponse.data.isFollowing);
        }
      } catch (err) {
        console.error('Failed to fetch follow data:', err);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, [username, isAuthenticated, isOwnProfile]);

  // Follow user
  const handleFollow = useCallback(async () => {
    if (!isAuthenticated || isOwnProfile || loading) return;

    setLoading(true);
    try {
      await apiClient.post(`/api/follows/${username}`);
      setIsFollowing(true);
      setFollowersCount(prev => prev + 1);
    } catch (err) {
      console.error('Failed to follow:', err);
      // Show error to user
      if (err.response?.data?.message) {
        alert(err.response.data.message);
      }
    } finally {
      setLoading(false);
    }
  }, [username, isAuthenticated, isOwnProfile, loading]);

  // Unfollow user
  const handleUnfollow = useCallback(async () => {
    if (!isAuthenticated || isOwnProfile || loading) return;

    setLoading(true);
    try {
      await apiClient.delete(`/api/follows/${username}`);
      setIsFollowing(false);
      setFollowersCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to unfollow:', err);
      if (err.response?.data?.message) {
        alert(err.response.data.message);
      }
    } finally {
      setLoading(false);
    }
  }, [username, isAuthenticated, isOwnProfile, loading]);

  // Toggle follow
  const toggleFollow = useCallback(() => {
    if (isFollowing) {
      handleUnfollow();
    } else {
      handleFollow();
    }
  }, [isFollowing, handleFollow, handleUnfollow]);

  return {
    isFollowing,
    followersCount,
    followingCount,
    loading,
    initialLoading,
    isOwnProfile,
    handleFollow,
    handleUnfollow,
    toggleFollow,
  };
}
