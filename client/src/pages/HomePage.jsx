import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api';
import TrendingPostCard from '@/components/TrendingPostCard';
import PostListItem from '@/components/PostListItem';
import PostCard from '@/components/PostCard';
import FollowButton from '@/components/FollowButton';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, Flame, Clock, Eye, Heart, ArrowRight, Tag, Folder } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  
  // State for different sections
  const [categories, setCategories] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [feedPosts, setFeedPosts] = useState([]);
  const [latestPosts, setLatestPosts] = useState([]);
  const [topAuthors, setTopAuthors] = useState([]);
  const [topTrendingList, setTopTrendingList] = useState([]);
  const [topTags, setTopTags] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('latest');
  
  // Pagination for main posts list
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchData();
  }, [isAuthenticated]);

  useEffect(() => {
    fetchLatestPosts();
  }, [activeTab, page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const promises = [
        apiClient.get('/api/categories'),
        apiClient.get('/api/posts/trending', { params: { size: 8 } }),
        apiClient.get('/api/users/top-authors', { params: { limit: 5 } }),
        apiClient.get('/api/posts/trending', { params: { size: 5 } }),
        apiClient.get('/api/tags/top', { params: { limit: 10 } }),
        apiClient.get('/api/categories/top', { params: { limit: 8 } }),
      ];

      if (isAuthenticated) {
        promises.push(apiClient.get('/api/posts/feed', { params: { size: 4 } }));
      }

      const results = await Promise.all(promises);
      
      setCategories(results[0].data || []);
      setTrendingPosts(results[1].data.content || []);
      setTopAuthors(results[2].data || []);
      setTopTrendingList(results[3].data.content || []);
      setTopTags(results[4].data || []);
      setTopCategories(results[5].data || []);
      
      if (isAuthenticated && results[6]) {
        setFeedPosts(results[6].data.content || []);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestPosts = async () => {
    try {
      let sortParam = 'publishedAt,desc';
      if (activeTab === 'views') {
        sortParam = 'views,desc';
      } else if (activeTab === 'likes') {
        sortParam = 'likesCount,desc';
      }
      
      let response;
      if (activeTab === 'trending') {
        response = await apiClient.get('/api/posts/trending', { params: { page, size: 10 } });
      } else {
        response = await apiClient.get('/api/posts', { params: { page, size: 10, sort: sortParam } });
      }
      
      setLatestPosts(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Categories Bar */}
      <div className="border-b border-gray-200 bg-white sticky top-[57px] z-10">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            <Link
              to="/"
              className="px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap bg-gray-900 text-white"
            >
              All
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.slug || category.name.toLowerCase()}`}
                className="px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Trending Section */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            <h2 className="text-2xl font-bold text-gray-900">Trending</h2>
            <Link to="/trending" className="ml-auto text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {trendingPosts.slice(0, 4).map((post) => (
              <TrendingPostCard key={post.id} post={post} />
            ))}
          </div>
          
          {trendingPosts.length > 4 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingPosts.slice(4, 8).map((post) => (
                <TrendingPostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Feed from followed authors */}
      {isAuthenticated && feedPosts.length > 0 && (
        <section className="bg-gray-50 border-b">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center gap-2 mb-6">
              <Users className="h-5 w-5 text-blue-500" />
              <h2 className="text-2xl font-bold text-gray-900">From People You Follow</h2>
              <Link to="/feed" className="ml-auto text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {feedPosts.slice(0, 4).map((post) => (
                <TrendingPostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Posts List */}
          <div className="lg:col-span-2">
            {/* Tab Menu */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="flex border-b overflow-x-auto">
                <button
                  onClick={() => handleTabChange('latest')}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === 'latest'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Clock className="h-4 w-4" />
                  Latest
                </button>
                <button
                  onClick={() => handleTabChange('views')}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === 'views'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Eye className="h-4 w-4" />
                  Most Viewed
                </button>
                <button
                  onClick={() => handleTabChange('likes')}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === 'likes'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Heart className="h-4 w-4" />
                  Most Liked
                </button>
                <button
                  onClick={() => handleTabChange('trending')}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === 'trending'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Flame className="h-4 w-4" />
                  Trending
                </button>
              </div>
            </div>

            {/* Posts List */}
            <div className="space-y-4">
              {latestPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {latestPosts.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <p className="text-gray-500">No posts yet</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
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

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Top Authors */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                Top Authors
              </h3>
              
              <div className="space-y-3">
                {topAuthors.map((author) => (
                  <div key={author.id} className="flex items-center gap-3">
                    <Link to={`/author/${author.username}`}>
                      {author.avatarUrl ? (
                        <img
                          src={author.avatarUrl}
                          alt={author.displayName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                          {author.displayName?.charAt(0) || 'U'}
                        </div>
                      )}
                    </Link>
                    
                    <div className="flex-1 min-w-0">
                      <Link to={`/author/${author.username}`}>
                        <p className="font-medium text-gray-900 truncate hover:text-blue-600">
                          {author.displayName}
                        </p>
                      </Link>
                      <p className="text-xs text-gray-500 truncate">
                        @{author.username}
                      </p>
                    </div>
                    
                    <FollowButton 
                      username={author.username} 
                      variant="outline" 
                      size="sm"
                      showIcon={false}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Top 5 Trending Posts */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                Top 5 Trending
              </h3>
              
              <div className="divide-y divide-gray-100">
                {topTrendingList.slice(0, 5).map((post, index) => (
                  <PostListItem key={post.id} post={post} index={index} />
                ))}
              </div>
            </div>

            {/* Top Tags */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="h-4 w-4 text-green-500" />
                Popular Tags
              </h3>
              
              <div className="flex flex-wrap gap-2">
                {topTags.map((tag) => (
                  <Link
                    key={tag.id}
                    to={`/tag/${tag.slug || tag.name.toLowerCase()}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors"
                  >
                    #{tag.name}
                    {tag.postCount > 0 && (
                      <span className="text-xs text-gray-500">({tag.postCount})</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* Top Categories */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Folder className="h-4 w-4 text-purple-500" />
                Top Categories
              </h3>
              
              <div className="space-y-2">
                {topCategories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/category/${category.slug || category.name.toLowerCase()}`}
                    className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded-lg transition-colors group"
                  >
                    <span className="text-gray-700 group-hover:text-blue-600 font-medium">
                      {category.name}
                    </span>
                    <span className="text-sm text-gray-400 group-hover:text-blue-500">
                      {category.postCount || 0} posts
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Footer Info */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
              <h3 className="font-bold text-gray-900 mb-2">Welcome to CyberShare</h3>
              <p className="text-sm text-gray-600 mb-3">
                A community for developers to share knowledge, ideas, and connect with fellow tech enthusiasts.
              </p>
              <div className="text-xs text-gray-500 space-y-1">
                <p>📝 Write and share your stories</p>
                <p>💡 Discover inspiring content</p>
                <p>🤝 Connect with amazing people</p>
              </div>
              <div className="mt-4 pt-3 border-t border-blue-200">
                <p className="text-xs text-gray-400">
                  © 2025 CyberShare. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
