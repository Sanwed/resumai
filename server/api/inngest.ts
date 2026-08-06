import { serve } from 'inngest/nuxt';
import { functions, inngest } from '~/lib/inngest/index';

export default defineEventHandler(serve({ client: inngest, functions }));
