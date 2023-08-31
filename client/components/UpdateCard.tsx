import React, { useState } from 'react';
import { Box, Chip, Divider, Paper, Stack, Typography } from "@mui/material"
import CircleIcon from '@mui/icons-material/Circle';
import { Update, tags } from "./UpdateContainer"

export default function UpdateCard({ update, toggleExpanded }: { update: Update, toggleExpanded: () => void }) {
    const [isHovered, setIsHovered] = useState(false);

    const maxContentLength = 120;
    const compressed = update.content.length > maxContentLength && !update.expanded;

    const color = tags.filter((tag) => tag.label === update.tag)[0]?.color ?? '#9e9e9e';

    const handleHover = () => {
        setIsHovered(true);
    };

    const handleHoverEnd = () => {
        setIsHovered(false);
    };

    return (
        <Paper elevation={3} sx={{ width: "100%" }} onClick={toggleExpanded}
            onMouseEnter={handleHover}
            onMouseLeave={handleHoverEnd}
        >
            <Box p={2} pb={0} gap={1}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: 'primary.dark' }}>
                        {update.title}
                    </Typography>
                    <Chip
                        label={update.tag}
                        size="small"
                        icon={<CircleIcon style={{ fill: color, fontSize: "small" }} />}
                        variant="outlined"
                        sx={{
                            borderColor: color,
                            color: color,
                            fontWeight: "bold",
                            textTransform: "uppercase",
                            boxShadow: "0px 0px 5px 0px rgba(0,0,0,0.75)",
                            fontSize: "10px",
                            pl: 1,
                            opacity: isHovered ? 1 : 0,
                            transition: "opacity 0.3s",
                        }}
                    />
                </Stack>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box p={3} py={0}>
                <Typography variant="body1" component="div" sx={{ fontWeight: 400, position: 'relative' }} color='text.primary'>
                    {compressed ? update.content.substring(0, maxContentLength) + "..." : update.content}
                    {compressed ?
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: '50%',
                                backgroundImage: 'linear-gradient(rgba(37, 37, 37, 0), rgba(37, 37, 37, 1))',
                            }}
                        /> : null
                    }
                </Typography>
                <Typography
                    variant="body2"
                    component="div"
                    textAlign="right"
                    sx={{ fontWeight: 600, color: 'text.disabled' }}
                    mt={1}
                    mb={2}
                >
                    {update.date.month}/{update.date.day}/{update.date.year}
                </Typography>
            </Box>

        </Paper>
    )
}