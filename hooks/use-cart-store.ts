import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { Cart, OrderItem, ShippingAddress, type UserInteraction } from '@/types';
import { calcDeliveryDateAndPrice } from '@/lib/actions/order.actions';


async function trackCartInteraction(
  userId: string | undefined,
  productId: string,
  interactionType: "view" | "add_to_cart" | "purchase",
  value: number = 0,
  category? : string,
  sessionId?: string
): Promise<UserInteraction> {


  try {
    const res = await fetch('/api/userInteractions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        productId,
        interactionType,
        value,
        category,
        sessionId,
      }),
    });
    if (!res.ok) {
      throw new Error('Failed to track cart interaction');
    }
    return await res.json();
  } catch (err) {
    console.error('Failed to track cart interaction', err);
    throw err;
  }
}
 

const initialState: Cart = {
  items: [],
  itemsPrice: 0,
  taxPrice: undefined,
  shippingPrice: undefined,
  totalPrice: 0,
  paymentMethod: undefined,
  shippingAddress: undefined,
  deliveryDateIndex: undefined,
};

interface CartState {
  cart: Cart;
  addItem: (
    userId: string | undefined,
    item: OrderItem,
    quantity: number
  ) => Promise<string>;
  updateItem: (
    userId: string | undefined,
    item: OrderItem,
    quantity: number
  ) => Promise<void>;
  removeItem: (userId: string | undefined, item: OrderItem) => void;
  clearCart: (userId: string | undefined) => void;
  setShippingAddress: (shippingAddress: ShippingAddress) => Promise<void>;
  setPaymentMethod: (paymentMethod: string) => void;
  setDeliveryDateIndex: (index: number) => Promise<void>;
}

const useCartStore = create(
  persist<CartState>(
    (set, get) => ({
      cart: initialState,

      addItem: async (userId: string|undefined, item: OrderItem, quantity: number) => {
        const { items, shippingAddress } = get().cart;
        const existItem = items.find(
          (x) =>
            x.product === item.product &&
            x.color === item.color &&
            x.size === item.size
        );

        if (existItem) {
          if (existItem.countInStock < quantity + existItem.quantity) {
            throw new Error('Not enough items in stock');
          }
        } else {
          if (item.countInStock < item.quantity) {
            throw new Error('Not enough items in stock');
          }
        }

        const updatedCartItems = existItem
          ? items.map((x) =>
              x.product === item.product &&
              x.color === item.color &&
              x.size === item.size
                ? { ...existItem, quantity: existItem.quantity + quantity }
                : x
            )
          : [...items, { ...item, quantity }];

        set({
          cart: {
            ...get().cart,
            items: updatedCartItems,
            ...(await calcDeliveryDateAndPrice({
              items: updatedCartItems,
              shippingAddress,
            })),
          },
        });
        const foundItem = updatedCartItems.find(
          (x) =>
            x.product === item.product &&
            x.color === item.color &&
            x.size === item.size
        );
        if (!foundItem) {
          throw new Error('Item not found in cart');
        }
        // Track add to cart interaction
        // const sessionId = ''; // TODO: Replace with actual session id
        await trackCartInteraction(
          userId,
          item.product,
          'add_to_cart',
          foundItem.quantity,
          item.category,
          // sessionId
        );
        return foundItem.clientId;
      },
      updateItem: async (userId: string|undefined, item: OrderItem, quantity: number) => {
        const { items, shippingAddress } = get().cart;
        const exist = items.find(
          (x) =>
            x.product === item.product &&
            x.color === item.color &&
            x.size === item.size
        );
        if (!exist) return;
        const updatedCartItems = items.map((x) =>
          x.product === item.product &&
          x.color === item.color &&
          x.size === item.size
            ? { ...exist, quantity: quantity }
            : x
        );
        set({
          cart: {
            ...get().cart,
            items: updatedCartItems,
            ...(await calcDeliveryDateAndPrice({
              items: updatedCartItems,
              shippingAddress,
            })),
          },
        });
        // Track update cart interaction


        // // const sessionId = ''; // TODO: Replace with actual session id
        await trackCartInteraction(
          userId,
          item.product,
          'add_to_cart',
          quantity,
          item.category,
          // sessionId
        );
      },
      removeItem: async (userId: string|undefined, item: OrderItem) => {
        const { items, shippingAddress } = get().cart;
        const updatedCartItems = items.filter(
          (x) =>
            x.product !== item.product ||
            x.color !== item.color ||
            x.size !== item.size
        );
        set({
          cart: {
            ...get().cart,
            items: updatedCartItems,
            ...(await calcDeliveryDateAndPrice({
              items: updatedCartItems,
              shippingAddress,
            })),
          },
        });
        // Track remove from cart interaction
        await trackCartInteraction(
          userId,
          item.product,
          'view',
          0
        );
      },
      setShippingAddress: async (shippingAddress: ShippingAddress) => {
        const { items } = get().cart;
        set({
          cart: {
            ...get().cart,
            shippingAddress,
            ...(await calcDeliveryDateAndPrice({
              items,
              shippingAddress,
            })),
          },
        });
      },
      setPaymentMethod: (paymentMethod: string) => {
        set({
          cart: {
            ...get().cart,
            paymentMethod,
          },
        });
      },
      setDeliveryDateIndex: async (index: number) => {
        const { items, shippingAddress } = get().cart;

        set({
          cart: {
            ...get().cart,
            ...(await calcDeliveryDateAndPrice({
              items,
              shippingAddress,
              deliveryDateIndex: index,
            })),
          },
        });
      },
      clearCart: (userId: string|undefined) => {
        // Track removal for each item before clearing
        // const { items } = get().cart;
        // const sessionId = ''; // TODO: Replace with actual session id
        // Promise.all(
        //   items.map((item) =>
        //     trackCartInteraction(
        //       userId,
        //       item.product,
        //       'purchase',
        //       0,
        //       sessionId
        //     )
        //   )
        // ).catch((err) =>
        //   console.error('Failed to track clear cart interactions', err)
        // );
        set({
          cart: {
            ...get().cart,
            items: [],
          },
        });
      },
      init: () => set({ cart: initialState }),
    }),

    {
      name: 'cart-store',
    }
  )
);
export default useCartStore;
