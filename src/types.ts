export type Process = {
    type: "name" | "pid" | "port";
    value: string | number;
};

export type ServiceName = "minecraft" | "mindustry" | "nginx" | "status" | "auth" | "threadblend" | "splashesofcolor" | "pz";

export type Service = {
    name: ServiceName;
    process: Process;
    players?: () => Promise<number>;
};

export type ServiceStatistics = {
    cpu: number;
    memory: number;
    elapsed: number;
    players?: number;
} | null | undefined;

export type Stats = {
    [key in ServiceName]: ServiceStatistics;
};

export type StatusMessage = {
    data: Stats;
};

export type LoginMessageSuccess = {
    accessToken: string;
};

export type LoginMessageFailure = {
    accessToken: null;
    error: string;
};

export type LoginMessage = LoginMessageSuccess | LoginMessageFailure;

export type ManageMessageSuccess = {
    success: true;
};

export type ManageMessageFailure = {
    error: string;
};

export type ManageMessage = ManageMessageSuccess | ManageMessageFailure;

export type Message = StatusMessage | LoginMessage | ManageMessage;
