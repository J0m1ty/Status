import 'dotenv/config';
import { z } from 'zod';

export const env = z.object({
    PORT: z.coerce.number().default(3003),
    ADMIN_USER: z.string().default('admin'),
    ADMIN_PASS: z.string(),
    JWT_SECRET: z.string(),
}).parse(process.env);