'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useSearchInteraction } from '@/hooks/use-user-interactions';

interface SearchInteractionTrackerProps {
  searchQuery: string;
  products: Array<{ _id: string }>;
  children: React.ReactNode;
}

export default function SearchInteractionTracker({
  searchQuery,
  products,
  children,
}: SearchInteractionTrackerProps) {
  const { data: session } = useSession();
  const { trackSearch } = useSearchInteraction();

  // Track search interaction when component mounts
  useEffect(() => {
    if (
      session?.user?.id &&
      searchQuery &&
      searchQuery !== 'all' &&
      products.length > 0
    ) {
      // Track interaction for the first product in search results
      trackSearch(session.user.id, products[0]._id, searchQuery);
    }
  }, [session?.user?.id, searchQuery, products, trackSearch]);

  return <>{children}</>;
}
