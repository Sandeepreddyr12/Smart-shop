/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import useCartStore from '@/hooks/use-cart-store';
import { useToast } from '@/hooks/use-toast';
import { OrderItem } from '@/types';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSession } from 'next-auth/react';


export default function AddToCart({
  item,
  minimal = false,
  onAddToCart,
}: {
  item: OrderItem;
  minimal?: boolean;
  onAddToCart?: () => void;
}) {

  console.log('onthe add to cart') ;
  const router = useRouter();
  const { toast } = useToast();
  const { data } = useSession();

  const { addItem} = useCartStore();

  //PROMPT: add quantity state
  const [quantity, setQuantity] = useState(1);

  const t = useTranslations();

  const handleAddToCart = async (qty: number) => {
    try {
      await addItem(data?.user?.id, item, qty);
      onAddToCart?.(); // Call the callback if provided
      toast({
        description: t('Product.Added to Cart'),
        action: (
          <Button
            onClick={() => {
              router.push('/cart');
            }}
          >
            {t('Product.Go to Cart')}
          </Button>
        ),
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        description: error.message,
      });
    }
  };

  return minimal ? (
    <Button className="rounded-full w-auto" onClick={() => handleAddToCart(1)}>
      {t('Product.Add to Cart')}
    </Button>
  ) : (
    <div className="w-full space-y-2">
      <Select
        value={quantity.toString()}
        onValueChange={(i) => setQuantity(Number(i))}
      >
        <SelectTrigger className="">
          <SelectValue>
            {t('Product.Quantity')}: {quantity}
          </SelectValue>
        </SelectTrigger>
        <SelectContent position="popper">
          {Array.from({ length: item.countInStock }).map((_, i) => (
            <SelectItem key={i + 1} value={`${i + 1}`}>
              {i + 1}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        className="rounded-full w-full"
        type="button"
        onClick={async () => {
          try {
            const itemId = await addItem(data?.user?.id, item, quantity);
            onAddToCart?.(); // Call the callback if provided
            router.push(`/cart/${itemId}`);
          } catch (error: any) {
            toast({
              variant: 'destructive',
              description: error.message,
            });
          }
        }}
      >
        {t('Product.Add to Cart')}
      </Button>
      <Button
        variant="secondary"
        onClick={() => {
          try {
            addItem(data?.user?.id, item, quantity);
            onAddToCart?.(); // Call the callback if provided
            router.push(`/checkout`);
          } catch (error: any) {
            toast({
              variant: 'destructive',
              description: error.message,
            });
          }
        }}
        className="w-full rounded-full "
      >
        {t('Product.Buy Now')}
      </Button>
    </div>
  );
}
