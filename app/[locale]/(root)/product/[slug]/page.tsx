import { auth } from '@/auth';
import AddToCart from '@/components/shared/product/add-to-cart';
import { Card, CardContent } from '@/components/ui/card';
import {
  getProductBySlug,
  getRelatedProductsByCategory,
} from '@/lib/actions/product.actions';
// import ProductInteractionWrapper from '@/components/shared/product/product-interaction-wrapper';

import ReviewList from './review-list';
import { generateId, round2 } from '@/lib/utils';
import SelectVariant from '@/components/shared/product/select-variant';
import ProductPrice from '@/components/shared/product/product-price';
import ProductGallery from '@/components/shared/product/product-gallery';
import AddToBrowsingHistory from '@/components/shared/product/add-to-browsing-history';
import { Separator } from '@/components/ui/separator';
import BrowsingHistoryList from '@/components/shared/browsing-history-list';
import RatingSummary from '@/components/shared/product/rating-summary';
import ProductSlider from '@/components/shared/product/product-slider';
import { getTranslations } from 'next-intl/server';
import { 
  // getProductRecommendations,
   getRecommendationsWithAuth } from '@/lib/actions/recommendation.actions';

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}) {
  const t = await getTranslations();
  const params = await props.params;
  const product = await getProductBySlug(params.slug);
  if (!product) {
    return { title: t('Product.Product not found') };
  }
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductDetails(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page: string; color: string; size: string }>;
}) {
  const searchParams = await props.searchParams;

  const { page, color, size } = searchParams;

  const params = await props.params;

  const { slug } = params;

  const session = await auth();

  const product = await getProductBySlug(slug);

  const relatedProducts = await getRelatedProductsByCategory({
    category: product.category,
    productId: product._id,
    page: Number(page || '1'),
  });

  const t = await getTranslations();

  const recomProducts = await getRecommendationsWithAuth('newUser', product._id);

  // console.log('⏳🔴', recomProducts);

  return (
    // <ProductInteractionWrapper productId={product._id}>
    <div>
      <AddToBrowsingHistory id={product._id} category={product.category} />
      <section>
        <div className="grid grid-cols-1 md:grid-cols-5  ">
          <div className="col-span-2">
            <ProductGallery images={product.images} />
          </div>

          <div className="flex w-full flex-col gap-2 md:p-5 col-span-2">
            <div className="flex flex-col gap-3">
              <p className="p-medium-16 rounded-full bg-grey-500/10   text-grey-500">
                {t('Product.Brand')} {product.brand} {product.category}
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
              <div>
                <SelectVariant
                  product={product}
                  size={size || product.sizes[0]}
                  color={color || product.colors[0]}
                />
              </div>
              <Separator className="my-2" />
              <div className="flex flex-col gap-2">
                <p className="p-bold-20 text-grey-600">
                  {t('Product.Description')}:
                </p>
                <p className="p-medium-16 lg:p-regular-18">
                  {product.description}
                </p>
              </div>
            </div>
            <div>
              <SelectVariant
                product={product}
                size={size || product.sizes[0]}
                color={color || product.colors[0]}
              />
            </div>
            <Separator className="my-2" />
            <div className="flex flex-col gap-2">
              <p className="p-bold-20 text-grey-600">
                {t('Product.Description')}:
              </p>
              <p className="p-medium-16 lg:p-regular-18">
                {product.description}
              </p>
            </div>
          </div>
          <div>
            <Card>
              <CardContent className="p-4 flex flex-col  gap-4">
                <ProductPrice price={product.price} />

                {product.countInStock > 0 && product.countInStock <= 3 && (
                  <div className="text-destructive font-bold">
                    {t('Product.Only X left in stock - order soon', {
                      count: product.countInStock,
                    })}
                  </div>
                )}
                {product.countInStock !== 0 ? (
                  <div className="text-green-700 text-xl">
                    {t('Product.In Stock')}
                  </div>
                ) : (
                  <div className="text-destructive text-xl">
                    {t('Product.Out of Stock')}
                  </div>
                )}

                {product.countInStock !== 0 && (
                  <div className="flex justify-center items-center">
                    <AddToCart
                      item={{
                        clientId: generateId(),
                        product: product._id,
                        countInStock: product.countInStock,
                        name: product.name,
                        slug: product.slug,
                        category: product.category,
                        price: round2(product.price),
                        quantity: 1,
                        image: product.images[0],
                        size: size || product.sizes[0],
                        color: color || product.colors[0],
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <section className="mt-10">
        <h2 className="h2-bold mb-2" id="reviews">
          {t('Product.Customer Reviews')}
        </h2>
        <ReviewList product={product} userId={session?.user.id} />
      </section>
      <section>
        {recomProducts.success ? (
          <ProductSlider
            title={t('Product.Recommended for you')}
            products={recomProducts.data || []}
          />
        ) : (
          <div className="w-full text-center py-8">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-semibold mb-2">
                {t('Product.Recommended for you')}
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
      </section>
      <section className="mt-10">
        <ProductSlider
          products={relatedProducts.data}
          title={t('Product.Best Sellers in', { name: product.category })}
        />
      </section>
      <section>
        <BrowsingHistoryList className="mt-10" />
      </section>
    </div>
    // </ProductInteractionWrapper>
  );
}
