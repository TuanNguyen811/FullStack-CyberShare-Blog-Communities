import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '@/lib/api';
import PostCard from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import { Folder, FileText, Clock, Eye, Heart, Flame, ArrowLeft } from 'lucide-react';

export default function CategoryPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [activeTab, setActiveTab] = useState('latest');

  useEffect(() => {
    fetchCategory();
  }, [slug]);

  useEffect(() => {
    if (category) {
      fetchPosts();
    }
  }, [category, page, activeTab]);

  const fetchCategory = async () => {
    try {
      const response = await apiClient.get(`/api/categories/slug/${slug}`);
      setCategory(response.data);
    } catch (err) {
      console.error('Failed to fetch category:', err);
      // Try to get category from list
      try {
        const listResponse = await apiClient.get('/api/categories');
        const found = listResponse.data.find(c => c.slug === slug || c.name.toLowerCase() === slug.toLowerCase());
        if (found) {
          setCategory(found);
        }
      } catch (e) {
        console.error('Failed to find category:', e);
      }
    }
  };

  const fetchPosts = async () => {
    if (!category) return;
    
    setLoading(true);
    try {
      let sortParam = 'publishedAt,desc';
      if (activeTab === 'views') {
        sortParam = 'views,desc';
      } else if (activeTab === 'likes') {
        sortParam = 'likesCount,desc';
      } else if (activeTab === 'trending') {
        sortParam = 'views,desc'; // Use views for trending
      }

      const response = await apiClient.get('/api/posts', {
        params: {
          categoryId: category.id,
          page,
          size: 10,
          sort: sortParam
        }
      });

      setPosts(response.data.content || []);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generate cover image based on category name
  const getCoverGradient = (name) => {
    const gradients = [
      'from-blue-500 to-purple-600',
      'from-green-500 to-teal-600',
      'from-orange-500 to-red-600',
      'from-pink-500 to-rose-600',
      'from-indigo-500 to-blue-600',
      'from-yellow-500 to-orange-600',
      'from-cyan-500 to-blue-600',
      'from-violet-500 to-purple-600',
    ];
    const index = name?.charCodeAt(0) % gradients.length || 0;
    return gradients[index];
  };

  if (!category && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Folder className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Category Not Found</h2>
          <p className="text-gray-500 mb-4">The category you're looking for doesn't exist.</p>
          <Link to="/">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category Hero/Cover */}
      <div className={`bg-gradient-to-r ${getCoverGradient(category?.name)} relative`}>
        <div className="absolute inset-0 bg-black/30" />
        <div className="max-w-7xl mx-auto px-6 py-16 relative">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          
          <div className="flex items-center gap-3 mb-2">
            <Folder className="h-8 w-8 text-white" />
            <span className="text-white/80 text-lg">Topic</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {category?.name || 'Loading...'}
          </h1>
          
          {category?.description && (
            <p className="text-white/90 text-lg max-w-2xl mb-4">
              {category.description}
            </p>
          )}
          
          <div className="flex items-center gap-2 text-white/80">
            <FileText className="h-5 w-5" />
            <span className="text-lg">
              {totalElements} {totalElements === 1 ? 'post' : 'posts'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab Menu */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b overflow-x-auto">
            <button
              onClick={() => { setActiveTab('latest'); setPage(0); }}
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
              onClick={() => { setActiveTab('views'); setPage(0); }}
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
              onClick={() => { setActiveTab('likes'); setPage(0); }}
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
              onClick={() => { setActiveTab('trending'); setPage(0); }}
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
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No posts in this category yet</p>
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
      </div>
    </div>
  );
}
