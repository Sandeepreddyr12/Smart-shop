import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

import { sendPurchaseReceipt } from '@/emails';
import Order from '@/lib/db/models/order.model';

export const dynamic = 'force-dynamic';

function getStripe(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;
  return new Stripe(secretKey);
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    console.warn('Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET');
    return new NextResponse('Server misconfiguration', { status: 500 });
  }

  const event = await stripe.webhooks.constructEvent(
    await req.text(),
    req.headers.get('stripe-signature') as string,
    webhookSecret
  );

  if (event.type === 'charge.succeeded') {
    const charge = event.data.object;
    const orderId = charge.metadata.orderId;
    const email = charge.billing_details.email;
    const pricePaidInCents = charge.amount;
    const order = await Order.findById(orderId).populate('user', 'email');
    if (order == null) {
      return new NextResponse('Bad Request', { status: 400 });
    }

    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentResult = {
      id: event.id,
      status: 'COMPLETED',
      email_address: email!,
      pricePaid: (pricePaidInCents / 100).toFixed(2),
    };
    await order.save();
    try {
      await sendPurchaseReceipt({ order });
    } catch (err) {
      console.log('email error', err);
    }
    return NextResponse.json({
      message: 'updateOrderToPaid was successful',
    });
  }
  return new NextResponse();
}
