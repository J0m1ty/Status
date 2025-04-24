import 'dotenv/config';
import { z } from 'zod';

export const env = z.object({
    MAIN_PORT: z.coerce.number().default(3003),
    TRPC_PORT: z.coerce.number().default(3004),
    ADMIN_USER: z.string().default('admin'),
    ADMIN_PASS: z.string(),
    JWT_SECRET: z.string(),
}).parse(process.env);