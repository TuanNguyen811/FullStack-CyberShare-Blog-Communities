import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function OAuth2RedirectPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setTokensFromOAuth } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');
    const error = searchParams.get('error');

    if (error) {
      navigate('/login?error=' + encodeURIComponent(error));
      return;
    }

    if (token && refreshToken) {
      setTokensFromOAuth(token, refreshToken);
      navigate('/');
    } else {
      navigate('/login?error=OAuth2 authentication failed');
    }
  }, [searchParams, navigate, setTokensFromOAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}
