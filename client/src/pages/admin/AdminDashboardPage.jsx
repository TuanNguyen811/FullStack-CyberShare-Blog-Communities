import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '@/lib/api';
import {
  Users,
  FileText,
  Eye,
  Heart,
  MessageCircle,
  TrendingUp,
  UserPlus,
  FileEdit,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, postsRes] = await Promise.all([
        apiClient.get('/api/admin/statistics'),
        apiClient.get('/api/admin/users?page=0&size=5&sort=createdAt,desc'),
        apiClient.get('/api/admin/posts/pending?page=0&size=5')
      ]);
      setStats(statsRes.data);
      setRecentUsers(usersRes.data.content || []);
      setPendingPosts(postsRes.data.content || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-red-800">{error}</h2>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      change: stats?.newUsersThisWeek || 0,
      changeLabel: 'this week',
      icon: Users,
      color: 'blue',
      link: '/admin/users'
    },
    {
      title: 'Total Posts',
      value: stats?.totalPosts || 0,
      change: stats?.newPostsThisWeek || 0,
      changeLabel: 'this week',
      icon: FileText,
      color: 'green',
      link: '/admin/posts'
    },
    {
      title: 'Total Views',
      value: stats?.totalViews || 0,
      change: null,
      icon: Eye,
      color: 'purple',
      link: '/admin/analytics'
    },
    {
      title: 'Total Likes',
      value: stats?.totalLikes || 0,
      change: null,
      icon: Heart,
      color: 'red',
      link: '/admin/analytics'
    },
    {
      title: 'Comments',
      value: stats?.totalComments || 0,
      change: null,
      icon: MessageCircle,
      color: 'yellow',
      link: '/admin/analytics'
    },
    {
      title: 'Pending Review',
      value: stats?.pendingPosts || 0,
      change: null,
      icon: Clock,
      color: 'orange',
      link: '/admin/posts?status=pending'
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with CyberShare.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${colorClasses[stat.color]}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              {stat.change !== null && stat.change > 0 && (
                <span className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +{stat.change}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stat.value.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">{stat.title}</p>
          </Link>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Users</h2>
            <Link to="/admin/users" className="text-sm text-blue-600 hover:text-blue-800">
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentUsers.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No users found</div>
            ) : (
              recentUsers.map((user) => (
                <div key={user.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.username}`}
                      alt={user.username}
                      className="h-10 w-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{user.displayName || user.username}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                      user.status === 'BANNED' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {user.status}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Posts */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Pending Review</h2>
            <Link to="/admin/posts?status=pending" className="text-sm text-blue-600 hover:text-blue-800">
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {pendingPosts.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No pending posts</div>
            ) : (
              pendingPosts.map((post) => (
                <div key={post.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{post.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        by {post.authorDisplayName || post.authorUsername}
                      </p>
                    </div>
                    <Link
                      to={`/admin/posts?id=${post.id}`}
                      className="ml-4 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Review
                    </Link>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Submitted {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/admin/users"
            className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors"
          >
            <UserPlus className="h-8 w-8 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Manage Users</span>
          </Link>
          <Link
            to="/admin/posts?status=pending"
            className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:bg-green-50 hover:border-green-300 transition-colors"
          >
            <FileEdit className="h-8 w-8 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Review Posts</span>
          </Link>
          <Link
            to="/admin/categories"
            className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:bg-purple-50 hover:border-purple-300 transition-colors"
          >
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Categories</span>
          </Link>
          <Link
            to="/admin/analytics"
            className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:bg-orange-50 hover:border-orange-300 transition-colors"
          >
            <Eye className="h-8 w-8 text-orange-600" />
            <span className="text-sm font-medium text-gray-700">Analytics</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
