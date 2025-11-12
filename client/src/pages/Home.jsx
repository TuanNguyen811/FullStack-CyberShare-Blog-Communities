import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to CyberShare
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          A modern blogging platform for sharing your ideas
        </p>

        {isAuthenticated ? (
          <div className="space-y-4">
            <p className="text-lg text-gray-700">
              Hello, <span className="font-semibold">{user?.displayName || user?.username}</span>!
            </p>
            <div className="flex justify-center space-x-4">
              <Link to="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
              <Link to="/editor">
                <Button variant="outline">Write a Post</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex justify-center space-x-4">
            <Link to="/register">
              <Button>Get Started</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
          </div>
        )}

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Share Your Stories</h3>
            <p className="text-gray-600">
              Create and publish engaging content with our easy-to-use editor
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Connect with Others</h3>
            <p className="text-gray-600">
              Follow authors, like posts, and engage with the community
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Discover Content</h3>
            <p className="text-gray-600">
              Explore trending posts and find content that interests you
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
