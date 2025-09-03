import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { user, profile, isLoading, error } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-surface">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state if auth failed
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-surface p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <h2 className="text-lg font-semibold text-destructive">Authentication Error</h2>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
          </div>
          <button
            onClick={() => window.location.href = '/auth'}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login with return path
  if (!user) {
    const returnPath = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth?next=${returnPath}`} replace />;
  }

  // If authenticated but no profile/org, redirect to onboarding
  if (!profile || !profile.organization_id) {
    return <Navigate to="/onboarding" replace />;
  }

  // User is fully authenticated and has profile/org
  return <>{children}</>;
}

export default AuthGuard;