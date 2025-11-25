import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/context/SidebarContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import ScrollToTop from '@/components/ScrollToTop';
import Layout from './components/Layout';
import Home from './pages/Home';
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

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPosts from './pages/admin/AdminPosts';

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
              <Route path="about" element={<AboutPage />} />
              <Route path="explore" element={<ExplorePage />} />

              {/* Protected routes */}
              <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="write" element={<ProtectedRoute><WritePage /></ProtectedRoute>} />
              <Route path="edit/:id" element={<ProtectedRoute><EditPostPage /></ProtectedRoute>} />
              <Route path="dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="bookmarks" element={<ProtectedRoute><BookmarksPage /></ProtectedRoute>} />
              <Route path="notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

              {/* Admin routes */}
              <Route path="admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
              <Route path="admin/posts" element={<ProtectedRoute><AdminPosts /></ProtectedRoute>} />

              {/* Public post and author pages */}
              <Route path="post/:slug" element={<PostDetailPage />} />
              <Route path="author/:username" element={<AuthorPage />} />
              <Route path="tag/:slug" element={<TagPage />} />
              <Route path="category/:slug" element={<CategoryPage />} />
              <Route path="trending" element={<TrendingPage />} />
              <Route path="feed" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />

              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </SidebarProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
