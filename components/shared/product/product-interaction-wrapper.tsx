'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  useProductView,
  // useAddToCart as useAddToCartInteraction,
} from '@/hooks/use-user-interactions';

interface ProductInteractionWrapperProps {
  productId: string;
  children: React.ReactNode;
}

export default function ProductInteractionWrapper({
  productId,
  children,
}: ProductInteractionWrapperProps) {
  const { data: session } = useSession();
  const { trackView } = useProductView();
  // const { trackAddToCart } = useAddToCartInteraction();

  // Track product view when component mounts
  useEffect(() => {
    if (session?.user?.id) {
      trackView(session.user.id, productId, "hey there");
    }
  }, [session?.user?.id, productId, trackView]);

  // Create a context or pass down the interaction handlers
  // const handleAddToCartInteraction = () => {
  //   if (session?.user?.id) {
  //     trackAddToCart(session.user.id, productId, 1);
  //   }
  // };

  console.log("product interaction wrap")

  // Clone children and pass down the interaction handler
  const childrenWithProps = React.Children.map(children, (child) => {
    // if (
    //   React.isValidElement(child) &&
    //   // Only add the prop if the child is AddToCart
    //   child.type === AddToCart
    // ) {
    //   // Type assertion to allow passing the prop
    //   return React.cloneElement(child as React.ReactElement<any>, {
    //     onAddToCart: handleAddToCartInteraction,
    //   });
    // }
    return child;
  });

  return <>{childrenWithProps}</>;
}
