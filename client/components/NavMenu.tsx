import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { AppBar, Avatar, Backdrop, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Drawer, LinearProgress, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Stack, TextField, Toolbar, Typography } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import WysiwygIcon from '@mui/icons-material/Wysiwyg';
import LoginIcon from '@mui/icons-material/Login';
import decode from 'jwt-decode';

const pages = [
    {
        title: 'Home',
        href: 'https://jomity.net',
    },
    {
        title: 'Status',
        href: 'https://status.jomity.net',
    }
];

export default function NavMenu() {
    const { auth, setAuth } = useAuth();

    const [open, setOpen] = useState(false);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState('');

    const [drawer, setDrawer] = useState(false);

    const [backdrop, setBackdrop] = useState(false);

    const formRef = useRef<HTMLFormElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    
    const handleOpen = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    const handleSubmit = () => {
        formRef.current?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }

    const login = async () => {
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: passwordRef.current?.value })
            });

            if (res.ok) {
                const data = await res.json();
                const { accessToken } = data;

                localStorage.setItem('accessToken', accessToken);

                setAuth(true);
                setLoading(false);

                handleClose();
            }
            else {
                const data = await res.json();
                const { error } = data;
                
                setError(error);
                setLoading(false);
            }
        }
        catch (ignored) {}
    }

    const verifyToken = () => {
        const token = localStorage.getItem('accessToken');

        if (token) {
            const decodedToken = decode(token) as { exp: number };
            const currentTime = Date.now() / 1000;
            
            if (decodedToken.exp > currentTime) {
                setAuth(true);
            }
            else {
                setAuth(false);
            }
        }
        else {
            setAuth(false);
        }
    }

    useEffect(() => {
        verifyToken();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        setAuth(false);
    }

    const handleRestart = async () => {
        // get jwt token
        const token = localStorage.getItem('accessToken');
        if (token == null) return;

        // send refresh
        try {
            fetch('/api/manage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `JWT ${token}` },
                body: JSON.stringify({
                    type: 'server',
                    action: 'restart'
                })
            });
        }
        catch (ignored) {}
            
        // wait 5 seconds
        await new Promise(resolve => setTimeout(resolve, 5000));

        // refresh page
        window.location.reload();
    }

    const visualDelay = async (func: () => void) => {
        setBackdrop(true);

        await new Promise(resolve => setTimeout(resolve, 1000));

        func();

        setBackdrop(false);
    }

    return (
        <>
            <AppBar 
                position="static"
                sx={{
                    bgcolor: 'background.default',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.5)'
                }}
            >
                <Toolbar sx={{ px: 2 }}>
                    <Box
                        sx={{
                            bgcolor: 'rgba(0, 0, 0, 0.87)',
                            color: 'primary.dark',
                            display: 'flex',
                            px: 2,
                            py: 1,
                            borderRadius: '5px',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            mr: 2,
                            my: 1
                        }}
                    >
                        <Avatar
                            alt="Logo"
                            src="/images/logo.png"
                            sx={{ 
                                mr: 2,
                                filter: 'invert(500%) sepia(100%) saturate(0%) brightness(100%)'
                            }}
                        />
                        <Stack 
                            direction="column"
                            justifyContent="center"
                            alignItems="center"
                            sx={{ pt: "1px" }}
                        >
                            <Typography
                                variant="h6"
                                noWrap
                                component="div"
                                sx={{
                                    fontFamily: 'monospace',
                                    fontWeight: 700,
                                    color: 'inherit',
                                    textDecoration: 'none',
                                    lineHeight: '1rem',
                                }}
                            >
                                JOMITY
                            </Typography>
                            <Typography
                                variant="subtitle1"
                                noWrap
                                component="div"
                                sx={{
                                    fontFamily: 'monospace',
                                    fontWeight: 200,
                                    letterSpacing: '.3rem',
                                    color: 'inherit',
                                    textDecoration: 'none',
                                    lineHeight: '1rem',
                                }}
                            >
                                .NET
                            </Typography>
                        </Stack>
                    </Box>

                    <Box sx={{ flexGrow: 1, display: 'flex' }}>
                        {
                            pages.map((page) => (
                                <Button
                                    key={page.title}
                                    href={page.href}
                                    sx={{
                                        my: 2,
                                        px: 1,
                                        color: "primary.main", 
                                        display: { xs: 'none', sm: 'block'},
                                        '&:hover': {
                                            bgcolor: 'primary.main',
                                            color: 'primary.contrastText',
                                            borderRadius: '5px',
                                        },
                                        textAlign: 'center',
                                        lineHeight: 'inherit',
                                        mr: 1
                                    }}
                                >
                                    {page.title}
                                </Button>
                            ))
                        }
                    </Box>

                    { !auth &&
                        <>
                            <Button variant="contained" sx={{ fontWeight: 600 }} onClick={handleOpen}>
                                <LoginIcon />
                                <Box
                                    ml={1}
                                    display={{ xs: 'none', sm: 'block' }}
                                >
                                    LOGIN
                                </Box>
                            </Button>

                            <Dialog open={open} onClose={handleClose}>
                                <DialogTitle sx={{ fontWeight: 'bold' }}>Admin Login</DialogTitle>
                                <DialogContent>
                                    <DialogContentText>
                                        Sign in to manage and restart services.
                                    </DialogContentText>
                                    <form 
                                        ref={formRef}
                                        noValidate 
                                        id="login"
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            login();
                                        }}
                                    >
                                        <TextField
                                            autoFocus
                                            margin="dense"
                                            id="password"
                                            label="Password"
                                            type="password"
                                            autoComplete="current-password"
                                            fullWidth
                                            variant="standard"
                                            inputRef={passwordRef}
                                            error={error !== ''}
                                            helperText={error}
                                        />
                                    </form>
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={handleClose}>Cancel</Button>
                                    <Button onClick={handleSubmit}>Login</Button>
                                </DialogActions>
                                { loading && <LinearProgress /> }
                            </Dialog>
                        </>
                    }

                    { auth &&
                        <>
                            {/* add admin control button with icon */}
                            <Button 
                                variant="contained"
                                sx={{ fontWeight: 600 }}
                                onClick={() => setDrawer(true)}
                            >
                                <AdminPanelSettingsIcon />
                                <Box
                                    ml={1}
                                    display={{ xs: 'none', sm: 'block' }}
                                >
                                    ADMIN
                                </Box>
                            </Button>
                        </>
                    }
                </Toolbar>
            </AppBar>

            <Drawer
                anchor={'right'}
                open={drawer}
                onClose={() => setDrawer(false)}
            >
                <Box
                    sx={{ width: 250 }}
                    role="presentation"
                    onClick={() => setDrawer(false)}
                    onKeyDown={() => setDrawer(false)}
                >
                    <List>
                        <ListItem>
                            <ListItemButton onClick={() => visualDelay(handleRestart)}>
                                <ListItemIcon>
                                    <RestartAltIcon />
                                </ListItemIcon>
                                <ListItemText primary="Restart Server" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem>
                            <ListItemButton>
                                <ListItemIcon>
                                    <WysiwygIcon />
                                </ListItemIcon>
                                <ListItemText primary="Startup Apps" />
                            </ListItemButton>
                        </ListItem>
                    </List>

                    <Divider />

                    <List>
                        <ListItem>
                            <ListItemButton onClick={() => visualDelay(handleLogout)}>
                                <ListItemIcon>
                                    <LogoutIcon />
                                </ListItemIcon>
                                <ListItemText primary="Logout" />
                            </ListItemButton>
                        </ListItem>
                    </List>
                </Box>
            </Drawer>

            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={backdrop}
                >
                <CircularProgress color="inherit" />
            </Backdrop>
        </>
    );
}