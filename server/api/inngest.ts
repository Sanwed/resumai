import { serve } from 'inngest/nuxt';
import { functions, inngest } from '#server/lib/inngest/index';

export default defineEventHandler(serve({ client: inngest, functions }));
