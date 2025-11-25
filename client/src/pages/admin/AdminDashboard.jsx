import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api';
import { 
  Users, FileText, Eye, Heart, MessageCircle, 
  TrendingUp, Clock, BarChart3, Shield, AlertCircle 
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await apiClient.get('/api/admin/statistics');
      setStats(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600 mt-2">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Error</h1>
          <p className="text-gray-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, label, value, color, subValue }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
          <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-2xl font-semibold text-gray-900">{value?.toLocaleString() || 0}</p>
          {subValue && <p className="text-xs text-gray-400">{subValue}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of CyberShare platform statistics</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link 
          to="/admin/users"
          className="bg-blue-600 text-white rounded-lg p-4 hover:bg-blue-700 transition-colors"
        >
          <Users className="h-6 w-6 mb-2" />
          <span className="font-medium">Manage Users</span>
        </Link>
        <Link 
          to="/admin/posts"
          className="bg-green-600 text-white rounded-lg p-4 hover:bg-green-700 transition-colors"
        >
          <FileText className="h-6 w-6 mb-2" />
          <span className="font-medium">Moderate Posts</span>
          {stats?.pendingPosts > 0 && (
            <span className="ml-2 bg-white text-green-600 text-xs px-2 py-1 rounded-full">
              {stats.pendingPosts} pending
            </span>
          )}
        </Link>
        <Link 
          to="/admin/categories"
          className="bg-purple-600 text-white rounded-lg p-4 hover:bg-purple-700 transition-colors"
        >
          <BarChart3 className="h-6 w-6 mb-2" />
          <span className="font-medium">Categories & Tags</span>
        </Link>
      </div>

      {/* User Statistics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">User Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard 
            icon={Users} 
            label="Total Users" 
            value={stats?.totalUsers} 
            color="bg-blue-500"
            subValue={`+${stats?.newUsersThisWeek || 0} this week`}
          />
          <StatCard 
            icon={Users} 
            label="Active Users" 
            value={stats?.activeUsers} 
            color="bg-green-500"
          />
          <StatCard 
            icon={Users} 
            label="Banned Users" 
            value={stats?.bannedUsers} 
            color="bg-red-500"
          />
        </div>
      </div>

      {/* Post Statistics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Post Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard 
            icon={FileText} 
            label="Total Posts" 
            value={stats?.totalPosts} 
            color="bg-blue-500"
            subValue={`+${stats?.newPostsThisWeek || 0} this week`}
          />
          <StatCard 
            icon={FileText} 
            label="Published" 
            value={stats?.publishedPosts} 
            color="bg-green-500"
          />
          <StatCard 
            icon={Clock} 
            label="Pending Review" 
            value={stats?.pendingPosts} 
            color="bg-yellow-500"
          />
          <StatCard 
            icon={FileText} 
            label="Drafts" 
            value={stats?.draftPosts} 
            color="bg-gray-500"
          />
        </div>
      </div>

      {/* Engagement Statistics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Engagement Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard 
            icon={Eye} 
            label="Total Views" 
            value={stats?.totalViews} 
            color="bg-purple-500"
          />
          <StatCard 
            icon={Heart} 
            label="Total Likes" 
            value={stats?.totalLikes} 
            color="bg-red-500"
          />
          <StatCard 
            icon={MessageCircle} 
            label="Total Comments" 
            value={stats?.totalComments} 
            color="bg-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
