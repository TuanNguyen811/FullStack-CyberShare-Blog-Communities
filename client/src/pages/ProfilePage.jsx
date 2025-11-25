import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/api';
import PostCard from '@/components/PostCard';
import { Edit2, Calendar, Mail, Settings, PenSquare, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import EditProfileModal from '@/components/EditProfileModal';
import { useFollow } from '@/hooks/useFollow';

export default function ProfilePage() {
  const { user } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [activeTab, setActiveTab] = useState('home');
  
  // Get follow stats for current user
  const { followersCount, followingCount, initialLoading: followLoading } = useFollow(user?.username);

  useEffect(() => {
    if (user) {
      fetchMyPosts();
    }
  }, [user, page]);

  const fetchMyPosts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/posts/my-posts', {
        params: {
          page,
          size: 10,
          sort: 'createdAt,desc',
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Left Side */}
            <div className="lg:col-span-2">
              {/* Profile Header */}
              <div className="mb-8">
                <div className="flex items-start justify-between">
                  <h1 className="text-4xl font-bold text-gray-900">
                    {user.displayName}
                  </h1>
                  
                  <Button
                    onClick={() => setShowEditModal(true)}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Button>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('home')}
                    className={`${
                      activeTab === 'home'
                        ? 'border-gray-900 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } border-b-2 py-4 px-1 text-sm font-medium transition-colors`}
                  >
                    Home
                  </button>
                  <button
                    onClick={() => setActiveTab('about')}
                    className={`${
                      activeTab === 'about'
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
                <div>
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  ) : posts.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 mb-4">You haven't written any stories yet.</p>
                      <Link to="/write">
                        <Button>Write Your First Story</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {posts.map((post) => (
                        <div key={post.id} className="relative">
                          <PostCard post={post} />
                          {/* Action buttons overlay */}
                          <div className="absolute top-4 right-4 flex items-center space-x-2 bg-white/90 rounded-lg p-1">
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/edit/${post.id}`}>
                                <PenSquare className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </div>
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
                </div>
              ) : (
                <div className="prose max-w-none">
                  <h2>About {user.displayName}</h2>
                  {user.about ? (
                    <div className="whitespace-pre-wrap">{user.about}</div>
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
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.displayName}
                      className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-gray-600">
                      {user.displayName?.charAt(0) || 'U'}
                    </div>
                  )}

                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    {user.displayName}
                  </h2>
                  <p className="text-gray-500 text-sm mb-2">
                    {posts.length} {posts.length === 1 ? 'Story' : 'Stories'}
                  </p>

                  {/* Follow Stats */}
                  <div className="flex justify-center gap-6 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">
                        {followLoading ? '-' : followersCount}
                      </div>
                      <div className="text-xs text-gray-500">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">
                        {followLoading ? '-' : followingCount}
                      </div>
                      <div className="text-xs text-gray-500">Following</div>
                    </div>
                  </div>

                  <Button
                    onClick={() => setShowEditModal(true)}
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit Profile
                  </Button>
                </div>

                {/* Stats */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="space-y-3">
                    {user.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span>
                        Joined {format(new Date(user.createdAt || new Date()), 'MMM yyyy')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="space-y-2">
                  <Link to="/write">
                    <Button variant="outline" className="w-full justify-start">
                      Write a story
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button variant="outline" className="w-full justify-start">
                      Stories
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
}
