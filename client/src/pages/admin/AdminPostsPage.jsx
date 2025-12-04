import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import apiClient from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Trash2,
  Check,
  X,
  RefreshCw,
  Filter,
  Calendar,
  User,
  MessageCircle,
  Heart
} from 'lucide-react';

export default function AdminPostsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, [page, statusFilter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let url = '/api/admin/posts';
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('size', 15);
      
      if (statusFilter === 'pending') {
        url = '/api/admin/posts/pending';
      } else if (statusFilter) {
        params.append('status', statusFilter.toUpperCase());
      }
      
      if (search) params.append('search', search);

      const response = await apiClient.get(`${url}?${params}`);
      setPosts(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
      setTotalElements(response.data.totalElements || 0);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchPosts();
  };

  const approvePost = async (postId) => {
    try {
      setActionLoading(postId);
      await apiClient.put(`/api/admin/posts/${postId}/approve`);
      fetchPosts();
    } catch (err) {
      console.error('Failed to approve post:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const rejectPost = async (postId) => {
    const reason = prompt('Enter rejection reason (optional):');
    try {
      setActionLoading(postId);
      await apiClient.put(`/api/admin/posts/${postId}/reject`, { reason });
      fetchPosts();
    } catch (err) {
      console.error('Failed to reject post:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const hidePost = async (postId) => {
    if (!confirm('Are you sure you want to hide this post?')) return;
    try {
      setActionLoading(postId);
      await apiClient.put(`/api/admin/posts/${postId}/hide`);
      fetchPosts();
    } catch (err) {
      console.error('Failed to hide post:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const unhidePost = async (postId) => {
    try {
      setActionLoading(postId);
      await apiClient.put(`/api/admin/posts/${postId}/approve`);
      fetchPosts();
    } catch (err) {
      console.error('Failed to unhide post:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const deletePost = async (postId) => {
    if (!confirm('Are you sure you want to permanently delete this post? This action cannot be undone.')) return;
    try {
      setActionLoading(postId);
      await apiClient.delete(`/api/admin/posts/${postId}`);
      fetchPosts();
    } catch (err) {
      console.error('Failed to delete post:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      PUBLISHED: 'bg-green-100 text-green-700',
      PENDING_REVIEW: 'bg-yellow-100 text-yellow-700',
      DRAFT: 'bg-gray-100 text-gray-700',
      HIDDEN: 'bg-red-100 text-red-700',
      REJECTED: 'bg-orange-100 text-orange-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Post Management</h1>
          <p className="text-gray-500 mt-1">Review, moderate and manage all posts</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchPosts()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title or author..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Status</option>
            <option value="pending">Pending Review</option>
            <option value="PUBLISHED">Published</option>
            <option value="HIDDEN">Hidden</option>
          </select>
          <Button type="submit">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </form>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { value: '', label: 'All Posts' },
          { value: 'pending', label: 'Pending Review', highlight: true },
          { value: 'PUBLISHED', label: 'Published' },
          { value: 'HIDDEN', label: 'Hidden' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatusFilter(tab.value); setPage(0); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              statusFilter === tab.value
                ? 'bg-blue-600 text-white'
                : tab.highlight
                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing <span className="font-medium">{posts.length}</span> of{' '}
          <span className="font-medium">{totalElements}</span> posts
        </p>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No posts found</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex gap-4">
                {/* Cover Image */}
                <Link to={`/post/${post.slug}`} className="flex-shrink-0">
                  {post.coverImageUrl ? (
                    <img
                      src={post.coverImageUrl}
                      alt={post.title}
                      className="w-40 h-24 object-cover rounded-lg hover:opacity-80 transition-opacity"
                    />
                  ) : (
                    <div className="w-40 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-8 w-8 text-gray-300" />
                    </div>
                  )}
                </Link>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <Link to={`/post/${post.slug}`} className="flex-1 group">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusBadge(post.status)}`}>
                          {post.status}
                        </span>
                        {post.categoryName && (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded">
                            {post.categoryName}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {post.summary || 'No summary available'}
                      </p>
                    </Link>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      
                      {post.status === 'PENDING_REVIEW' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => approvePost(post.id)}
                            disabled={actionLoading === post.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectPost(post.id)}
                            disabled={actionLoading === post.id}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      
                      {post.status === 'PUBLISHED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => hidePost(post.id)}
                          disabled={actionLoading === post.id}
                        >
                          <EyeOff className="h-4 w-4 mr-1" />
                          Hide
                        </Button>
                      )}
                      
                      {post.status === 'HIDDEN' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => unhidePost(post.id)}
                          disabled={actionLoading === post.id}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Unhide
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => deletePost(post.id)}
                        disabled={actionLoading === post.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Meta Info */}
                  <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {post.authorDisplayName || post.authorUsername}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {post.views || 0} views
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {post.likesCount || 0} likes
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {post.commentsCount || 0} comments
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-xl border border-gray-200 px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
