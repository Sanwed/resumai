import { stripe } from '~/lib/stripe';

export default defineEventHandler(async () => {
  try {
    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price'],
    });

    return products;
  } catch (e) {
    console.error('[GET /api/billing]', e);

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch products',
    });
  }
});
