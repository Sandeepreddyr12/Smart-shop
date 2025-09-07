import { Resend } from 'resend';
import PurchaseReceiptEmail from './purchase-receipt';
import { IOrder } from '@/lib/db/models/order.model';
import AskReviewOrderItemsEmail from './ask-review-order-items';
import { SENDER_EMAIL, SENDER_NAME } from '@/lib/constants';

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export const sendPurchaseReceipt = async ({ order }: { order: IOrder }) => {
  const resend = getResendClient();
  if (!resend) {
    console.warn('RESEND_API_KEY not set; skipping purchase receipt email');
    return;
  }
  await resend.emails.send({
    from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
    to: (order.user as { email: string }).email,
    subject: 'Order Confirmation',
    react: <PurchaseReceiptEmail order={order} />,
  });
};

export const sendAskReviewOrderItems = async ({ order }: { order: IOrder }) => {
  const resend = getResendClient();
  if (!resend) {
    console.warn('RESEND_API_KEY not set; skipping review email');
    return;
  }
  const oneDayFromNow = new Date(
    Date.now() + 1000 * 60 * 60 * 24
  ).toISOString();

  await resend.emails.send({
    from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
    to: (order.user as { email: string }).email,
    subject: 'Review your order items',
    react: <AskReviewOrderItemsEmail order={order} />,
    scheduledAt: oneDayFromNow,
  });
};
