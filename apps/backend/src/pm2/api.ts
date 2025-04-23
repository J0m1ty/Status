import pm2, { type ProcessDescription } from 'pm2';
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

export const connect = () =>
    new Promise<void>((resolve, reject) => pm2.connect(err => (err ? reject(err) : resolve())));

export const disconnect = () =>
    new Promise<void>((resolve) => {
        pm2.disconnect();
        resolve();
    });

export const formatProcess = (proc: ProcessDescription): ProcessStatus => ({
    pm_id: proc.pm_id ?? -1,
    name: proc.name ?? 'unnamed',
    pid: proc.pid ?? 0,
    status: proc.pm2_env?.status ?? 'unknown',
    uptime: proc.pm2_env?.pm_uptime ? Date.now() - proc.pm2_env.pm_uptime : 0,
    memory: proc.monit?.memory ?? 0,
    cpu: proc.monit?.cpu ?? 0,
});

export const list = () =>
    new Promise<ProcessDescription[]>((resolve, reject) =>
        pm2.list((err, list) => (err ? reject(err) : resolve(list))))
    .then(list => list.map(formatProcess));

export const action = (cmd: 'restart' | 'stop' | 'start') => (id: number) =>
    new Promise<void>((resolve, reject) => pm2[cmd](`${id}`, (err) => (err ? reject(err) : resolve())));