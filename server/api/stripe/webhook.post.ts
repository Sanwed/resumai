import type Stripe from 'stripe';
import { stripe } from '#server/lib/stripe';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const signature = getHeader(event, 'stripe-signature');

  if (!signature) {
    throw createError({ statusCode: 400, statusMessage: 'Missing stripe-signature header' });
  }

  const rawBody = await readRawBody(event);

  if (!rawBody) {
    throw createError({ statusCode: 400, statusMessage: 'Empty body' });
  }

  let stripeEvent: Stripe.Event;
  try {
    stripeEvent = stripe.webhooks.constructEvent(rawBody, signature, config.stripeWebhookSecret);
  } catch (err) {
    console.error('[POST] /api/stripe/webhook', err);
    throw createError({ statusCode: 400, statusMessage: 'Invalid signature' });
  }

  switch (stripeEvent.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = stripeEvent.data.object;
      const customerId = paymentIntent.customer;
      const userId = paymentIntent.metadata.user_id;
      const tokensValue = paymentIntent.metadata.tokens_value;
      const tokens = Number(tokensValue);

      if (
        typeof customerId !== 'string' ||
        !userId ||
        !Number.isSafeInteger(tokens) ||
        tokens <= 0 ||
        tokens > 2_147_483_647
      ) {
        console.error('[POST] /api/stripe/webhook Invalid payment metadata', {
          eventId: stripeEvent.id,
          paymentIntentId: paymentIntent.id,
        });

        throw createError({ statusCode: 500, statusMessage: 'Invalid payment metadata' });
      }

      const credited = await prisma.$transaction(async (tx) => {
        const purchase = await tx.tokenPurchase.createMany({
          data: {
            stripeEventId: stripeEvent.id,
            stripePaymentIntentId: paymentIntent.id,
            stripeCustomerId: customerId,
            amount: paymentIntent.amount_received,
            currency: paymentIntent.currency,
            tokens,
            userId,
          },
          skipDuplicates: true,
        });

        if (purchase.count === 0) return false;

        const user = await tx.user.updateMany({
          where: {
            id: userId,
            customerId,
          },
          data: {
            tokens: {
              increment: tokens,
            },
          },
        });

        if (user.count !== 1) {
          throw createError({ statusCode: 500, statusMessage: 'Unable to credit token purchase' });
        }

        return true;
      });

      if (!credited) {
        console.info('[POST] /api/stripe/webhook Duplicate payment ignored', {
          eventId: stripeEvent.id,
          paymentIntentId: paymentIntent.id,
        });
      }

      break;
    }
    case 'payment_intent.payment_failed': {
      const paymentIntent = stripeEvent.data.object;

      console.log('Payment failed for:', paymentIntent.id);
      console.log('Failure reason:', paymentIntent.last_payment_error?.message);
      break;
    }
    default:
      console.log(`Unhandled event type ${stripeEvent.type}`);
  }

  return { received: true };
});
