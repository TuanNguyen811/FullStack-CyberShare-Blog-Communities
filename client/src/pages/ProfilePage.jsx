import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/api';
import { Edit2 } from 'lucide-react';
import EditProfileModal from '@/components/EditProfileModal';

export default function ProfilePage() {
  const { user } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch user's posts
    // For now, just empty array
    setPosts([]);
    setLoading(false);
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Cover Image with Profile Info */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 pb-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
            <div className="flex items-start justify-between gap-6">
              {/* Left: Avatar */}
              <div className="flex-shrink-0">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.displayName}
                    className="h-40 w-40 rounded-full border-4 border-white object-cover"
                  />
                ) : (
                  <div className="h-40 w-40 rounded-full border-4 border-white bg-white bg-opacity-20 flex items-center justify-center text-white text-6xl font-bold">
                    {user.displayName?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>

              {/* Center: User Info and Stats */}
              <div className="flex-1 mt-4">
                <h1 className="text-4xl font-bold text-white">
                  {user.displayName || user.username}
                </h1>
                <p className="text-white text-opacity-90 mt-1">@{user.username}</p>
                {user.bio && (
                  <p className="mt-3 text-white text-opacity-95">{user.bio}</p>
                )}
                
                {/* Stats */}
                <div className="flex space-x-8 text-sm mt-4">
                  <div>
                    <span className="font-semibold text-white">{posts.length}</span>
                    <span className="text-white text-opacity-90 ml-1">Posts</span>
                  </div>
                  <div>
                    <span className="font-semibold text-white">0</span>
                    <span className="text-white text-opacity-90 ml-1">Followers</span>
                  </div>
                  <div>
                    <span className="font-semibold text-white">0</span>
                    <span className="text-white text-opacity-90 ml-1">Following</span>
                  </div>
                </div>
              </div>

              {/* Right: Edit Button */}
              <div className="flex-shrink-0 mt-4">
                <Button onClick={() => setShowEditModal(true)} variant="outline" className="bg-white hover:bg-gray-100">
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit profile
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Posts</h2>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500 text-lg">No posts yet</p>
              <p className="text-gray-400 mt-2">Start sharing your thoughts!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-semibold text-lg">{post.title}</h3>
                  <p className="text-gray-600 mt-2">{post.content}</p>
                </div>
              ))}
            </div>
          )}
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
