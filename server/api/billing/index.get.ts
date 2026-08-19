import { stripe } from '#server/lib/stripe';

export default defineEventHandler(async () => {
  try {
    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price'],
    });

    return products;
  } catch (error) {
    console.error('[GET] /api/billing', error);

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch products',
    });
  }
});
