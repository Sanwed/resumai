import z from 'zod';
import { auth } from '~/lib/auth';
import { stripe } from '~/lib/stripe';

const querySchema = z.object({
  priceId: z.string(),
  tokensValue: z.string(),
});

export default defineEventHandler(async (event) => {
  const authSession = await auth.api.getSession({ headers: event.headers });

  if (!authSession) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const query = await getValidatedQuery(event, (query) => querySchema.safeParse(query));

  if (!query.data || query.error) {
    throw createError({
      statusCode: 400,
      message: 'priceId and tokenValue is required',
    });
  }

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
          tokens_value: query.data.tokensValue,
        },
      },
      success_url: `${origin}/dashboard`,
      cancel_url: `${origin}/billing`,
    });

    return { url: session.url };
  } catch (e) {
    console.error('[POST /api/billing]', e);

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch products',
    });
  }
});
