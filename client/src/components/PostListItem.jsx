import { Link } from 'react-router-dom';
import { Calendar, Eye, Heart, MessageSquare, Bookmark } from 'lucide-react';
import { format } from 'date-fns';

export default function PostListItem({ post, index }) {
    return (
        <article className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
            {/* Index number */}
            {index !== undefined && (
                <div className="flex-shrink-0 w-8 text-2xl font-bold text-gray-200">
                    {String(index + 1).padStart(2, '0')}
                </div>
            )}
            
            <div className="flex-1 min-w-0">
                {/* Author */}
                <Link
                    to={`/author/${post.authorUsername}`}
                    className="flex items-center gap-2 mb-2 hover:opacity-80 w-fit"
                >
                    {post.authorAvatarUrl ? (
                        <img
                            src={post.authorAvatarUrl}
                            alt={post.authorDisplayName}
                            className="w-6 h-6 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-semibold">
                            {post.authorDisplayName?.charAt(0) || 'U'}
                        </div>
                    )}
                    <span className="text-sm text-gray-600 font-medium">
                        {post.authorDisplayName}
                    </span>
                </Link>
                
                {/* Title */}
                <Link to={`/post/${post.slug}`}>
                    <h3 className="font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                        {post.title}
                    </h3>
                </Link>
                
                {/* Meta */}
                <div className="flex items-center gap-3 text-xs text-gray-500">
                    {post.publishedAt && (
                        <time dateTime={post.publishedAt}>
                            {format(new Date(post.publishedAt), 'MMM dd')}
                        </time>
                    )}
                    <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{post.views?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        <span>{post.likesCount || 0}</span>
                    </div>
                </div>
            </div>
            
            {/* Cover Image (small) */}
            {post.coverImageUrl && (
                <Link to={`/post/${post.slug}`} className="flex-shrink-0">
                    <img
                        src={post.coverImageUrl}
                        alt={post.title}
                        className="w-16 h-16 object-cover rounded"
                    />
                </Link>
            )}
        </article>
    );
}
