import { useState, useEffect } from 'react';
import apiClient from '@/lib/api';
import {
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  Eye,
  Heart,
  MessageCircle,
  Calendar,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [topAuthors, setTopAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, trendingRes, authorsRes] = await Promise.all([
        apiClient.get('/api/admin/statistics'),
        apiClient.get(`/api/posts/trending?limit=10`),
        apiClient.get('/api/users/top-authors?limit=10')
      ]);
      setStats(statsRes.data);
      setTrendingPosts(trendingRes.data?.content || trendingRes.data || []);
      setTopAuthors(authorsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError(err.response?.data?.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 mt-1">Platform statistics and insights</p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
          <button
            onClick={fetchAnalytics}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats?.totalUsers || 0}
          change={stats?.newUsersThisWeek || 0}
          changeLabel="this week"
          color="blue"
        />
        <StatCard
          icon={FileText}
          label="Total Posts"
          value={stats?.totalPosts || 0}
          change={stats?.newPostsThisWeek || 0}
          changeLabel="this week"
          color="green"
        />
        <StatCard
          icon={Eye}
          label="Total Views"
          value={stats?.totalViews || 0}
          color="purple"
        />
        <StatCard
          icon={Heart}
          label="Total Likes"
          value={stats?.totalLikes || 0}
          color="red"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trending Posts */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              Trending Posts
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {trendingPosts.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No trending posts</div>
            ) : (
              trendingPosts.slice(0, 5).map((post, index) => (
                <div key={post.id} className="px-6 py-4 flex items-center gap-4">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-700' :
                    index === 1 ? 'bg-gray-100 text-gray-700' :
                    index === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-50 text-gray-500'
                  }`}>
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{post.title}</h3>
                    <p className="text-sm text-gray-500">by {post.authorDisplayName || post.authorUsername}</p>
                  </div>
                  <div className="text-right text-sm">
                    <div className="flex items-center gap-3 text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {post.views || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {post.likesCount || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Authors */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Top Authors
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {topAuthors.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No authors data</div>
            ) : (
              topAuthors.slice(0, 5).map((author, index) => (
                <div key={author.id} className="px-6 py-4 flex items-center gap-4">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-700' :
                    index === 1 ? 'bg-gray-100 text-gray-700' :
                    index === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-50 text-gray-500'
                  }`}>
                    {index + 1}
                  </span>
                  <img
                    src={author.avatarUrl || `https://ui-avatars.com/api/?name=${author.username}`}
                    alt={author.username}
                    className="h-10 w-10 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900">{author.displayName || author.username}</h3>
                    <p className="text-sm text-gray-500">@{author.username}</p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>{author.followersCount || 0} followers</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Post Status Distribution */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-6">Post Status Distribution</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatusCard
            label="Published"
            value={stats?.publishedPosts || 0}
            total={stats?.totalPosts || 1}
            color="green"
          />
          <StatusCard
            label="Pending Review"
            value={stats?.pendingPosts || 0}
            total={stats?.totalPosts || 1}
            color="yellow"
          />
          <StatusCard
            label="Hidden"
            value={stats?.hiddenPosts || 0}
            total={stats?.totalPosts || 1}
            color="red"
          />
          <StatusCard
            label="Active Users"
            value={stats?.activeUsers || 0}
            total={stats?.totalUsers || 1}
            color="blue"
          />
        </div>
      </div>

      {/* Activity Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-6">Engagement Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-blue-50 rounded-xl">
            <MessageCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-900">{stats?.totalComments || 0}</p>
            <p className="text-sm text-gray-600">Total Comments</p>
          </div>
          <div className="text-center p-6 bg-red-50 rounded-xl">
            <Heart className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-900">{stats?.totalLikes || 0}</p>
            <p className="text-sm text-gray-600">Total Likes</p>
          </div>
          <div className="text-center p-6 bg-purple-50 rounded-xl">
            <Eye className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-900">{stats?.totalViews || 0}</p>
            <p className="text-sm text-gray-600">Total Views</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, change, changeLabel, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        {change !== undefined && change > 0 && (
          <span className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
            <ArrowUpRight className="h-3 w-3 mr-1" />
            +{change}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

function StatusCard({ label, value, total, color }) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  const colorClasses = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    gray: 'bg-gray-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
  };

  return (
    <div className="text-center">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mb-2">{label}</p>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-1">{percentage}%</p>
    </div>
  );
}
