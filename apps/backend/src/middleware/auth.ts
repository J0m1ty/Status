import { jwt } from 'hono/jwt';
import { env } from '../env.js';

export const auth = jwt({ secret: env.JWT_SECRET });