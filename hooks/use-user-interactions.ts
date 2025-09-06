import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { type UserInteraction, type PurchaseInteraction } from '@/types';


interface UseUserInteractionsReturn {
  trackInteraction: (data: UserInteraction) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const useUserInteractions = (): UseUserInteractionsReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trackInteraction = async (data: UserInteraction): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/userInteractions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {

        throw new Error('Failed to track interaction');
      }

      // Optional: You can handle successful tracking here
      // For example, update local state or trigger other actions
    } catch (err) {
      let errorMessage = 'An unknown error occurred';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);

      // Show toast notification for user feedback
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });

      console.error('User interaction tracking failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    trackInteraction,
    isLoading,
    error,
  };
};



interface UsePurchaseTrackerReturn {
  trackPurchases: (data: PurchaseInteraction) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const usePurchaseInteractions = (): UsePurchaseTrackerReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trackPurchases = async (data: PurchaseInteraction): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/userInteractions/purchaseTracker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to track purchases');
      }

      // Optional: handle success
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to track purchases';
      setError(errorMessage);

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });

      console.error('Purchase tracking failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    trackPurchases,
    isLoading,
    error,
  };
};



// Convenience hooks for specific interaction types
export const useProductView = () => {
  const { trackInteraction, isLoading, error } = useUserInteractions();

  const trackView = (userId: string, productId: string, category: string) => {
    return trackInteraction({
      userId,
      productId,
      interactionType: 'view',
      category,
    });
  };

  return { trackView, isLoading, error };
};

export const useAddToCart = () => {
  const { trackInteraction, isLoading, error } = useUserInteractions();

  const trackAddToCart = (
    userId: string,
    productId: string,
    value: number = 1,
    category :string,
    sessionId?: string
  ) => {
    return trackInteraction({
      userId,
      productId,
      interactionType: 'add_to_cart',
      value,
      category,
      sessionId,
    });
  };

  return { trackAddToCart, isLoading, error };
};

export const useProductPurchase = () => {
  const { trackPurchases, isLoading, error } = usePurchaseInteractions();

  const trackPurchase = (
    userId: string|undefined,
    products: PurchaseInteraction['products']
  ) => {
    if (!userId) {
      throw new Error('userId is required for tracking purchases');
    }
    return trackPurchases({
      userId,
      products,
    });
  };

  return { trackPurchase, isLoading, error };
};

export const useProductReview = () => {
  const { trackInteraction, isLoading, error } = useUserInteractions();

  const trackReview = (
    userId: string,
    productId: string,
    reviewStars: number,
    sessionId?: string
  ) => {
    return trackInteraction({
      userId,
      productId,
      interactionType: 'purchase',
      reviewStars,
      sessionId,
    });
  };

  return { trackReview, isLoading, error };
};

export const useSearchInteraction = () => {
  const { trackInteraction, isLoading, error } = useUserInteractions();

  const trackSearch = (
    userId: string,
    productId: string,
    searchQuery: string,
    sessionId?: string
  ) => {
    return trackInteraction({
      userId,
      productId,
      interactionType: 'view', // Using view for search interactions
      searchQuery,
      sessionId,
    });
  };

  return { trackSearch, isLoading, error };
};


