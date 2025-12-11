import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { Calendar, Eye, Edit, Trash2, ArrowLeft, Heart, Bookmark, MessageSquare, ChevronRight, Folder } from 'lucide-react';
import { format } from 'date-fns';
import { useInteractions } from '@/hooks/useInteractions';
import CommentsSection from '@/components/CommentsSection';
import FollowButton from '@/components/FollowButton';
import SimilarPosts from '@/components/SimilarPosts';
import TrendingPostCard from '@/components/TrendingPostCard';
import AIChatbot from '@/components/AIChatbot';

export default function PostDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [categoryPosts, setCategoryPosts] = useState([]);

  const {
    liked,
    bookmarked,
    likesCount,
    bookmarksCount,
    commentsCount,
    handleLike,
    handleBookmark,
    incrementComments,
    decrementComments,
  } = useInteractions(post?.id);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  useEffect(() => {
    if (post?.id) {
      // Increment view count
      apiClient.post(`/api/posts/${post.id}/view`).catch(err => {
        console.error('Failed to increment view count:', err);
      });

      // Fetch posts from same category
      if (post.categoryId) {
        fetchCategoryPosts();
      }
    }
  }, [post?.id]);

  const fetchCategoryPosts = async () => {
    try {
      const response = await apiClient.get('/api/posts', {
        params: {
          categoryId: post.categoryId,
          size: 5,
          sort: 'publishedAt,desc'
        }
      });
      // Filter out current post
      const filtered = (response.data.content || []).filter(p => p.id !== post.id);
      setCategoryPosts(filtered.slice(0, 4));
    } catch (err) {
      console.error('Failed to fetch category posts:', err);
    }
  };

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/posts/slug/${slug}`);
      setPost(response.data);
    } catch (err) {
      console.error('Failed to fetch post:', err);
      setError(err.response?.data?.message || 'Post not found');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      setDeleting(true);
      await apiClient.delete(`/api/posts/${post.id}`);
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to delete post:', err);
      alert(err.response?.data?.message || 'Failed to delete post');
    } finally {
      setDeleting(false);
    }
  };

  const isAuthor = user && post && user.id === post.authorId;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Post Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <article>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
            <Link to="/" className="hover:text-gray-900 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            {post.categoryName && (
              <>
                <Link
                  to={`/category/${post.categorySlug || post.categoryName.toLowerCase()}`}
                  className="hover:text-gray-900 transition-colors"
                >
                  {post.categoryName}
                </Link>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
            <span className="text-gray-900 font-medium truncate">{post.title}</span>
          </nav>

          {/* Header */}
          <header className="mb-8">
            {/* Title */}
            <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Summary */}
            {post.summary && (
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {post.summary}
              </p>
            )}

            {/* Author & Follow */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Link
                  to={`/author/${post.authorUsername}`}
                  className="flex items-center gap-3 hover:opacity-80"
                >
                  {post.authorAvatarUrl ? (
                    <img
                      src={post.authorAvatarUrl}
                      alt={post.authorDisplayName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                      {post.authorDisplayName?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">
                      {post.authorDisplayName}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      {post.publishedAt && (
                        <time dateTime={post.publishedAt}>
                          {format(new Date(post.publishedAt), 'MMM dd, yyyy')}
                        </time>
                      )}
                      <span>·</span>
                      <span>{Math.ceil((post.content?.length || 0) / 1000)} min read</span>
                    </div>
                  </div>
                </Link>
              </div>

              {!isAuthor && (
                <FollowButton username={post.authorUsername} variant="default" className="rounded-full" />
              )}
            </div>

            {/* Interaction Bar - Top */}
            <div className="flex items-center justify-between py-4 border-y">
              <div className="flex items-center gap-6">
                {/* Like */}
                <button
                  onClick={handleLike}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                  disabled={!user}
                >
                  <Heart className={`w-6 h-6 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                  <span className="text-sm">{likesCount}</span>
                </button>

                {/* Comment */}
                <button
                  onClick={() => document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <MessageSquare className="w-6 h-6" />
                  <span className="text-sm">{commentsCount}</span>
                </button>
              </div>

              <div className="flex items-center gap-4">
                {/* Bookmark */}
                <button
                  onClick={handleBookmark}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  disabled={!user}
                  title={bookmarked ? 'Remove bookmark' : 'Bookmark this post'}
                >
                  <Bookmark className={`w-6 h-6 ${bookmarked ? 'fill-current' : ''}`} />
                </button>

                {/* Edit (for author) */}
                {isAuthor && (
                  <>
                    <button
                      onClick={() => navigate(`/edit/${post.id}`)}
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                      title="Edit post"
                    >
                      <Edit className="w-6 h-6" />
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="text-gray-600 hover:text-red-600 transition-colors"
                      title="Delete post"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* Cover Image */}
          {post.coverImageUrl && (
            <div className="w-full mb-12">
              <img
                src={post.coverImageUrl}
                alt={post.title}
                className="w-full h-auto rounded-lg"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg prose-slate max-w-none
            prose-headings:font-bold prose-headings:text-gray-900
            prose-h1:text-4xl prose-h1:mb-4
            prose-h2:text-3xl prose-h2:mb-3 prose-h2:mt-8
            prose-h3:text-2xl prose-h3:mb-2 prose-h3:mt-6
            prose-p:text-gray-800 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-xl
            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-gray-900 prose-strong:font-semibold
            prose-code:text-red-600 prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-[''] prose-code:after:content-['']
            prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
            prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4
            prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-4
            prose-li:text-gray-800 prose-li:mb-2 prose-li:text-xl
            prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600
            prose-img:rounded-lg prose-img:w-full prose-img:my-8
            prose-hr:border-gray-300 prose-hr:my-8
            prose-table:border-collapse prose-table:w-full
            prose-th:border prose-th:border-gray-300 prose-th:bg-gray-50 prose-th:p-2 prose-th:text-left
            prose-td:border prose-td:border-gray-300 prose-td:p-2
          ">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeSanitize]}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Tags & Category */}
          {(post.categoryName || (post.tags && post.tags.length > 0)) && (
            <div className="flex flex-wrap items-center gap-2 mt-12 pt-8 border-t">
              {post.categoryName && (
                <Link 
                  to={`/category/${post.categorySlug || post.categoryName.toLowerCase()}`}
                  className="px-4 py-2 bg-gray-100 text-gray-800 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  {post.categoryName}
                </Link>
              )}
              {post.tags && post.tags.length > 0 && post.tags.map(tag => (
                <Link 
                  key={tag.id || tag.name} 
                  to={`/tag/${tag.slug || tag.name}`}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  #{tag.name || tag}
                </Link>
              ))}
            </div>
          )}

          {/* Interaction Bar */}
          <div className="flex items-center justify-between py-6 mt-8 border-t">
            <div className="flex items-center gap-6">
              {/* Like */}
              <button
                onClick={handleLike}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                disabled={!user}
              >
                <Heart className={`w-7 h-7 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                <span className="text-base font-medium">{likesCount}</span>
              </button>

              {/* Comment */}
              <button
                onClick={() => document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <MessageSquare className="w-7 h-7" />
                <span className="text-base font-medium">{commentsCount}</span>
              </button>
            </div>

            <div className="flex items-center gap-4">
              {/* Bookmark */}
              <button
                onClick={handleBookmark}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                disabled={!user}
                title={bookmarked ? 'Remove bookmark' : 'Bookmark this post'}
              >
                <Bookmark className={`w-7 h-7 ${bookmarked ? 'fill-current' : ''}`} />
              </button>

              {/* Edit (for author) */}
              {isAuthor && (
                <>
                  <button
                    onClick={() => navigate(`/edit/${post.id}`)}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                    title="Edit post"
                  >
                    <Edit className="w-6 h-6" />
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="text-gray-600 hover:text-red-600 transition-colors"
                    title="Delete post"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
          </div>
        </article>

        {/* Similar Posts */}
        <SimilarPosts postId={post.id} />

        {/* Comments Section */}
        <div id="comments-section" className="mt-16">
          <CommentsSection
            postId={post.id}
            slug={slug}
            onCommentCountChange={(delta) => {
              if (delta > 0) incrementComments();
              else decrementComments(Math.abs(delta));
            }}
          />
        </div>

        {/* Category Recommendations */}
        {categoryPosts.length > 0 && (
          <div className="mt-16 pt-8 border-t">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                More in {post.categoryName}
              </h2>
              <Link 
                to={`/category/${post.categorySlug || post.categoryName?.toLowerCase()}`}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {categoryPosts.map((p) => (
                <TrendingPostCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Chatbot */}
      <AIChatbot post={post} />
    </div>
  );
}
