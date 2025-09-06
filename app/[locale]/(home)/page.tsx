import BrowsingHistoryList from '@/components/shared/browsing-history-list';
import { HomeCard } from '@/components/shared/home/home-card';
import { HomeCarousel } from '@/components/shared/home/home-carousel';
import ProductSlider from '@/components/shared/product/product-slider';
import { Card, CardContent } from '@/components/ui/card';

import {
  getProductsForCard,
  getProductsByTag,
  getAllCategories,
} from '@/lib/actions/product.actions';
import {
  getRecommendationsWithAuth,
  // getUserRecommendations,
} from '@/lib/actions/recommendation.actions';
import { getSetting } from '@/lib/actions/setting.actions';
import { toSlug } from '@/lib/utils';
import { getTranslations } from 'next-intl/server';

export default async function HomePage() {
  const t = await getTranslations('Home');
  const { carousels } = await getSetting();
  const todaysDeals = await getProductsByTag({ tag: 'todays-deal' });
  const bestSellingProducts = await getProductsByTag({ tag: 'best-seller' });
  const recomProducts = await getRecommendationsWithAuth('newUser');

  const categories = (await getAllCategories()).slice(0, 4);
  const newArrivals = await getProductsForCard({
    tag: 'new-arrival',
  });
  const featureds = await getProductsForCard({
    tag: 'featured',
  });
  const bestSellers = await getProductsForCard({
    tag: 'best-seller',
  });
  const cards = [
    {
      title: t('Categories to explore'),
      link: {
        text: t('See More'),
        href: '/search',
      },
      items: categories.map((category) => ({
        name: category,
        image: `/images/${toSlug(category)}.jpg`,
        href: `/search?category=${category}`,
      })),
    },
    {
      title: t('Explore New Arrivals'),
      items: newArrivals,
      link: {
        text: t('View All'),
        href: '/search?tag=new-arrival',
      },
    },
    {
      title: t('Discover Best Sellers'),
      items: bestSellers,
      link: {
        text: t('View All'),
        href: '/search?tag=new-arrival',
      },
    },
    {
      title: t('Featured Products'),
      items: featureds,
      link: {
        text: t('Shop Now'),
        href: '/search?tag=new-arrival',
      },
    },
  ];

  // console.log("🔻🎉↔",recomProducts);

  return (
    <>
      <HomeCarousel items={carousels} />
      <div className="md:p-4 md:space-y-4 bg-border">
        <HomeCard cards={cards} />
        <Card className="w-full rounded-none">
          <CardContent className="p-4 items-center gap-3">
            {recomProducts.data && recomProducts.data.length > 0 ? (
              <ProductSlider
                title={t('Curated For You')}
                products={recomProducts.data}
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
                          The API is deployed on a free tier, which may cause
                          slow loading and cold starts. Please wait a couple of
                          minutes for the recommendation system to warm up.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="w-full rounded-none">
          <CardContent className="p-4 items-center gap-3">
            <ProductSlider title={t("Today's Deals")} products={todaysDeals} />
          </CardContent>
        </Card>
        <Card className="w-full rounded-none">
          <CardContent className="p-4 items-center gap-3">
            <ProductSlider
              title={t('Best Selling Products')}
              products={bestSellingProducts}
              hideDetails
            />
          </CardContent>
        </Card>
      </div>
      <div className="p-4 bg-background">
        <BrowsingHistoryList />
      </div>
    </>
  );
}
