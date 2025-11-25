import { useFollow } from '@/hooks/useFollow';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FollowButton({ username, variant = 'default', size = 'default', showIcon = true, className = '' }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { 
    isFollowing, 
    loading, 
    initialLoading, 
    isOwnProfile, 
    toggleFollow 
  } = useFollow(username);

  // Don't show button for own profile
  if (isOwnProfile) {
    return null;
  }

  const handleClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    toggleFollow();
  };

  if (initialLoading) {
    return (
      <Button variant={variant} size={size} disabled className={className}>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  return (
    <Button
      variant={isFollowing ? 'outline' : variant}
      size={size}
      onClick={handleClick}
      disabled={loading}
      className={`gap-2 ${isFollowing ? 'hover:bg-red-50 hover:text-red-600 hover:border-red-200' : ''} ${className}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          {showIcon && (isFollowing ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />)}
          {isFollowing ? 'Following' : 'Follow'}
        </>
      )}
    </Button>
  );
}
