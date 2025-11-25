import api from '../lib/api';

// Tags
export const searchTags = async (query = '') => {
  const response = await api.get('/api/tags', { params: { query } });
  return response.data;
};

// Comments
export const getPostComments = async (slug) => {
  const response = await api.get(`/api/posts/${slug}/comments`);
  return response.data;
};

export const createComment = async (postId, data) => {
  const response = await api.post(`/api/posts/${postId}/comments`, data);
  return response.data;
};

export const updateComment = async (commentId, data) => {
  const response = await api.patch(`/api/comments/${commentId}`, data);
  return response.data;
};

export const deleteComment = async (commentId) => {
  await api.delete(`/api/comments/${commentId}`);
};

// Interactions
export const toggleLike = async (postId) => {
  const response = await api.post(`/api/posts/${postId}/like`);
  return response.data;
};

export const toggleBookmark = async (postId) => {
  const response = await api.post(`/api/posts/${postId}/bookmark`);
  return response.data;
};

export const getInteractionStatus = async (postId) => {
  const response = await api.get(`/api/posts/${postId}/status`);
  return response.data;
};

export const getMyBookmarks = async (page = 0, size = 10, sort = 'createdAt,desc') => {
  const response = await api.get('/api/me/bookmarks', {
    params: { page, size, sort }
  });
  return response.data;
};
