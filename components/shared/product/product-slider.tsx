'use client';

import * as React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import ProductCard from './product-card';
import { IProduct } from '@/lib/db/models/product.model';

export default function ProductSlider<T extends IProduct>({
  title,
  products,
  hideDetails = false,
  onProductClick,
}: {
  title?: string;
  products: T[];
  hideDetails?: boolean;
  onProductClick?: (product: T) => void;
}) {
  return (
    <div className="w-full bg-background">
      <h2 className="h2-bold mb-5">{title}</h2>
      <Carousel
        opts={{
          align: 'start',
        }}
        className="w-full"
      >
        <CarouselContent>
          {products.map((product) => (
            <CarouselItem
              key={product.slug}
              className={
                hideDetails
                  ? 'md:basis-1/4 lg:basis-1/6'
                  : 'md:basis-1/3 lg:basis-1/5'
              }
            >
              <ProductCard
                hideDetails={hideDetails}
                hideAddToCart
                hideBorder
                product={product}
                onProductClick={
                  onProductClick ? (p) => onProductClick(p as T) : undefined
                }
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0" />
        <CarouselNext className="right-0" />
      </Carousel>
    </div>
  );
}
