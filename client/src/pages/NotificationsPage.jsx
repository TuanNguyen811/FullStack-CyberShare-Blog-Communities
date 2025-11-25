import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '@/lib/api';
import { format } from 'date-fns';
import { Heart, MessageSquare, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        fetchNotifications();
    }, [page]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/api/notifications', {
                params: { page, size: 20 },
            });
            setNotifications(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await apiClient.post(`/api/notifications/${id}/read`);
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, read: true } : n
            ));
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await apiClient.post('/api/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'LIKE':
                return <Heart className="h-5 w-5 text-red-500 fill-current" />;
            case 'COMMENT':
                return <MessageSquare className="h-5 w-5 text-blue-500 fill-current" />;
            case 'FOLLOW':
                return <UserPlus className="h-5 w-5 text-green-500" />;
            default:
                return <div className="h-5 w-5 bg-gray-200 rounded-full" />;
        }
    };

    const getMessage = (notification) => {
        const actorName = notification.actorName || 'Someone';
        switch (notification.type) {
            case 'LIKE':
                return (
                    <span>
                        <span className="font-semibold text-gray-900">{actorName}</span> liked your post.
                    </span>
                );
            case 'COMMENT':
                return (
                    <span>
                        <span className="font-semibold text-gray-900">{actorName}</span> commented on your post.
                    </span>
                );
            case 'FOLLOW':
                return (
                    <span>
                        <span className="font-semibold text-gray-900">{actorName}</span> started following you.
                    </span>
                );
            default:
                return 'New notification';
        }
    };

    const getLink = (notification) => {
        if (notification.type === 'FOLLOW') {
            return `/author/${notification.actorUsername}`;
        }
        return `/post/${notification.entityId}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                    <Button variant="outline" size="sm" onClick={markAllAsRead}>
                        Mark all as read
                    </Button>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No notifications yet.
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50/50' : ''}`}
                                    onClick={() => !notification.read && markAsRead(notification.id)}
                                >
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 mt-1">
                                            {getIcon(notification.type)}
                                        </div>
                                        <Link to={getLink(notification)} className="flex-1 min-w-0 block">
                                            <p className="text-sm text-gray-600 mb-1">
                                                {getMessage(notification)}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {format(new Date(notification.createdAt), 'MMM dd, yyyy • h:mm a')}
                                            </p>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                        <Button
                            variant="outline"
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            disabled={page === 0}
                        >
                            Previous
                        </Button>
                        <span className="flex items-center px-4 text-gray-700">
                            Page {page + 1} of {totalPages}
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
