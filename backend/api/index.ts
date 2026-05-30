import { ExpressAdapter } from '@nestjs/platform-express';
import express = require('express');
import { createNestApp } from '../src/bootstrap';

let server: express.Express | null = null;

async function getServer() {
  if (server) return server;

  const expressServer = express();
  const app = await createNestApp(new ExpressAdapter(expressServer));
  await app.init();
  server = expressServer;

  return server;
}

export default async function handler(req: express.Request, res: express.Response) {
  const app = await getServer();
  return app(req, res);
}
