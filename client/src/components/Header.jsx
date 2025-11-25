import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import apiClient from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/context/SidebarContext';
import { Bell, PenSquare, LogOut, Menu, X, Search, Home, Compass, Info, BookOpen, BarChart3, Settings, MessageCircle, Shield } from 'lucide-react';

export default function Header() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      // Poll every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, location.pathname]); // Re-fetch on route change (e.g. visiting notifications page)

  const fetchUnreadCount = async () => {
    try {
      const response = await apiClient.get('/api/notifications/unread-count');
      setUnreadCount(response.data.count);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setSidebarOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  if (loading) {
    return (
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-primary">CyberShare</h1>
            </Link>
            <div className="h-8 w-8 animate-pulse bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="w-full px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left Section: Hamburger + Logo */}
            <div className="flex items-center gap-3">
              {/* Hamburger Menu Button */}
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Menu"
              >
                <Menu className="h-6 w-6" />
              </button>

              {/* Logo */}
              <Link to="/" className="flex items-center">
                <h1 className="text-2xl font-bold text-primary">CyberShare</h1>
              </Link>
            </div>

            {/* Center Section: Search Bar + AI Chat */}
            <div className="hidden md:flex items-center gap-2 flex-1 max-w-2xl mx-auto">
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search"
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-gray-400 bg-gray-50 text-sm"
                  />
                </div>
              </form>
              
              {/* AI Chat Button */}
              <button
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-gray-900"
                aria-label="AI Chat"
                title="Chat with AI"
              >
                <MessageCircle className="h-5 w-5" />
              </button>
            </div>

            {/* Right Section: Actions */}
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  {/* Write Button */}
                  <Link to="/write">
                    <Button variant="ghost" size="sm" className="gap-2 text-gray-600 hover:text-gray-900">
                      <PenSquare className="h-5 w-5" />
                      <span className="hidden md:inline">Write</span>
                    </Button>
                  </Link>

                  {/* Notifications */}
                  <Link to="/notifications">
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="h-6 w-6 text-gray-600" />
                      {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-medium">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Button>
                  </Link>

                  {/* User Avatar & Dropdown */}
                  <div className="relative group">
                    <button className="flex items-center">
                      {user?.avatarUrl ? (
                        <>
                          <img
                            src={user.avatarUrl}
                            alt={`${user.displayName || user.username || 'User'} avatar`}
                            className="h-8 w-8 rounded-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              if (e.currentTarget.nextSibling) {
                                e.currentTarget.nextSibling.style.display = 'flex';
                              }
                            }}
                          />
                          <div
                            className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm"
                            style={{ display: 'none' }}
                          >
                            {user?.displayName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
                          </div>
                        </>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                          {user?.displayName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                    </button>

                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="px-4 py-3 border-b">
                        <p className="text-sm font-semibold truncate">{user?.displayName || user?.username}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors">
                        Profile
                      </Link>
                      <Link to="/dashboard" className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors">
                        My Posts
                      </Link>
                      <Link to="/bookmarks" className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors">
                        Bookmarks
                      </Link>
                      <Link to="/settings" className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors">
                        Settings
                      </Link>
                      {user?.role === 'ADMIN' && (
                        <>
                          <div className="border-t my-1"></div>
                          <Link to="/admin" className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors text-purple-600 flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Admin Dashboard
                          </Link>
                        </>
                      )}
                      <div className="border-t my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link to="/register">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar - Below Header */}
      <aside className={`fixed top-[57px] left-0 h-[calc(100vh-57px)] w-64 bg-white border-r z-40 transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-64'
      }`}>
        <nav className="p-4 space-y-1">
          <Link 
            to="/"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
              location.pathname === '/' ? 'bg-gray-100 font-medium' : 'text-gray-700'
            }`}
          >
            <Home className="h-5 w-5" />
            <span>Home</span>
          </Link>

          {isAuthenticated && (
            <>
              <Link 
                to="/bookmarks"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
                  location.pathname === '/bookmarks' ? 'bg-gray-100 font-medium' : 'text-gray-700'
                }`}
              >
                <BookOpen className="h-5 w-5" />
                <span>Library</span>
              </Link>

              <Link 
                to="/profile"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
                  location.pathname === '/profile' ? 'bg-gray-100 font-medium' : 'text-gray-700'
                }`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Profile</span>
              </Link>

              <Link 
                to="/dashboard"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
                  location.pathname === '/dashboard' ? 'bg-gray-100 font-medium' : 'text-gray-700'
                }`}
              >
                <BarChart3 className="h-5 w-5" />
                <span>Stories</span>
              </Link>

              <Link 
                to="/settings"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
                  location.pathname === '/settings' ? 'bg-gray-100 font-medium' : 'text-gray-700'
                }`}
              >
                <BarChart3 className="h-5 w-5" />
                <span>Stats</span>
              </Link>

              {user?.role === 'ADMIN' && (
                <Link 
                  to="/admin"
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
                    location.pathname.startsWith('/admin') ? 'bg-purple-100 font-medium text-purple-700' : 'text-purple-600'
                  }`}
                >
                  <Shield className="h-5 w-5" />
                  <span>Admin</span>
                </Link>
              )}
            </>
          )}

          <div className="pt-4 border-t mt-4">
            <Link 
              to="/explore"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
                location.pathname === '/explore' ? 'bg-gray-100 font-medium' : 'text-gray-700'
              }`}
            >
              <Compass className="h-5 w-5" />
              <span>Explore topics</span>
            </Link>
          </div>
        </nav>
      </aside>
    </>
  );
}
