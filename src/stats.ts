import find from "find-process";
import pidusage from "pidusage";
import { exec } from "child_process";
import { Process, Service, ServiceStatistics, Stats } from "./types";

const services: Service[] = [
    {
        name: "minecraft",
        process: {
            type: "port",
            value: 25565
        },
        players: () => {
            return new Promise((resolve, reject) => {
                exec("/home/mc/paper/startup.sh players && grep \"\\[Server thread/INFO\\]: There are\" /home/mc/paper/logs/latest.log | tail -n 1 | sed 's/.*There are \\([0-9]*\\) of a max of \\([0-9]*\\) players online.*/\\1/'", {uid: 1000}, (err, stdout, stderr) => {
                    if (err) return resolve(0);

                    const players = isNaN(parseInt(stdout)) ? 0 : parseInt(stdout);

                    resolve(players);
                });
            });
        }
    },
    {
        name: "mindustry",
        process: {
            type: "port",
            value: 6567
        },
        players: () => {
            return new Promise((resolve, reject) => {
                const childProcess = exec("/home/mindus/server/startup.sh players && grep -E \"Players:|No players\" /home/mindus/server/config/logs/log-0.txt | tail -n 1 | sed 's/.*Players: \\([0-9]*\\).*/\\1/'", {uid: 1001}, (err, stdout, stderr) => {
                    if (err) return resolve(0);

                    const players = isNaN(parseInt(stdout)) ? 0 : parseInt(stdout);

                    resolve(players);
                });
            });
        }
    },
    {
        name: "nginx",
        process: {
            type: "name",
            value: "nginx: master process"
        }
    },
    {
        name: "status",
        process: {
            type: "port",
            value: 3001
        }
    },
    {
        name: "auth",
        process: {
            type: "name",
            value: "auth/server"
        }
    },
    {
        name: "threadblend",
        process: {
            type: "name",
            value: "threadblend"
        }
    },
    {
        name: "splashesofcolor",
        process: {
            type: "name",
            value: "soc"
        }
    },
    {
        name: "pz",
        process: {
            type: "name",
            value: "ProjectZomboid64"
        }
    }
];

const getStats = (process: Process, callback: (statistics: ServiceStatistics) => void) => {
    find(process.type, process.value).then((list) => {
        if (list.length > 0) {
            pidusage(list[0].pid, async (err, stats) => {
                if (err) return;

                const { cpu, memory, elapsed } = stats;
                
                const out: ServiceStatistics = {
                    cpu: Math.round(cpu * 100) / 100,
                    memory: Math.round(memory / 1024 / 1024 / 1024 * 100) / 100,
                    elapsed
                };

                callback(out);
            });
        }
        else {
            callback(null);
        }
    });
}

export const collectStats = (callback: (stats: Stats) => void) => {
    const stats: Stats = services.reduce((acc, service) => {
        acc[service.name] = undefined;
        return acc;
    }, {} as Stats);

    for (const service of services) {
        const { name, process } = service;

        getStats(process, (statistics) => {
            stats[name] = statistics;

            if (stats[name] && service.players) service.players().then((players) => {
                stats[name]!.players = players;
                
                if (Object.values(stats).every((stat) => stat !== undefined)) {
                    callback(stats);
                }
            });
            else if (Object.values(stats).every((stat) => stat !== undefined)) {
                callback(stats);
            }
        });
    }
}