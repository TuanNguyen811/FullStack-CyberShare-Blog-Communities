import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import apiClient from '@/lib/api';
import { Calendar, Eye, User, Folder, FileText, Search } from 'lucide-react';
import { format } from 'date-fns';
import FollowButton from '@/components/FollowButton';

export default function ExplorePage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [activeTab, setActiveTab] = useState('stories');
  const [posts, setPosts] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (query) {
      setPage(0);
      if (activeTab === 'stories') {
        searchPosts();
      } else if (activeTab === 'authors') {
        searchAuthors();
      } else if (activeTab === 'categories') {
        searchCategories();
      }
    }
  }, [query, activeTab]);

  useEffect(() => {
    if (query && activeTab === 'stories' && page > 0) {
      searchPosts();
    }
  }, [page]);

  const searchPosts = async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      const response = await apiClient.get('/api/posts/search', {
        params: {
          q: query,
          page: page,
          size: 10,
        },
      });
      if (page === 0) {
        setPosts(response.data.content);
      } else {
        setPosts(prev => [...prev, ...response.data.content]);
      }
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error('Failed to search posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const searchAuthors = async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      const response = await apiClient.get('/api/users/search', {
        params: {
          q: query,
          size: 20,
        },
      });
      setAuthors(response.data.content || response.data || []);
    } catch (err) {
      console.error('Failed to search authors:', err);
      setAuthors([]);
    } finally {
      setLoading(false);
    }
  };

  const searchCategories = async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      const response = await apiClient.get('/api/categories');
      const allCategories = response.data || [];
      // Filter categories by query
      const filtered = allCategories.filter(cat => 
        cat.name.toLowerCase().includes(query.toLowerCase()) ||
        (cat.description && cat.description.toLowerCase().includes(query.toLowerCase()))
      );
      setCategories(filtered);
    } catch (err) {
      console.error('Failed to search categories:', err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (page >= totalPages - 1) return;
    setPage(page + 1);
  };

  if (!query) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-3xl font-semibold mb-4">Explore</h1>
            <p className="text-gray-500">Use the search bar above to find stories, authors, and categories.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-normal text-gray-900 mb-2">
            Results for <span className="font-semibold">{query}</span>
          </h1>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('stories')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'stories'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText className="h-4 w-4" />
              Stories
            </button>
            <button
              onClick={() => setActiveTab('authors')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'authors'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <User className="h-4 w-4" />
              Authors
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'categories'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Folder className="h-4 w-4" />
              Categories
            </button>
          </nav>
        </div>

        {/* Stories Tab */}
        {activeTab === 'stories' && (
          <div className="space-y-8">
            {loading && posts.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : posts.length > 0 ? (
              <>
                {posts.map((post) => (
                  <article key={post.id} className="border-b border-gray-200 pb-8">
                    <Link to={`/post/${post.slug}`}>
                      <div className="group cursor-pointer">
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
                          <span className="text-sm text-gray-900">{post.authorDisplayName}</span>
                        </div>

                        <div className="flex gap-6">
                          <div className="flex-1">
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
                              {post.categoryName && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                                  {post.categoryName}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Cover Image */}
                          {post.coverImageUrl && (
                            <div className="w-28 h-28 flex-shrink-0">
                              <img
                                src={post.coverImageUrl}
                                alt={post.title}
                                className="w-full h-full object-cover rounded"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}

                {/* Pagination */}
                {page < totalPages - 1 && (
                  <div className="text-center pt-8">
                    <button
                      onClick={loadMore}
                      disabled={loading}
                      className="text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                    >
                      {loading ? 'Loading...' : 'Show more results'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No stories found for "{query}"</p>
              </div>
            )}
          </div>
        )}

        {/* Authors Tab */}
        {activeTab === 'authors' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : authors.length > 0 ? (
              authors.map((author) => (
                <div key={author.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <Link to={`/author/${author.username}`} className="flex items-center gap-4 flex-1">
                    {author.avatarUrl ? (
                      <img
                        src={author.avatarUrl}
                        alt={author.displayName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-lg font-semibold text-gray-600">
                        {author.displayName?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 hover:text-blue-600">
                        {author.displayName}
                      </h3>
                      <p className="text-sm text-gray-500">@{author.username}</p>
                      {author.bio && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-1">{author.bio}</p>
                      )}
                    </div>
                  </Link>
                  <FollowButton username={author.username} size="sm" />
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No authors found for "{query}"</p>
              </div>
            )}
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              <div className="col-span-2 text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : categories.length > 0 ? (
              categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.slug || category.name.toLowerCase()}`}
                  className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg hover:shadow-md transition-all border border-gray-200 hover:border-gray-300"
                >
                  <div className="flex items-start gap-3">
                    <Folder className="h-6 w-6 text-purple-500 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                      {category.postCount !== undefined && (
                        <p className="text-xs text-gray-500 mt-2">
                          {category.postCount} {category.postCount === 1 ? 'post' : 'posts'}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-2 text-center py-12">
                <Folder className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No categories found for "{query}"</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
