'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { useSession } from 'next-auth/react';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { IProduct } from '@/lib/db/models/product.model';
import {
  useProductView,
  // useAddToCart as useAddToCartInteraction,
} from '@/hooks/use-user-interactions';

import Rating from './rating';
import { formatNumber, generateId, round2 } from '@/lib/utils';
import ProductPrice from './product-price';
import ImageHover from './image-hover';
import AddToCart from './add-to-cart';

const ProductCard = ({
  product,
  hideBorder = false,
  hideDetails = false,
  hideAddToCart = false,
  onProductClick,
}: {
  product: IProduct;
  hideDetails?: boolean;
  hideBorder?: boolean;
  hideAddToCart?: boolean;
  onProductClick?: (product: IProduct) => void;
}) => {
  const { data: session } = useSession();
  const { trackView } = useProductView();
  // const { trackAddToCart } = useAddToCartInteraction();

  const handleProductView = () => {
    if (session?.user?.id) {
      trackView(session.user.id, product._id, product.category);
    }
  };

  // const handleAddToCartInteraction = () => {
  //   if (session?.user?.id) {
  //     trackAddToCart(session.user.id, product._id, 1);
  //   }
  // };

  // console.log("product-card")

  const handleNavigate = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    handleProductView();
    if (onProductClick) {
      e.preventDefault();
      onProductClick(product);
    }
  };

  const ProductImage = () => (
    <Link href={`/product/${product.slug}`} onClick={handleNavigate}>
      <div className="relative h-52">
        {product.images.length > 1 ? (
          <ImageHover
            src={product.images[0]}
            hoverSrc={product.images[1]}
            alt={product.name}
          />
        ) : (
          <div className="relative h-52">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="80vw"
              className="object-contain"
            />
          </div>
        )}
      </div>
    </Link>
  );
  const ProductDetails = () => (
    <div className="flex-1 space-y-2">
      <p className="font-bold">{product.brand}</p>
      <Link
        href={`/product/${product.slug}`}
        className="overflow-hidden text-ellipsis"
        onClick={handleNavigate}
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {product.name}
      </Link>
      <div className="flex gap-2 justify-center">
        <Rating rating={product.avgRating} />
        <span>({formatNumber(product.numReviews)})</span>
      </div>

      <ProductPrice
        isDeal={product.tags.includes('todays-deal')}
        price={product.price}
        listPrice={product.listPrice}
        forListing
      />
    </div>
  );
  const AddButton = () => (
    <div className="w-full text-center">
      <AddToCart
        minimal
        item={{
          clientId: generateId(),
          product: product._id,
          size: product.sizes[0],
          color: product.colors[0],
          countInStock: product.countInStock,
          name: product.name,
          slug: product.slug,
          category: product.category,
          price: round2(product.price),
          quantity: 1,
          image: product.images[0],
        }}
        // onAddToCart={handleAddToCartInteraction}
      />
    </div>
  );

  return hideBorder ? (
    <div className="flex flex-col">
      <ProductImage />
      {!hideDetails && (
        <>
          <div className="p-3 flex-1 text-center">
            <ProductDetails />
          </div>
          {!hideAddToCart && <AddButton />}
        </>
      )}
    </div>
  ) : (
    <Card className="flex flex-col  ">
      <CardHeader className="p-3">
        <ProductImage />
      </CardHeader>
      {!hideDetails && (
        <>
          <CardContent className="p-3 flex-1  text-center">
            <ProductDetails />
          </CardContent>
          <CardFooter className="p-3">
            {!hideAddToCart && <AddButton />}
          </CardFooter>
        </>
      )}
    </Card>
  );
};

export default ProductCard;
