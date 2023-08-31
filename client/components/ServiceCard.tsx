import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { Avatar, Box, Button, Card, Chip, Divider, Grid, IconButton, LinearProgress, Stack, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import StartOutlinedIcon from '@mui/icons-material/StartOutlined';
import { FilterOption, Service, Tag } from '../types';
import { ServiceAction as Action } from '../../src/manage';

const msToStr = (ms: number) => {
    const ending = (n: number) => n > 1 ? 's' : '';
    let temp = Math.floor(ms / 1000);
    const years = Math.floor(temp / 31536000);
    if (years) return `${years} year${ending(years)}`;
    const days = Math.floor((temp %= 31536000) / 86400);
    if (days) return `${days} day${ending(days)}`;
    const hours = Math.floor((temp %= 86400) / 3600);
    if (hours) return `${hours} hour${ending(hours)}`;
    const minutes = Math.floor((temp %= 3600) / 60);
    if (minutes) return `${minutes} minute${ending(minutes)}`;
    const seconds = temp % 60;
    if (seconds) return `${seconds} second${ending(seconds)}`;
    return 'just now';
}

export default function ServiceCard(props: { service: Service, filter: FilterOption }) {
    const [loading, setLoading] = useState(false);

    const [loadingColor, setLoadingColor] = useState<'primary' | 'success'>('primary');

    const [error, setError] = useState('');

    const [showActions, setShowActions] = useState(true);

    const { auth } = useAuth();

    const service = props.service;
    const filter = props.filter;

    if (filter !== '') {
        if (filter === 'online' || filter === 'offline') {
            if (service.status.value !== filter) return null;
        }
        else if (service.tags.indexOf(filter as Tag) === -1) return null;
    }

    const handleAction = async (action: Action) => {
        setLoading(true);
        setLoadingColor('primary');
        setError('');
        setShowActions(false);

        // get jwt token
        const token = localStorage.getItem('accessToken');
        if (token == null) {
            setError('You must be logged in.');
            setLoading(false);
            return;
        }

        // send refresh
        try {
            const req = await fetch('/api/manage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `JWT ${token}` },
                body: JSON.stringify({
                    type: 'service',
                    service: service.shorthand,
                    action: action
                })
            });
            
            if (req.ok) {
                setLoadingColor('success');

                await new Promise(resolve => setTimeout(resolve, 12000));

                setLoading(false);
                setShowActions(true);
            }
            else {
                setError('An error occurred.');
                setLoading(false);
                setShowActions(false);
            }
        }
        catch (ignored) {}
    }

    const toTitleCase = (str: string) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    return (
        <Grid item xs={12} sm sx={{ minWidth: {xs: 'auto', sm: '410px' } }}>
            <Card>
                <Stack direction="row" alignItems="center" justifyContent={'space-between'}>
                    <Stack direction="row" alignItems="center" sx={{ p: 2, display: 'flex' }}>
                        <Avatar
                            variant={service.image.variant}
                            src={service.image.url}
                            sx={{
                                mr: 2,
                                transform: 'scale(1.1)',
                                filter: 'drop-shadow(0px 2px 5px rgba(0, 0, 0, 0.5))'
                            }}
                        />
                        <Stack direction="column" alignItems="start" sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="h6" component="div"
                                sx={{
                                    fontWeight: 600,
                                    fontSize: "clamp(14px, 2vw, 20px)",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis"
                                }}
                            >
                                {service.name}
                            </Typography>
                            {service.address.href == null &&
                                <Typography
                                    variant="body2"
                                    component="div"
                                    sx={{ color: 'text.secondary' }}
                                >
                                    {service.address.value}
                                </Typography>
                            }
                            {service.address?.href &&
                                <Button
                                    href={service.address.href}
                                    variant="text"
                                    target="_blank"
                                    rel="noreferrer"
                                    sx={{ p: 0 }}
                                >
                                    {service.address.value}
                                </Button>
                            }
                        </Stack>
                    </Stack>

                    {service.status.value === "online" && !loading && service.status.uptimeMs &&
                        <Box
                            sx={{
                                py: 0.5,
                                px: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'text.secondary',
                                outline: '1px dashed',
                                borderRadius: 1,
                                outlineColor: 'rgba(255, 255, 255, 0.12)',
                                m: 2,
                                ml: 0
                            }}
                        >
                            <Stack direction="row" alignItems="center" gap={1}>
                                <Typography variant="body1" component="div" display={{ xs: 'none', sm: 'flex' }}>
                                    Uptime: 
                                </Typography>
                                <Typography variant="body1" component="div" noWrap>
                                    {msToStr(service.status.uptimeMs)}
                                </Typography>
                            </Stack>
                        </Box>
                    }
                </Stack>
                <Divider />
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ px: 2, py: 1.5 }}
                >
                    <Stack direction="row" alignItems="center" gap={1}>
                        <Chip
                            label={toTitleCase(loading ? 'loading' : service.status.value)}
                            color={loading ? loadingColor : (service.status.value === 'online' ? 'success' :
                                service.status.value === 'offline' ? 'error' : 'warning')}
                            variant='outlined'
                        ></Chip>
                        { auth && service.allowActions && showActions && ((service.status.value === 'online' &&
                            <>
                                <IconButton
                                    onClick={() => handleAction('stop')}
                                    sx={{ p: 0 }}
                                    color="primary"
                                >
                                    <CloseOutlinedIcon />
                                </IconButton>
                                <IconButton
                                    onClick={() => handleAction('restart')}
                                    sx={{ p: 0 }}
                                    color="primary"
                                >
                                    <RefreshIcon />
                                </IconButton>
                            </>
                        ) || (service.status.value === 'offline' &&
                            <IconButton
                                onClick={() => handleAction('start')}
                                sx={{ p: 0 }}
                                color="primary"
                            >
                                <StartOutlinedIcon />
                            </IconButton>
                        ))}

                        {error !== '' && 
                            <Typography
                                variant="body2"
                                component="div"
                                sx={{ color: 'error.main' }}
                            >
                                {error}
                            </Typography>
                        }
                    </Stack>
                    {service.status.value === 'online' && !loading && service.info &&
                        <Typography
                            variant="body2"
                            component="div"
                            sx={{ color: 'text.secondary' }}
                        >
                            {service.info?.players} / {service.info?.max} Players
                        </Typography>
                    }
                </Stack>
                { auth && loading &&
                    <LinearProgress
                        color={loadingColor}
                    ></LinearProgress>
                }
            </Card>
        </Grid>
    );
}