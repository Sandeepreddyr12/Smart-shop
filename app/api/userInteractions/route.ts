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
      sessionId,
      searchQuery,
    } = parsed.data;

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
      // If it's a cart or purchase, update quantity/value
      if (interactionType === 'add_to_cart' || interactionType === 'purchase') {
        // If value is provided, increment or set
        if (typeof value === 'number') {
          existingInteraction.value = (existingInteraction.value || 0) + value;
        }
      }
      // If it's a review, update reviewStars
      if (interactionType === 'review' && typeof reviewStars === 'number') {
        existingInteraction.reviewStars = reviewStars;
      }
      // Update interactionType if changed
      existingInteraction.interactionType = interactionType;
      if (sessionId) existingInteraction.sessionId = sessionId;
      if (searchQuery) existingInteraction.searchQuery = searchQuery;
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
            : undefined,
        reviewStars: interactionType === 'review' ? reviewStars : undefined,
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
