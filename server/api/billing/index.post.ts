import z from 'zod';
import { auth } from '~/lib/auth';
import { stripe } from '#server/lib/stripe';
import type Stripe from 'stripe';

const querySchema = z.object({
  priceId: z.string(),
});

export default defineEventHandler(async (event) => {
  const authSession = await auth.api.getSession({ headers: event.headers });

  if (!authSession) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const query = await getValidatedQuery(event, (query) => querySchema.safeParse(query));

  if (query.error) {
    throw createError({
      statusCode: 400,
      statusMessage: 'priceId is required',
    });
  }

  const price = await stripe.prices.retrieve(query.data.priceId, {
    expand: ['product'],
  });

  const product = price.product as Stripe.Product;

  const origin = getRequestURL(event).origin;

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: query.data.priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer: authSession.user.customerId ?? undefined,
      payment_intent_data: {
        metadata: {
          user_id: authSession.user.id,
          tokens_value: product.metadata.tokens_value ?? null,
        },
      },
      success_url: `${origin}/dashboard`,
      cancel_url: `${origin}/billing`,
    });

    return { url: session.url };
  } catch (error) {
    console.error('[POST] /api/billing', error);

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch products',
    });
  }
});
