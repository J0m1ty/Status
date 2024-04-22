import React, { useEffect } from 'react';
import { Box, Divider, FormControl, Grid, InputLabel, ListSubheader, MenuItem, Select, Stack, Typography } from "@mui/material";
import ServiceCard from "./ServiceCard";
import { Stats } from '../../src/types';
import { Tag, FilterOption, SortOption, Service } from '../types';
import { web } from 'webpack';

const services: Service[] = [
    {
        shorthand: 'minecraft',
        name: 'Minecraft',
        tags: ['game'],
        image: {
            url: '/images/minecraft.png',
            variant: 'square'
        },
        address: {
            value: 'mc.jomity.net'
        },
        status: {
            value: 'unknown'
        },
        info: {
            players: 0,
            max: 6
        },
        allowActions: true
    },
    {
        shorthand: 'mindustry',
        name: 'Mindustry',
        tags: ['game'],
        image: {
            url: '/images/mindustry.png',
            variant: 'square'
        },
        address: {
            value: 'mindus.jomity.net'
        },
        status: {
            value: 'unknown'
        },
        info: {
            players: 0,
            max: 30
        },
        allowActions: true
    },
    {
        shorthand: 'threadblend',
        name: 'ThreadBlend',
        tags: ['bot'],
        image: {
            url: '/images/threadblend.png',
            variant: 'circular'
        },
        address: {
            value: 'ADD BOT',
            href: 'https://discord.com/api/oauth2/authorize?client_id=1129971220998279199&permissions=8&scope=bot'
        },
        status: {
            value: 'unknown'
        },
        allowActions: false
    },
    {
        shorthand: 'splashesofcolor',
        name: 'Splashes Of Color',
        tags: ['bot'],
        image: {
            url: '/images/splashesofcolor.png',
            variant: 'circular'
        },
        address: {
            value: 'ADD BOT',
            href: 'https://discord.com/api/oauth2/authorize?client_id=923288205476896858&permissions=8&scope=bot'
        },
        status: {
            value: 'unknown'
        },
        allowActions: false
    },
    {
        shorthand: 'auth',
        name: 'Armadahex Auth',
        tags: ['web', 'api'],
        image: {
            url: '/images/armadahex.png',
            variant: 'square'
        },
        address: {
            value: 'PLAY',
            href: 'https://jomity.itch.io/armadahex'
        },
        status: {
            value: 'unknown'
        },
        allowActions: true
    },
    {
        shorthand: 'nginx',
        name: 'NGINX',
        tags: ['web'],
        image: {
            url: '/images/nginx.png',
            variant: 'circular'
        },
        address: {
            value: 'www.jomity.net'
        },
        status: {
            value: 'unknown'
        },
        allowActions: false
    },
    {
        shorthand: 'status',
        name: 'Status',
        tags: ['web'],
        image: {
            url: '/favicon.ico',
            variant: 'square'
        },
        address: {
            value: 'status.jomity.net'
        },
        status: {
            value: 'unknown'
        },
        allowActions: false
    },
    {
        shorthand: 'pz',
        name: 'Project Zomboid',
        tags: ['game'],
        image: {
            url: '/images/projectzomboid.png',
            variant: 'square'
        },
        address: {
            value: 'pz.jomity.net'
        },
        status: {
            value: 'unknown'
        },
        info: {
            players: 0,
            max: 32
        },
        allowActions: false
    }
];

const tagPriority: { [key in Tag]: number } = {
    game: 0,
    bot: 1,
    web: 2,
    api: 3,
    other: 4
}

const sorts: { [key in SortOption]: (a: Service, b: Service) => number } = {
    type: (a, b) => {
        if (a.tags.length === 0) return 1;
        if (b.tags.length === 0) return -1;
        return tagPriority[a.tags[0]] - tagPriority[b.tags[0]];
    },
    alphabetical: (a, b) => a.name.localeCompare(b.name),
    uptime: (a, b) => {
        if (a.status.uptimeMs === undefined) return 1;
        if (b.status.uptimeMs === undefined) return -1;
        return b.status.uptimeMs - a.status.uptimeMs;
    },
    players: (a, b) => {
        if (a.info?.players === undefined) return 1;
        if (b.info?.players === undefined) return -1;
        return b.info.players - a.info.players;
    }
}

export default function StatusContainer() {
    const [statuses, setStatuses] = React.useState<Service[]>(services);

    const [webSocket, setWebSocket] = React.useState<WebSocket | null>(null);

    const [filter, setFilter] = React.useState<FilterOption>("");

    const [sort, setSort] = React.useState<SortOption>("type");

    React.useEffect(() => {
        if (webSocket) {
            webSocket.close();
        }

        console.log("INIT WEBSOCKET")
        const ws = new WebSocket("wss://status.jomity.net");
        setWebSocket(ws);

        return () => {
            ws.close();
        }
    }, []);
    
    useEffect(() => {
        if (!webSocket) return;

        webSocket.addEventListener("message", (event) => {
            const data: Stats = JSON.parse(event.data);
    
            const newStatuses = [...statuses];
            
            Object.entries(data).forEach(([key, value]) => {
                const service = newStatuses.find((service) => service.shorthand.toLowerCase() === key.toLowerCase());
                if (service) {
                    service.status = !value ? { value: "offline" } : { value: "online", uptimeMs: value.elapsed };

                    if (service.info && value?.players !== undefined) {
                        service.info.players = value.players;
                    }
                }
            });

            setStatuses(newStatuses);
        });
    }, [webSocket]);

    return (
        <Stack spacing={3}>
            <Stack spacing={0}>
                <Typography 
                    variant="h4" 
                    component="div"
                    sx={{
                        fontWeight: 'bold',
                        fontFamily: 'monospace',
                        color: 'text.primary'
                    }}
                >
                    Service Statuses
                </Typography>
                <Typography
                    variant="body1"
                    component="div"
                    sx={{
                        color: 'text.secondary'
                    }}
                >
                    Quickly view the status and uptime of our services.
                </Typography>
            </Stack>

            <Grid container gap={2} display={{ xs: 'none', sm: 'flex' }}>
                <Grid item xs={12} md={4} xl="auto">
                    <FormControl fullWidth sx={{ width: { xl: '300px'} }}>
                        <InputLabel htmlFor="filter-select">Filter Services</InputLabel>
                        <Select defaultValue="" id="filter-select" label="Filter Services"
                            onChange={(event) => setFilter(event.target.value as FilterOption)}
                        >
                            <MenuItem value="">
                                <em>All</em>
                            </MenuItem>
                            <ListSubheader>By Status</ListSubheader>
                            <MenuItem value="online">Online</MenuItem>
                            <MenuItem value="offline">Offline</MenuItem>
                            <ListSubheader>By Type</ListSubheader>
                            <MenuItem value="game">Game</MenuItem>
                            <MenuItem value="bot">Bot</MenuItem>
                            <MenuItem value="web">Web</MenuItem>
                            <MenuItem value="api">API</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} md={4} xl="auto">
                    <FormControl fullWidth sx={{ width: { xl: '300px'} }}>
                        <InputLabel htmlFor="sort-select">Sort Services</InputLabel>
                        <Select defaultValue="type" id="sort-select" label="Sort Services"
                            onChange={(event) => setSort(event.target.value as SortOption)}
                        >
                            <MenuItem value="type"> Type</MenuItem>
                            <MenuItem value="alphabetical">Alphabetical</MenuItem>
                            <MenuItem value="uptime">Uptime</MenuItem>
                            <MenuItem value="players">Players</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
            
            <Divider />
            
            <Box sx={{
                height: '80vh',
                overflowY: 'scroll',
                overflowX: 'hidden',
                '&::-webkit-scrollbar': {
                    display: 'none'
                }
            }}>
                <Grid container gap={5} sx={{ maxWidth: "1400px" }} >
                    {statuses.sort(sorts[sort]).map((status) => (
                        <ServiceCard service={status} key={status.name} filter={filter} />
                    ))}
                    <Grid item xs={12} sx={{ height: '50vh' }} />
                </Grid>
            </Box>
            
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '10vh',
                    backgroundImage: 'linear-gradient(rgb(18, 18, 18, 0), rgb(18, 18, 18, 1))',
                    zIndex: 1,
                    pointerEvents: 'none'
                }}
            />
        </Stack>
    );
}