import { NextRequest, NextResponse } from 'next/server';

import UserInteractions from '@/lib/db/models/userInteractions.model';
import { connectToDatabase } from '@/lib/db';
import { UserInteractionInputSchema } from '@/lib/validator';

import Product from '@/lib/db/models/product.model';

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();

    // Validate input
    const parsed = UserInteractionInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.errors },
        { status: 400 }
      );
    }
    const {
      userId,
      productId,
      interactionType,
      value,
      reviewStars,
      category,
      sessionId,
      searchQuery,
    } = parsed.data;


    console.log("fffffffffffffffffffffffffff",category);

    await connectToDatabase();

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if interaction already exists for this user and product
    const existingInteraction = await UserInteractions.findOne({
      userId,
      productId,
    });

    // Handle different interaction types
    let updatedInteraction;
    if (existingInteraction) {
      // If the existing interaction is a purchase, do not modify interactionType.
      if (existingInteraction.interactionType === 'purchase') {
        // Only allow appending value if new interaction is also a purchase
        if (interactionType === 'purchase' && typeof value === 'number') {
          existingInteraction.value = (existingInteraction.value || 0) + value;
        }
        // Only update reviewStars if new interaction is also a purchase and reviewStars is provided
        if (interactionType === 'purchase' && typeof reviewStars === 'number') {
          existingInteraction.reviewStars = reviewStars;
        }
        // Optionally update sessionId and searchQuery
        if (sessionId) existingInteraction.sessionId = sessionId;
        if (searchQuery) existingInteraction.searchQuery = searchQuery;
        // Do not change interactionType
      } else {
        // If existing interaction is 'view' or 'add_to_cart', allow modification
        if (interactionType === 'view') {
          existingInteraction.value = 0;
        } else if (typeof value === 'number') {
          existingInteraction.value = value;
          // existingInteraction.category = category;
        }
        // Only update reviewStars if new interaction is a purchase
        if (interactionType === 'purchase' && typeof reviewStars === 'number') {
          existingInteraction.reviewStars = reviewStars;
        }
        // Update interactionType to the new one
        existingInteraction.interactionType = interactionType;
        if (sessionId) existingInteraction.sessionId = sessionId;
        if (searchQuery) existingInteraction.searchQuery = searchQuery;
      }
      updatedInteraction = await existingInteraction.save();
    } else {
      // Create new interaction
      const newInteraction = {
        userId,
        productId,
        interactionType,
        value:
          interactionType === 'add_to_cart' || interactionType === 'purchase'
            ? value || 1
            : 0,
        reviewStars: interactionType === 'purchase' ? reviewStars : undefined,
        category,
        sessionId,
        searchQuery,
      };

      
      updatedInteraction = await UserInteractions.create(newInteraction);
    }

    return NextResponse.json(updatedInteraction);
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
