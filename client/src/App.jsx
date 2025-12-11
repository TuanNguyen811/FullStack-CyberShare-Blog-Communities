import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import ScrollToTop from '@/components/ScrollToTop';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import OAuth2RedirectPage from './pages/OAuth2RedirectPage';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ExplorePage from './pages/ExplorePage';
import ProfilePage from './pages/ProfilePage';
import WritePage from './pages/WritePage';
import EditPostPage from './pages/EditPostPage';
import PostDetailPage from './pages/PostDetailPage';
import DashboardPage from './pages/DashboardPage';
import AuthorPage from './pages/AuthorPage';
import BookmarksPage from './pages/BookmarksPage';
import NotificationsPage from './pages/NotificationsPage';
import NotFoundPage from './pages/NotFoundPage';
import TagPage from './pages/TagPage';
import CategoryPage from './pages/CategoryPage';
import TrendingPage from './pages/TrendingPage';
import FeedPage from './pages/FeedPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Admin pages
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminPostsPage from './pages/admin/AdminPostsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminTagsPage from './pages/admin/AdminTagsPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SidebarProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="oauth2/redirect" element={<OAuth2RedirectPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
              <Route path="reset-password" element={<ResetPasswordPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="explore" element={<ExplorePage />} />

              {/* Protected routes */}
              <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="write" element={<ProtectedRoute><WritePage /></ProtectedRoute>} />
              <Route path="edit/:id" element={<ProtectedRoute><EditPostPage /></ProtectedRoute>} />
              <Route path="dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="bookmarks" element={<ProtectedRoute><BookmarksPage /></ProtectedRoute>} />
              <Route path="notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
              <Route path="change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />

              {/* Public post and author pages */}
              <Route path="post/:slug" element={<PostDetailPage />} />
              <Route path="author/:username" element={<AuthorPage />} />
              <Route path="tag/:slug" element={<TagPage />} />
              <Route path="category/:slug" element={<CategoryPage />} />
              <Route path="trending" element={<TrendingPage />} />
              <Route path="feed" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />

              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Admin Routes - Separate Layout */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="posts" element={<AdminPostsPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="tags" element={<AdminTagsPage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>
          </Routes>
        </SidebarProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
