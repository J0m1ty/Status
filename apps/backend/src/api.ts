import pm2, { type ProcessDescription } from 'pm2';
import type { ProcessStatus } from './types.js';

export const formatProcess = (p: ProcessDescription): ProcessStatus => ({
    pm_id: p.pm_id ?? -1,
    name: p.name ?? 'unnamed',
    pid: p.pid ?? 0,
    status: p.pm2_env?.status ?? 'unknown',
    uptime: p.pm2_env?.pm_uptime ? Date.now() - p.pm2_env.pm_uptime : 0,
    memory: p.monit?.memory ?? 0,
    cpu: p.monit?.cpu ?? 0,
});

export class PM2 {
    static connected: boolean = false;

    static connect = () => new Promise<void>((resolve, reject) => {
        if (PM2.connected) resolve();

        pm2.connect(err => {
            return err ? (PM2.connected = true, reject(err)) : resolve();
        });
    });

    static disconnect = () => {
        pm2.disconnect();
        PM2.connected = false;
    }

    static list = () => new Promise<ProcessDescription[]>(async (resolve, reject) => {
        if (!PM2.connected) await PM2.connect();
        pm2.list((err, list) => (err ? reject(err) : resolve(list)))
    }).then(list => list.map(formatProcess));

    static action = (cmd: 'restart' | 'stop' | 'start') => (id: number) => new Promise<void>(async (resolve, reject) => {
        if (!PM2.connected) await PM2.connect();
        pm2[cmd](`${id}`, (err) => (err ? reject(err) : resolve()))
    });
}