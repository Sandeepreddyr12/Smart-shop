import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Product from '@/lib/db/models/product.model';
import UserInteractions from '@/lib/db/models/userInteractions.model';
import { PurchaseTrackerInputSchema } from '@/lib/validator';


export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    // Parse and validate the input
    const parsed = PurchaseTrackerInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.errors },
        { status: 400 }
      );
    }

   
    const { userId, products } = parsed.data;

    await connectToDatabase();

    const results = [];

    for (const product of products) {
      const { productID, value } = product;

      // Check if product exists
      const productDoc = await Product.findById(productID);
      if (!productDoc) {
        results.push({
          productID,
          status: 'error',
          message: 'Product not found',
        });
        continue;
      }

      // Check if interaction already exists for this user and product
      const existingInteraction = await UserInteractions.findOne({
        userId,
        productId: productID,
      });

      if (existingInteraction) {
        // If the existing interaction is a purchase, append value to existing value
        if (existingInteraction.interactionType === 'purchase') {
          existingInteraction.value =
            (typeof existingInteraction.value === 'number' ? existingInteraction.value : 1) +
            (typeof value === 'number' ? value : 1);
        } else {
          // Otherwise, set value and update interactionType to 'purchase'
          existingInteraction.value = typeof value === 'number' ? value : 1;
          existingInteraction.interactionType = 'purchase';
        }
        await existingInteraction.save();
        results.push({
          productID,
          status: 'updated',
        });
      } else {
        // Create new interaction
        const newInteraction = {
          userId,
          productId: productID,
          interactionType: 'purchase',
          value: typeof value === 'number' ? value : 1,
        };
        await UserInteractions.create(newInteraction);
        results.push({
          productID,
          status: 'created',
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Server error',
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    );
  }
};
