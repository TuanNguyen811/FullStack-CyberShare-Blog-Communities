import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '@/lib/api';
import { Tag as TagIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import PostItemLong from '@/components/PostItemLong';

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
                <PostItemLong key={post.id} post={post} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-12 pt-8 border-t">
                <Button
                  variant="outline"
                  onClick={() => { setPage((p) => Math.max(0, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-gray-700">
                  {page + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => { setPage((p) => Math.min(totalPages - 1, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
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
