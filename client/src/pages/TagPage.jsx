import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '@/lib/api';
import { format } from 'date-fns';
import { Eye, Heart, MessageCircle, Bookmark, Tag as TagIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useInteractions } from '@/hooks/useInteractions';

export default function TagPage() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [tagInfo, setTagInfo] = useState(null);

  useEffect(() => {
    fetchTagInfo();
  }, [slug]);

  useEffect(() => {
    fetchPosts();
  }, [slug, page]);

  const fetchTagInfo = async () => {
    try {
      const response = await apiClient.get('/api/tags', {
        params: { query: slug }
      });
      const tag = response.data.find(t => t.slug === slug || t.name.toLowerCase() === slug.toLowerCase());
      setTagInfo(tag);
    } catch (err) {
      console.error('Failed to fetch tag info:', err);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/posts', {
        params: {
          tagSlug: slug,
          page,
          size: 10,
          sort: 'publishedAt,desc'
        }
      });
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
      {/* Tag Header */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gray-900 rounded-xl">
              <TagIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                #{tagInfo?.name || slug}
              </h1>
              <p className="text-gray-600 mt-1">
                {totalElements} {totalElements === 1 ? 'story' : 'stories'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <TagIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">No posts with this tag yet.</p>
            {isAuthenticated && (
              <Link to="/write">
                <Button>Write a Story</Button>
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-8">
              {posts.map((post) => (
                <PostItem key={post.id} post={post} />
              ))}
            </div>

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
          </>
        )}
      </div>
    </div>
  );
}

// PostItem Component
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
    <article className="group border-b border-gray-200 pb-8">
      <Link to={`/post/${post.slug}`}>
        <div className="flex gap-6">
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Author */}
            <div className="flex items-center gap-2 mb-3">
              {post.authorAvatarUrl ? (
                <img
                  src={post.authorAvatarUrl}
                  alt={post.authorDisplayName}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                  {post.authorDisplayName?.charAt(0) || 'U'}
                </div>
              )}
              <span className="text-sm text-gray-900 font-medium">{post.authorDisplayName}</span>
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-600 transition-colors line-clamp-2">
              {post.title}
            </h2>

            {/* Excerpt */}
            <p className="text-gray-600 text-base mb-4 line-clamp-2">
              {post.summary || post.content?.substring(0, 150)}...
            </p>

            {/* Meta */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              {post.publishedAt && (
                <time dateTime={post.publishedAt}>
                  {format(new Date(post.publishedAt), 'MMM dd, yyyy')}
                </time>
              )}
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
              {post.categoryName && (
                <span className="text-gray-700">{post.categoryName}</span>
              )}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {post.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    to={`/tag/${tag.slug}`}
                    onClick={(e) => e.stopPropagation()}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 transition-colors"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Cover Image */}
          {post.coverImageUrl && (
            <div className="w-32 h-32 flex-shrink-0">
              <img
                src={post.coverImageUrl}
                alt={post.title}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          )}

          {/* Bookmark Button */}
          <button
            onClick={handleBookmarkClick}
            disabled={loading}
            className={`p-2 rounded-full transition-all disabled:opacity-50 hover:bg-gray-100 self-start ${
              bookmarked ? 'text-gray-900' : 'text-gray-500'
            }`}
            title={bookmarked ? 'Remove bookmark' : 'Bookmark this post'}
          >
            <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </Link>
    </article>
  );
}
