import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/api';
import { format } from 'date-fns';
import { Eye, Heart, MessageCircle, Bookmark, MoreHorizontal } from 'lucide-react';
import { useInteractions } from '@/hooks/useInteractions';

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchCategories();
    fetchTopAuthors();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [page, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/api/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchTopAuthors = async () => {
    try {
      // TODO: Replace with actual top authors endpoint
      const response = await apiClient.get('/api/users/top-authors?limit=5');
      setAuthors(response.data || []);
    } catch (err) {
      console.error('Failed to fetch top authors:', err);
      setAuthors([]);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let response;

      const params = {
        page,
        size: 10,
        sort: 'publishedAt,desc',
      };

      if (selectedCategory !== 'all') {
        params.categoryId = selectedCategory;
      }

      console.log('[Home] Fetching posts with params:', params);
      response = await apiClient.get('/api/posts', { params });
      console.log('[Home] Received posts:', response.data);

      setPosts(response.data.content);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Categories Filter */}
      <div className="border-b border-gray-200 bg-white sticky top-[57px] z-10">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => { setSelectedCategory('all'); setPage(0); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => { setSelectedCategory(category.id); setPage(0); }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === category.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Topic Header - Only show when category is selected */}
        {selectedCategory !== 'all' && (
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Topic: {categories.find(c => c.id === selectedCategory)?.name}
            </h1>
            <p className="text-gray-600">
              {totalElements} {totalElements === 1 ? 'story' : 'stories'}
            </p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No posts yet.</p>
            {isAuthenticated && (
              <Link to="/write">
                <Button>Write First Story</Button>
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Featured Posts - 2 Rows of Horizontal Cards */}
            {posts.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Stories</h2>
                
                {/* First Row - 4 cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  {posts.slice(0, 4).map((post) => (
                    <FeaturedCard key={post.id} post={post} />
                  ))}
                </div>

                {/* Second Row - 4 cards */}
                {posts.length > 4 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {posts.slice(4, 8).map((post) => (
                      <FeaturedCard key={post.id} post={post} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Main Content with Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Vertical List */}
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Latest Stories</h2>
                {posts.slice(8).map((post) => (
                  <PostItem key={post.id} post={post} />
                ))}
              </div>

              {/* Right Sidebar - Top Authors */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Top Authors</h3>
                  <div className="space-y-4">
                    {authors.length > 0 ? (
                      authors.map((author, index) => (
                        <AuthorCard key={author.id || index} author={author} />
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No authors to display</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12 pt-8 border-t">
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
    </div>
  );
}

// FeaturedCard Component - For featured horizontal cards
function FeaturedCard({ post }) {
  return (
    <article className="group">
      <Link to={`/post/${post.slug}`}>
        {/* Image */}
        <div className="relative w-full aspect-video bg-gray-200 rounded-lg overflow-hidden mb-3">
          {post.coverImageUrl ? (
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
              <span className="text-white text-3xl font-bold">
                {post.title?.charAt(0) || 'C'}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-2">
          {/* Title */}
          <h3 className="font-semibold text-base text-gray-900 line-clamp-2 group-hover:text-gray-600 transition-colors">
            {post.title}
          </h3>

          {/* Author & Stats */}
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="font-medium">{post.authorDisplayName}</span>
            <span>·</span>
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{post.views || 0}</span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}

// AuthorCard Component - For sidebar
function AuthorCard({ author }) {
  return (
    <Link
      to={`/author/${author.username}`}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
    >
      {author.avatarUrl ? (
        <img
          src={author.avatarUrl}
          alt={author.displayName}
          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
          {author.displayName?.charAt(0) || 'U'}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-900 truncate">
          {author.displayName}
        </p>
        <p className="text-xs text-gray-500 truncate">
          @{author.username}
        </p>
      </div>
    </Link>
  );
}

// PostItem Component - YouTube style horizontal card
function PostItem({ post }) {
  const { isAuthenticated } = useAuth();
  const { liked, bookmarked, handleLike, handleBookmark, loading } = useInteractions(post.id);

  const handleBookmarkClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('Please login to bookmark posts');
      return;
    }
    handleBookmark();
  };

  return (
    <article className="group">
      <Link to={`/post/${post.slug}`}>
        <div className="flex gap-4 cursor-pointer">
          {/* Cover Image */}
          <div className="relative w-64 h-36 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
            {post.coverImageUrl ? (
              <img
                src={post.coverImageUrl}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                <span className="text-white text-3xl font-bold">
                  {post.title?.charAt(0) || 'C'}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h2 className="font-semibold text-lg text-gray-900 line-clamp-2 mb-2 group-hover:text-gray-600 transition-colors">
              {post.title}
            </h2>

            {/* Stats & Author */}
            <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
              {/* Author */}
              <div className="flex items-center gap-2">
                {post.authorAvatarUrl ? (
                  <img
                    src={post.authorAvatarUrl}
                    alt={post.authorDisplayName}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                    {post.authorDisplayName?.charAt(0) || 'U'}
                  </div>
                )}
                <span className="text-sm font-medium">{post.authorDisplayName}</span>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{post.views || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                  <span>{post.likesCount || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.commentsCount || 0}</span>
                </div>
              </div>
            </div>

            {/* Summary */}
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
              {post.summary || post.content?.substring(0, 150) || 'No description available'}
            </p>

            {/* Tags & Category */}
            <div className="flex flex-wrap items-center gap-2">
              {post.categoryName && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {post.categoryName}
                </span>
              )}
              {post.publishedAt && (
                <span className="text-xs text-gray-500">
                  {format(new Date(post.publishedAt), 'MMM dd, yyyy')}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-start gap-2 flex-shrink-0">
            <button
              onClick={handleBookmarkClick}
              disabled={loading}
              className={`p-2 rounded-full transition-all disabled:opacity-50 hover:bg-gray-100 ${
                bookmarked ? 'text-gray-900' : 'text-gray-500'
              }`}
              title={bookmarked ? 'Remove bookmark' : 'Bookmark this post'}
            >
              <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // TODO: Add dropdown menu for more options
              }}
              className="p-2 rounded-full hover:bg-gray-100 hover:text-gray-900 transition-all text-gray-500"
              title="More options"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Link>
    </article>
  );
}
