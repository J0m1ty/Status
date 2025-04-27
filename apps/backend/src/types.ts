import { z } from 'zod';

export const ProcessStatusSchema = z.object({
    pm_id: z.number(),
    name: z.string(),
    pid: z.number(),
    status: z.string(),
    uptime: z.number(),
    memory: z.number(),
    cpu: z.number(),
});

export type ProcessStatus = z.infer<typeof ProcessStatusSchema>;