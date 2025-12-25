import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Eye, Heart, MessageCircle, Bookmark, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useInteractions } from '@/hooks/useInteractions';

export default function PostItemLong({ post }) {
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
            {/* Author + Category */}
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
              {post.categoryName && (
                <>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <Link
                    to={`/category/${post.categorySlug || post.categoryName.toLowerCase()}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {post.categoryName}
                  </Link>
                </>
              )}
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-600 transition-colors line-clamp-2">
              {post.title}
            </h2>

            {/* Excerpt */}
            <p className="text-gray-600 text-base mb-4 line-clamp-2">
              {post.summary || post.content?.substring(0, 150)}...
            </p>

            {/* Meta + Bookmark */}
            <div className="flex items-center justify-between">
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
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handleBookmarkClick}
                  disabled={loading}
                  className={`p-2 rounded-full transition-all disabled:opacity-50 hover:bg-gray-100 ${
                    bookmarked ? 'text-gray-900' : 'text-gray-400'
                  }`}
                  title={bookmarked ? 'Remove bookmark' : 'Bookmark this post'}
                >
                  <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  className="p-2 rounded-full transition-all hover:bg-gray-100 text-gray-400"
                  title="More options"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tags - max 5 */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {post.tags.slice(0, 5).map((tag) => (
                  <Link
                    key={tag.id || tag.name}
                    to={`/tag/${tag.slug || tag.name}`}
                    onClick={(e) => e.stopPropagation()}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 transition-colors"
                  >
                    #{tag.name || tag}
                  </Link>
                ))}
                {post.tags.length > 5 && (
                  <span className="px-2 py-1 text-gray-400 text-xs">+{post.tags.length - 5}</span>
                )}
              </div>
            )}
          </div>

          {/* Cover Image - larger */}
          {post.coverImageUrl && (
            <div className="w-40 h-40 flex-shrink-0">
              <img
                src={post.coverImageUrl}
                alt={post.title}
                className="w-full h-full object-cover rounded-sm"
              />
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}
