import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function SimilarPosts({ postId }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSimilarPosts = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get(`/posts/${postId}/similar?size=3`);
                setPosts(response.data.content);
            } catch (error) {
                console.error('Error fetching similar posts:', error);
            } finally {
                setLoading(false);
            }
        };

        if (postId) {
            fetchSimilarPosts();
        }
    }, [postId]);

    if (loading || posts.length === 0) {
        return null;
    }

    return (
        <div className="mt-12 border-t pt-8">
            <h3 className="text-2xl font-bold mb-6">Similar Posts</h3>
            <div className="grid gap-6 md:grid-cols-3">
                {posts.map((post) => (
                    <Link key={post.id} to={`/posts/${post.slug}`} className="group">
                        <div className="aspect-video rounded-lg overflow-hidden bg-muted mb-3">
                            {post.coverImageUrl ? (
                                <img
                                    src={post.coverImageUrl}
                                    alt={post.title}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-secondary text-secondary-foreground">
                                    No Image
                                </div>
                            )}
                        </div>
                        <h4 className="font-semibold group-hover:text-primary line-clamp-2">
                            {post.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                            {formatDate(post.publishedAt)}
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
