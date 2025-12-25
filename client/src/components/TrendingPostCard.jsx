import { Link } from 'react-router-dom';
import { Eye, Heart } from 'lucide-react';

export default function TrendingPostCard({ post }) {
    return (
        <article className="group">
            <Link to={`/post/${post.slug}`}>
                {/* Image - aspect-video như FeaturedCard */}
                <div className="relative w-full aspect-video bg-gray-200 rounded-sm overflow-hidden mb-3">
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
                    <h3 className="font-bold text-base text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
                        {post.title}
                    </h3>

                    {/* Author & Stats */}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        {post.authorAvatarUrl ? (
                            <img
                                src={post.authorAvatarUrl}
                                alt={post.authorDisplayName}
                                className="w-5 h-5 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-semibold">
                                {post.authorDisplayName?.charAt(0) || 'U'}
                            </div>
                        )}
                        <span className="font-medium text-gray-700">{post.authorDisplayName}</span>
                        <span>·</span>
                        <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>{post.views || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            <span>{post.likesCount || 0}</span>
                        </div>
                    </div>
                </div>
            </Link>
        </article>
    );
}
