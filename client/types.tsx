export type Status = "online" | "offline" | "unknown";

export type Tag = "game" | "bot" | "web" | "api" | "other";

export type FilterOption = "" | Status | Tag;

export type SortOption = "type" | "alphabetical" | "uptime" | "players";

export type Service = {
    shorthand: string;
    name: string;
    tags: Tag[];
    image: {
        url: string;
        variant: "circular" | "rounded" | "square";
    }
    address: {
        value: string;
        href?: string;
    }
    status: {
        value: Status;
        uptimeMs?: number;
    }
    info?: {
        players: number;
        max: number;
    }
    allowActions: boolean;
}