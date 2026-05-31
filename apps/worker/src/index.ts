import { serve } from '@hono/node-server';
import { app } from './routes.js';

const port = Number(process.env.PORT ?? 8787);

serve({ fetch: app.fetch, port }, () => {
  console.log(`ClipTools worker listening on :${port}`);
});
