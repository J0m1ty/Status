import { ServiceName } from "./types";
import { exec } from "child_process";

const ActionTypes = ["service", "server"] as const;

export type ActionType = typeof ActionTypes[number];
export type ServiceAction = "start" | "stop" | "restart";
export type ServerAction = "restart";

export const isValidActionType = (type: string): type is ActionType => {
    return ActionTypes.includes(type as ActionType);
}

export const isValidServiceName = (name: string): name is ServiceName => {
    return name in services;
}

export const isValidServiceAction = (action: string): action is ServiceAction => {
    const validActions = Object.values(services).reduce((actions, service) => {
        if (service) actions.push(...Object.keys(service));
        return actions;
    }, [] as string[]);

    return validActions.includes(action);
}

export const isValidServerAction = (action: string): action is ServerAction => {
    return action in serverActions;
}

export const services: Partial<Record<ServiceName, Record<ServiceAction, () => Promise<void>>>> = {
    minecraft: {
        start: async () => {
            return new Promise((resolve, reject) => {
                exec('/home/mc/paper/startup.sh start', {uid: 1000}, (err, stdout, stderr) => {
                    if (err) reject();
                    
                    resolve();
                });
            });
        },
        stop: async () => {
            return new Promise((resolve, reject) => {
                exec('/home/mc/paper/startup.sh stop', {uid: 1000}, (err, stdout, stderr) => {
                    if (err) reject();
                    
                    resolve();
                });
            });
        },
        restart: async () => {
            return new Promise((resolve, reject) => {
                exec('/home/mc/paper/startup.sh restart', {uid: 1000}, (err, stdout, stderr) => {
                    if (err) reject();
                    
                    resolve();
                });
            });
        },
    },
    mindustry: {
        start: async () => {
            return new Promise((resolve, reject) => {
                exec('/home/mindus/server/startup.sh start', {uid: 1001}, (err, stdout, stderr) => {
                    if (err) reject();
                    
                    resolve();
                });
            });
        },
        stop: async () => {
            return new Promise((resolve, reject) => {
                exec('/home/mindus/server/startup.sh stop', {uid: 1001}, (err, stdout, stderr) => {
                    if (err) reject();
                    
                    resolve();
                });
            });
        },
        restart: async () => {
            return new Promise((resolve, reject) => {
                exec('/home/mindus/server/startup.sh restart', {uid: 1001}, (err, stdout, stderr) => {
                    if (err) reject();
                    
                    resolve();
                });
            });
        },
    },
    auth: {
        start: async () => {
            return new Promise((resolve, reject) => {
                exec('/home/auth/server/startup.sh start', {uid: 1004}, (err, stdout, stderr) => {
                    if (err) reject();
                    
                    resolve();
                });
            });
        },
        stop: async () => {
            return new Promise((resolve, reject) => {
                exec('/home/auth/server/startup.sh stop', {uid: 1004}, (err, stdout, stderr) => {
                    if (err) reject();
                    
                    resolve();
                });
            });
        },
        restart: async () => {
            return new Promise((resolve, reject) => {
                exec('/home/auth/server/startup.sh restart', {uid: 1004}, (err, stdout, stderr) => {
                    if (err) reject();
                    
                    resolve();
                });
            });
        },
    },
};

export const serverActions: Record<ServerAction, () => Promise<void>> = {
    restart: async () => {
        return new Promise((resolve, reject) => {
            exec('sudo reboot', (err, stdout, stderr) => {
                if (err) reject();
                
                resolve();
            });
        });
    },
};