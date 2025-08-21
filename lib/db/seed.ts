/* eslint-disable @typescript-eslint/no-explicit-any */
import data from '@/lib/data';
import { connectToDatabase } from '.';
import User from './models/user.model';
import Product from './models/product.model';
import Review from './models/review.model';
import { cwd } from 'process';
import { loadEnvConfig } from '@next/env';
import Order from './models/order.model';
import {
  calculateFutureDate,
  calculatePastDate,
  generateId,
  round2,
} from '../utils';
import WebPage from './models/web-page.model';
import Setting from './models/setting.model';
import {
  OrderItem,
  IOrderInput,
  ShippingAddress,
  IProductInput,
} from '@/types';
import { ProductInputSchema } from '@/lib/validator';
import products from '../fullProducts.json';
import type { IProduct } from './models/product.model';

loadEnvConfig(cwd());

const main = async () => {
  try {
    const { users, reviews, webPages, settings } = data;
    await connectToDatabase(process.env.MONGODB_URI);

    await User.deleteMany();
    const createdUser = await User.insertMany(users);

    await Setting.deleteMany();
    const createdSetting = await Setting.insertMany(settings);

    await WebPage.deleteMany();
    await WebPage.insertMany(webPages);

    await Product.deleteMany();
    // Pre-validate and ensure slug uniqueness to avoid unique index conflicts
    const seenSlugs = new Set<string>();
    const validProducts: IProductInput[] = [];
    const invalidProducts: { index: number; slug?: string; reason: string }[] =
      [];

    const toTwoDecimals = (value: unknown) => {
      const num = Number(value);
      return Number.isFinite(num) ? Number(num.toFixed(2)) : 0;
    };

    const sanitizeProduct = (p: any): IProductInput => {
      const images =
        Array.isArray(p?.images) && p.images.length > 0
          ? p.images.map(String)
          : [String(p?.image || '')].filter(Boolean);
      const tags = Array.isArray(p?.tags) ? p.tags.map(String) : [];
      const sizes = Array.isArray(p?.sizes) ? p.sizes.map(String) : [];
      const colors = Array.isArray(p?.colors) ? p.colors.map(String) : [];
      const price = toTwoDecimals(p?.price);
      const listPrice = toTwoDecimals(p?.listPrice ?? p?.price);
      let avgRating = Number(p?.avgRating ?? 0);
      avgRating = Number.isFinite(avgRating)
        ? Math.min(5, Math.max(0, avgRating))
        : 0;
      let numReviews = Number(p?.numReviews ?? 0);
      numReviews =
        Number.isFinite(numReviews) && numReviews >= 0
          ? Math.trunc(numReviews)
          : 0;
      let numSales = Number(p?.numSales ?? 0);
      numSales =
        Number.isFinite(numSales) && numSales >= 0 ? Math.trunc(numSales) : 0;
      let countInStock = Number(p?.countInStock ?? 0);
      countInStock =
        Number.isFinite(countInStock) && countInStock >= 0
          ? Math.trunc(countInStock)
          : 0;
      const baseDistribution = [1, 2, 3, 4, 5].map((r) => ({
        rating: r,
        count: 0,
      }));
      const ratingDistribution = Array.isArray(p?.ratingDistribution)
        ? p.ratingDistribution.slice(0, 5).map((rd: any, i: number) => ({
            rating: Number(rd?.rating ?? i + 1),
            count: Math.max(0, Math.trunc(Number(rd?.count ?? 0))),
          }))
        : baseDistribution;
      const isPublished = Boolean(p?.isPublished ?? false);
      return {
        name: String(p?.name ?? '').trim() || 'Unnamed Product',
        slug: String(p?.slug ?? '').trim() || 'product',
        category: String(p?.category ?? '').trim() || 'General',
        images,
        brand: String(p?.brand ?? '').trim() || 'Generic',
        description:
          String(p?.description ?? '').trim() || 'No description provided.',
        isPublished,
        price,
        listPrice,
        countInStock,
        tags,
        sizes,
        colors,
        avgRating,
        numReviews,
        ratingDistribution,
        reviews: Array.isArray(p?.reviews) ? p.reviews : [],
        numSales,
      };
    };

    const ensureUniqueSlug = (baseSlug: string) => {
      const normalized = baseSlug.trim();
      let candidate = normalized;
      let suffix = 1;
      while (seenSlugs.has(candidate)) {
        candidate = `${normalized}-${suffix++}`;
      }
      seenSlugs.add(candidate);
      return candidate;
    };

    products.forEach((p: IProductInput, idx: number) => {
      // First pass: try parse raw
      let parsed = ProductInputSchema.safeParse(p);
      if (!parsed.success) {
        // Sanitize and try again
        const fixed = sanitizeProduct(p);
        parsed = ProductInputSchema.safeParse(fixed);
      }
      if (!parsed.success) {
        invalidProducts.push({
          index: idx,
          slug: (p as any)?.slug,
          reason: parsed.error.issues.map((i) => i.message).join(', '),
        });
        return;
      }
      const prod = parsed.data;
      const uniqueSlug = ensureUniqueSlug(prod.slug);
      validProducts.push({ ...prod, slug: uniqueSlug });
    });

    const batchInsertProducts = async (
      products: IProductInput[],
      batchSize: number
    ): Promise<IProduct[]> => {
      // Create an empty array to store all the inserted products from each batch
      let allCreatedProducts: IProduct[] = [];

      // Loop through the products array in chunks of the batchSize
      for (let i = 0; i < products.length; i += batchSize) {
        // Get a chunk of the products array
        const batch = products.slice(i, i + batchSize);

        try {
          // Use insertMany on the smaller batch
          // and map the products to remove the _id as before
          const createdBatch = await Product.insertMany(
            batch.map((x) => ({ ...x, _id: undefined })),
            { ordered: false }
          );

          console.log(`Inserted a batch of ${createdBatch.length} products.`);

          // Add the created products from this batch to the main array
          allCreatedProducts = allCreatedProducts.concat(createdBatch);
        } catch (error) {
          // You can add more robust error handling here, like logging the error
          // and deciding whether to continue with the next batch or stop.
          const e: any = error;
          console.error('Error inserting a batch:', e?.message);
          if (Array.isArray(e?.insertedDocs)) {
            // When unordered insert fails partially, Mongoose attaches insertedDocs
            allCreatedProducts = allCreatedProducts.concat(e.insertedDocs);
          }
          // For example, you might want to break the loop on a critical error:
          // break;
        }
      }

      // Return all the successfully inserted products
      return allCreatedProducts;
    };

    console.log('products.length 🔴', products.length);
    console.log(
      `Pre-validation: valid=${validProducts.length}, invalid=${invalidProducts.length}`
    );
    if (invalidProducts.length) {
      console.log(
        'Invalid product entries (first 10):',
        invalidProducts.slice(0, 10)
      );
    }

    const batchSize = 50; // unordered will keep going despite individual doc failures
    const createdProducts = await batchInsertProducts(validProducts, batchSize);

    console.log(
      `Successfully inserted a total of ${createdProducts.length} products.`
    );

    await Review.deleteMany();
    const rws = [];
    for (let i = 0; i < createdProducts.length; i++) {
      let x = 0;
      const { ratingDistribution } = createdProducts[i];
      for (let j = 0; j < ratingDistribution.length; j++) {
        for (let k = 0; k < ratingDistribution[j].count; k++) {
          x++;
          rws.push({
            ...reviews.filter((x) => x.rating === j + 1)[
              x % reviews.filter((x) => x.rating === j + 1).length
            ],
            isVerifiedPurchase: true,
            product: createdProducts[i]._id,
            user: createdUser[x % createdUser.length]._id,
            updatedAt: Date.now(),
            createdAt: Date.now(),
          });
        }
      }
    }
    const createdReviews = await Review.insertMany(rws);

    console.log('createdReviews');

    await Order.deleteMany();
    const orders = [];
    for (let i = 0; i < 200; i++) {
      orders.push(
        await generateOrder(
          i,
          createdUser.map((x) => x._id),
          createdProducts.map((x) => x._id)
        )
      );
    }
    const createdOrders = await Order.insertMany(orders);
    console.log({
      createdUser,
      createdProducts,
      createdReviews,
      createdOrders,
      createdSetting,
      message: 'Seeded database successfully',
    });
    process.exit(0);
  } catch (error) {
    console.error(error);
    throw new Error('Failed to seed database');
  }
};

const generateOrder = async (
  i: number,
  users: any,
  products: any
): Promise<IOrderInput> => {
  const product1 = await Product.findById(products[i % products.length]);

  const product2 = await Product.findById(
    products[
      i % products.length >= products.length - 1
        ? (i % products.length) - 1
        : (i % products.length) + 1
    ]
  );
  const product3 = await Product.findById(
    products[
      i % products.length >= products.length - 2
        ? (i % products.length) - 2
        : (i % products.length) + 2
    ]
  );

  if (!product1 || !product2 || !product3) throw new Error('Product not found');

  const items = [
    {
      clientId: generateId(),
      product: product1._id,
      name: product1.name,
      slug: product1.slug,
      quantity: 1,
      image: product1.images[0],
      category: product1.category,
      price: product1.price,
      countInStock: product1.countInStock,
    },
    {
      clientId: generateId(),
      product: product2._id,
      name: product2.name,
      slug: product2.slug,
      quantity: 2,
      image: product2.images[0],
      category: product1.category,
      price: product2.price,
      countInStock: product1.countInStock,
    },
    {
      clientId: generateId(),
      product: product3._id,
      name: product3.name,
      slug: product3.slug,
      quantity: 3,
      image: product3.images[0],
      category: product1.category,
      price: product3.price,
      countInStock: product1.countInStock,
    },
  ];

  const order = {
    user: users[i % users.length],
    items: items.map((item) => ({
      ...item,
      product: item.product,
    })),
    shippingAddress: data.users[i % users.length].address,
    paymentMethod: data.users[i % users.length].paymentMethod,
    isPaid: true,
    isDelivered: true,
    paidAt: calculatePastDate(i),
    deliveredAt: calculatePastDate(i),
    createdAt: calculatePastDate(i),
    expectedDeliveryDate: calculateFutureDate(i % 2),
    ...calcDeliveryDateAndPriceForSeed({
      items: items,
      shippingAddress: data.users[i % users.length].address,
      deliveryDateIndex: i % 2,
    }),
  };
  return order;
};

export const calcDeliveryDateAndPriceForSeed = ({
  items,
  deliveryDateIndex,
}: {
  deliveryDateIndex?: number;
  items: OrderItem[];
  shippingAddress?: ShippingAddress;
}) => {
  const { availableDeliveryDates } = data.settings[0];
  const itemsPrice = round2(
    items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  );

  const deliveryDate =
    availableDeliveryDates[
      deliveryDateIndex === undefined
        ? availableDeliveryDates.length - 1
        : deliveryDateIndex
    ];

  const shippingPrice = deliveryDate.shippingPrice;

  const taxPrice = round2(itemsPrice * 0.15);
  const totalPrice = round2(
    itemsPrice +
      (shippingPrice ? round2(shippingPrice) : 0) +
      (taxPrice ? round2(taxPrice) : 0)
  );
  return {
    availableDeliveryDates,
    deliveryDateIndex:
      deliveryDateIndex === undefined
        ? availableDeliveryDates.length - 1
        : deliveryDateIndex,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  };
};

// main();

// Function to export/download products collection from MongoDB (kept for manual use)
export const exportProducts = async (outputFile = 'exported_products.json') => {
  try {
    await connectToDatabase(process.env.MONGODB_URI);
    const products = await Product.find({}).lean();
    const fs = await import('fs');
    fs.writeFileSync(outputFile, JSON.stringify(products, null, 2), 'utf-8');
    console.log(`Exported ${products.length} products to ${outputFile}`);
  } catch (error) {
    console.error('Failed to export products:', error);
  }
};

exportProducts();