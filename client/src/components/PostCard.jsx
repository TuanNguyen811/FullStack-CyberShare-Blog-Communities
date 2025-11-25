import { Link } from 'react-router-dom';
import { Calendar, Eye, Heart, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

export default function PostCard({ post }) {
    return (
        <article className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <Link to={`/post/${post.slug}`} className="block">
                <div className="flex flex-col md:flex-row">
                    {/* Cover Image */}
                    {post.coverImageUrl && (
                        <div className="md:w-64 h-48 md:h-auto bg-gray-200">
                            <img
                                src={post.coverImageUrl}
                                alt={post.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 p-6">
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                            {post.categoryName && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                                    {post.categoryName}
                                </span>
                            )}
                            {post.tags && post.tags.length > 0 && post.tags.slice(0, 3).map(tag => (
                                <Link 
                                    key={tag.id || tag.name || tag} 
                                    to={`/tag/${tag.slug || tag.name || tag}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium hover:bg-gray-200 transition-colors"
                                >
                                    #{tag.name || tag}
                                </Link>
                            ))}
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 mb-2 hover:text-blue-600">
                            {post.title}
                        </h3>

                        {post.summary && (
                            <p className="text-gray-600 mb-4 line-clamp-2">
                                {post.summary}
                            </p>
                        )}

                        {/* Author */}
                        <Link
                            to={`/author/${post.authorUsername}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-2 mb-3 hover:opacity-80 w-fit"
                        >
                            {post.authorAvatarUrl ? (
                                <img
                                    src={post.authorAvatarUrl}
                                    alt={post.authorDisplayName}
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                                    {post.authorDisplayName?.charAt(0) || 'U'}
                                </div>
                            )}
                            <span className="text-sm text-gray-700 font-medium">
                                {post.authorDisplayName}
                            </span>
                        </Link>

                        {/* Metadata */}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            {post.publishedAt && (
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <time dateTime={post.publishedAt}>
                                        {format(new Date(post.publishedAt), 'MMM dd, yyyy')}
                                    </time>
                                </div>
                            )}
                            <div className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                <span>{(post.views || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Heart className="h-4 w-4" />
                                <span>{post.likesCount || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <MessageSquare className="h-4 w-4" />
                                <span>{post.commentsCount || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </article>
    );
}
