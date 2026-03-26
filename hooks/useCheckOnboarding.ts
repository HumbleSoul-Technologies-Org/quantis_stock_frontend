import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

/**
 * Hook to check if user has completed business setup
 * Redirects to onboarding if not
 */
export function useCheckOnboarding() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // If not logged in, let auth handle it
      if (!user) {
        return;
      }

      // If logged in but no business setup, redirect to onboarding
      if (!user.businessSetup) {
        router.push('/onboarding');
      }
    }
  }, [user, isLoading, router]);

  return {
    needsOnboarding: user && !user.businessSetup,
    isReady: user && user.businessSetup && !isLoading,
  };
}
