import { app } from './app.js';
import { env, missingEnv } from './config/env.js';
import { ensureAdminFromEnv } from './services/adminAccount.service.js';

const server = app.listen(env.port, () => {
  console.log(`API listening on http://localhost:${env.port}`);
  const missing = missingEnv();
  if (missing.length) {
    console.warn(`Missing environment variables: ${missing.join(', ')}`);
  }
  ensureAdminFromEnv().catch((error) => {
    console.error(error.message || error);
  });
});

server.on('error', (error) => {
  console.error(error);
  process.exit(1);
});
