import express from 'express';
import cors from 'cors';
import { env } from './env.js';
import { router, errorHandler } from './routes.js';

const app = express();

app.use(cors({ origin: env.WEB_ORIGIN, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use('/api', router);
app.use(errorHandler);

app.listen(env.API_PORT, () => {
  console.log(`AG Peptides API listening on http://localhost:${env.API_PORT}`);
});
