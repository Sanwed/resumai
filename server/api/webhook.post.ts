import type Stripe from 'stripe';
import { stripe } from '~/lib/stripe';

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
    console.error('[POST /api/billing/webhook] signature verification failed', err);
    throw createError({ statusCode: 400, statusMessage: 'Invalid signature' });
  }

  switch (stripeEvent.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = stripeEvent.data.object;
      const customerId = paymentIntent.customer;
      const userId = paymentIntent.metadata.user_id;
      const tokensValue = paymentIntent.metadata.tokens_value;

      if (customerId && typeof customerId === 'string' && userId && tokensValue) {
        await prisma.user.update({
          where: {
            id: userId,
            customerId,
          },
          data: {
            tokens: {
              increment: Number(tokensValue),
            },
          },
        });
      } else {
        console.log('No necessary data provided for this payment');
      }
      break;
    }
    default:
      console.log(`Unhandled event type ${stripeEvent.type}`);
  }

  return { received: true };
});
