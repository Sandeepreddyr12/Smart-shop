import { Document, model, models, Schema } from 'mongoose';
import { UserInteraction } from '@/types';

// export interface IUserInteraction extends Document {
//   userId: Types.ObjectId | string;
//   productId: Types.ObjectId | string;
//   interactionType:
//     | 'view'
//     | 'add_to_cart'
//     | 'purchase'
//     | 'review'
//     | 'wishlist'
//     | 'search';
//   timestamp: Date;
//   value?: number;
//   sessionId?: string;
//   searchQuery?: string;
// }

export interface IUserInteraction extends Document, UserInteraction {
  createdAt: Date;
  updatedAt: Date;
}

const userInteractionSchema = new Schema<IUserInteraction>(
  {
    userId: { type: String, ref: 'User', required: true },
    productId: { type: String, ref: 'Product', required: true },
    interactionType: {
      type: String,
      required: true,
      enum: [
        'view',
        'add_to_cart',
        'purchase'
      ],
    },
    value: { type: Number }, // for things like quantity, etc.
    reviewStars: { type: Number, min: 0, max: 5, default: 0 },
    sessionId: { type: String },
    searchQuery: { type: String },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// Add a unique compound index on userId and productId
userInteractionSchema.index({ userId: 1, productId: 1 }, { unique: true });

const UserInteractions =
  models.UserInteraction ||
  model<IUserInteraction>('UserInteraction', userInteractionSchema);

export default UserInteractions;
