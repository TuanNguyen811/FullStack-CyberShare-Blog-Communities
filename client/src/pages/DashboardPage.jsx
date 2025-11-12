import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/api';
import { PenSquare, Trash2, Eye, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchMyPosts();
  }, [isAuthenticated, navigate, statusFilter]);

  const fetchMyPosts = async () => {
    setLoading(true);
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const response = await apiClient.get('/api/posts/my-posts', { params });
      setPosts(response.data.content || []);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      setError('Failed to load your posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      await apiClient.delete(`/api/posts/${id}`);
      setPosts(posts.filter(p => p.id !== id));
    } catch (err) {
      console.error('Failed to delete post:', err);
      alert('Failed to delete post');
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'PENDING_REVIEW':
        return 'bg-yellow-100 text-yellow-800';
      case 'ARCHIVED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Posts</h1>
            <p className="text-gray-600 mt-1">Manage your stories</p>
          </div>
          <Button asChild>
            <Link to="/write">
              <PenSquare className="h-4 w-4 mr-2" />
              Write New Story
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex space-x-2">
            <Button
              variant={statusFilter === '' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('')}
              size="sm"
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'PUBLISHED' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('PUBLISHED')}
              size="sm"
            >
              Published
            </Button>
            <Button
              variant={statusFilter === 'DRAFT' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('DRAFT')}
              size="sm"
            >
              Drafts
            </Button>
            <Button
              variant={statusFilter === 'ARCHIVED' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('ARCHIVED')}
              size="sm"
            >
              Archived
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Posts List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading your posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <PenSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {statusFilter ? 'No posts found' : 'No posts yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {statusFilter
                ? `You don't have any ${statusFilter.toLowerCase()} posts.`
                : 'Start writing your first story!'}
            </p>
            <Button asChild>
              <Link to="/write">
                <PenSquare className="h-4 w-4 mr-2" />
                Write Your First Story
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h2 className="text-2xl font-bold hover:text-blue-600">
                        <Link to={`/post/${post.slug}`}>{post.title}</Link>
                      </h2>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                          post.status
                        )}`}
                      >
                        {post.status}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {post.categoryName && (
                        <span className="flex items-center">
                          <span className="font-medium">{post.categoryName}</span>
                        </span>
                      )}
                      <span className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {post.views} views
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {post.publishedAt
                          ? format(new Date(post.publishedAt), 'MMM dd, yyyy')
                          : format(new Date(post.createdAt), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/edit/${post.id}`}>
                        <PenSquare className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(post.id, post.title)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
