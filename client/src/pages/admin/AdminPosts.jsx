import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api';
import { Button } from '@/components/ui/button';
import { 
  FileText, Check, X, Eye, EyeOff, Trash2, 
  ChevronLeft, ChevronRight, Shield, ExternalLink 
} from 'lucide-react';

export default function AdminPosts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filter, setFilter] = useState('pending'); // pending, all
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, [page, filter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let url = filter === 'pending' 
        ? `/api/admin/posts/pending?page=${page}&size=20`
        : `/api/posts?page=${page}&size=20`;
      
      const response = await apiClient.get(url);
      setPosts(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
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

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Post Moderation</h1>
        <p className="text-gray-600 mt-2">Review and moderate posts</p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => { setFilter('pending'); setPage(0); }}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                filter === 'pending'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending Review
            </button>
            <button
              onClick={() => { setFilter('all'); setPage(0); }}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                filter === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Posts
            </button>
          </nav>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No posts to review</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex gap-4">
                {post.coverImageUrl && (
                  <img 
                    src={post.coverImageUrl} 
                    alt={post.title}
                    className="w-32 h-20 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        By {post.authorDisplayName || post.authorUsername} • {post.categoryName || 'Uncategorized'}
                      </p>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {post.summary || 'No summary'}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ml-4 ${
                      post.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                      post.status === 'PENDING_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                      post.status === 'HIDDEN' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {post.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                    <span>{post.views || 0} views</span>
                    <span>{post.likesCount || 0} likes</span>
                    <span>{post.commentsCount || 0} comments</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <Link 
                      to={`/post/${post.slug}`} 
                      target="_blank"
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Post
                    </Link>
                    
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
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => deletePost(post.id)}
                      disabled={actionLoading === post.id}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Page <span className="font-medium">{page + 1}</span> of <span className="font-medium">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
