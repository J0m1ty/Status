import React from 'react';
import { AuthProvider } from './AuthContext';
import { createTheme } from '@mui/material/styles';
import { ThemeProvider } from '@emotion/react';
import { CssBaseline, Grid } from '@mui/material';

import NavMenu from './components/NavMenu';
import StatusContainer from './components/StatusContainer';
import UpdateContainer from './components/UpdateContainer';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

const App: React.FC = () => {
    return (
        <AuthProvider>
            <ThemeProvider theme={darkTheme}>
                <CssBaseline />
                <NavMenu />
                <Grid container gap={6} pt={2} pb={0} px={{ xs: 2, md: 3, lg: 4 }} sx={{ maxWidth: { xs: "100vw", lg: "90vw", xl: "80vw" }, margin: "auto" }}>
                    <Grid item xs>
                        <StatusContainer />
                    </Grid>
                    <Grid item xs={6} md={4}>
                        <UpdateContainer />
                    </Grid>
                </Grid>
            </ThemeProvider>
        </AuthProvider>
    );
}

export default App;
