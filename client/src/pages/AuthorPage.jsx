import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/api';
import PostCard from '@/components/PostCard';
import { Calendar, Mail, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { useFollow } from '@/hooks/useFollow';
import FollowButton from '@/components/FollowButton';

export default function AuthorPage() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();

  const [author, setAuthor] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [activeTab, setActiveTab] = useState('home');

  // Use follow hook
  const { 
    isFollowing, 
    followersCount, 
    followingCount, 
    loading: followLoading,
    isOwnProfile,
    toggleFollow 
  } = useFollow(username);

  useEffect(() => {
    fetchAuthor();
    fetchAuthorPosts();
  }, [username, page]);

  const fetchAuthor = async () => {
    try {
      const response = await apiClient.get(`/api/users/${username}`);
      setAuthor(response.data);
    } catch (err) {
      console.error('Failed to fetch author:', err);
    }
  };

  const fetchAuthorPosts = async () => {
    try {
      setLoading(true);
      // Assuming we have an endpoint to get posts by username
      const response = await apiClient.get(`/api/posts`, {
        params: {
          author: username,
          status: 'PUBLISHED',
          page,
          size: 10,
          sort: 'publishedAt,desc',
        },
      });
      setPosts(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!author) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2">
            {/* Author Header */}
            <div className="mb-8">
              <div className="flex items-start justify-between">
                <h1 className="text-4xl font-bold text-gray-900">
                  {author.displayName}
                </h1>

                {!isOwnProfile && (
                  <FollowButton username={username} size="sm" />
                )}

                {isOwnProfile && (
                  <Link to="/profile">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Settings className="h-4 w-4" />
                      Edit Profile
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('home')}
                  className={`${activeTab === 'home'
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } border-b-2 py-4 px-1 text-sm font-medium transition-colors`}
                >
                  Home
                </button>
                <button
                  onClick={() => setActiveTab('about')}
                  className={`${activeTab === 'about'
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } border-b-2 py-4 px-1 text-sm font-medium transition-colors`}
                >
                  About
                </button>
              </nav>
            </div>

            {/* Content */}
            {activeTab === 'home' ? (
              <>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No posts yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8 pt-8 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-4 text-gray-700">
                      {page + 1} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="prose max-w-none">
                <h2>About {author.displayName}</h2>
                {author.about ? (
                  <div className="whitespace-pre-wrap">{author.about}</div>
                ) : (
                  <p className="text-gray-500">No about section yet.</p>
                )}
              </div>
            )}
          </div>

          {/* Sidebar - Right Side */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="text-center mb-6">
                {author.avatarUrl ? (
                  <img
                    src={author.avatarUrl}
                    alt={author.displayName}
                    className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-gray-600">
                    {author.displayName?.charAt(0) || 'U'}
                  </div>
                )}

                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {author.displayName}
                </h2>
                <p className="text-gray-500 text-sm mb-4">
                  {posts.length} {posts.length === 1 ? 'Story' : 'Stories'}
                </p>

                {author.bio && (
                  <p className="text-gray-600 text-sm mb-4">
                    {author.bio}
                  </p>
                )}

                <div className="flex justify-center gap-6 text-sm mb-4 border-t border-b border-gray-100 py-3">
                  <div className="text-center">
                    <span className="block font-bold text-gray-900">{followersCount}</span>
                    <span className="text-gray-500">Followers</span>
                  </div>
                  <div className="text-center">
                    <span className="block font-bold text-gray-900">{followingCount}</span>
                    <span className="text-gray-500">Following</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="space-y-3">
                  {author.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{author.email}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Joined {format(new Date(author.createdAt || new Date()), 'MMM yyyy')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Follow Button - Sidebar */}
              {!isOwnProfile && (
                <FollowButton username={username} size="lg" className="w-full mb-4" />
              )}

              {/* Social Links - Placeholder */}
              <div className="text-center text-sm text-gray-500">
                <p>More from this author coming soon...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
