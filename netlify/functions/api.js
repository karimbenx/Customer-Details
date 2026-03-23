import serverless from 'serverless-http';
import app from '../../server.mjs'; // Updated to .mjs

export const handler = serverless(app);
