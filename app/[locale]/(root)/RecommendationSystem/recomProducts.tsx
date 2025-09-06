'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  // getUserRecommendations,
  // getProductRecommendations,
  getRecommendationsWithAuth,
  type RecommendationProduct,
} from '@/lib/actions/recommendation.actions';

import { Card, CardContent } from '@/components/ui/card';
import ProductSlider from '@/components/shared/product/product-slider';
import { useTranslations } from 'next-intl';
import ProductGallery from '@/components/shared/product/product-gallery';
import RatingSummary from '@/components/shared/product/rating-summary';
import { Separator } from '@/components/ui/separator';
import ProductPrice from '@/components/shared/product/product-price';
import SelectVariant from '@/components/shared/product/select-variant';
import Spinner from '@/components/shared/header/spinner';

interface RecomProductsProps {
  userId?: string;
  ProductId?: string;
}

type RecommendationResult = {
  success: boolean;
  data?: RecommendationProduct[];
  message?: string;
};

function ProductCard({ product }: { product: RecommendationProduct }) {
  const t = useTranslations('Product');

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 animate-in slide-in-from-top-2 duration-500 ease-out">
      <div className="col-span-2">
        <ProductGallery images={product.images} />
      </div>

      <div className="flex w-full flex-col gap-2 md:p-5 col-span-2">
        <div className="flex flex-col gap-3">
          <p className="p-medium-16 rounded-full bg-grey-500/10   text-grey-500">
            {t('Brand')} {product.brand} {product.category}
          </p>
          <h1 className="font-bold text-lg lg:text-xl">{product.name}</h1>

          <RatingSummary
            avgRating={product.avgRating}
            numReviews={product.numReviews}
            asPopover
            ratingDistribution={product.ratingDistribution}
          />
          <Separator />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex gap-3">
              <ProductPrice
                price={product.price}
                listPrice={product.listPrice}
                isDeal={product.tags.includes('todays-deal')}
                forListing={false}
              />
            </div>
          </div>
        </div>
        <div>
          <SelectVariant
            product={product}
            size={product.sizes[0]}
            color={product.colors[0]}
          />
        </div>
        <Separator className="my-2" />
        <div className="flex flex-col gap-2">
          <p className="p-bold-20 text-grey-600">{t('Description')}:</p>
          <p className="p-medium-16 lg:p-regular-18">{product.description}</p>
        </div>
      </div>
    </div>
  );
}

function RecomProducts({ userId = 'newUser', ProductId }: RecomProductsProps) {
  const t = useTranslations('Home');
  const [recomProducts, setRecomProducts] = useState<RecommendationResult>({
    success: false,
    data: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] =
    useState<RecommendationProduct | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const selectedProductId = selectedProduct?._id || ProductId;

  const fetchRecommendations = useCallback(
    async (uid: string, pid?: string) => {
      try {
        setLoading(true);
        const result = await getRecommendationsWithAuth(uid, pid);
        setRecomProducts(result);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        setRecomProducts({ success: false, data: [] });
      } finally {
        setLoading(false);
      }
    },
    []
  );

  console.log("🔻🎉↔",recomProducts);

  useEffect(() => {
    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set a new timer to debounce the API call
    const timer = setTimeout(() => {
      fetchRecommendations(userId, selectedProductId);
    }, 300); // 300ms debounce delay

    debounceTimerRef.current = timer;

    // Cleanup function to clear timer on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [userId, selectedProductId, fetchRecommendations]);

  const handleProductSelect = useCallback((product: RecommendationProduct) => {
    setSelectedProduct(product);
  }, []);

  const card = loading ? (
    <Card className="w-full rounded-none">
      <CardContent className="h-36">
        <div className="h-full flex items-center justify-center">
          <Spinner />
        </div>
      </CardContent>
    </Card>
  ) : (
    <Card className="w-full rounded-none">
      <CardContent className="p-4 items-center gap-3">
        {recomProducts.success ? (
          <ProductSlider
            title={t('Curated For You')}
            products={recomProducts.data || []}
            onProductClick={handleProductSelect}
          />
        ) : (
          <div className="w-full text-center py-8">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-semibold mb-2">
                {t('Curated For You')}
              </h3>
              <div className="bg-muted/50 rounded-lg p-6 border border-dashed">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Products displayed here are powered by our ML
                      recommendation API
                    </p>
                    <p className="text-xs text-muted-foreground">
                      The API is deployed on a free tier, which may cause slow
                      loading and cold starts. Please wait a couple of minutes
                      for the recommendation system to warm up.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div>
      {selectedProduct && (
        <div className="mb-6 animate-in fade-in-0 slide-in-from-top-4 duration-700 ease-out">
          <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-6 transform transition-all duration-300 hover:shadow-xl">
            <ProductCard product={selectedProduct} />
          </div>
        </div>
      )}
      <div className="animate-in fade-in-0 duration-500 ease-out">{card}</div>
    </div>
  );
}

export default RecomProducts;
