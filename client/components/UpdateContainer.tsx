import React from 'react';
import { Box, Stack } from '@mui/material';
import { useState } from 'react';
import UpdateCard from './UpdateCard';

export const tags = [
    { color: '#2196f3', label: 'Devlog' },
    { color: '#f44336', label: 'Update' },
    { color: '#4caf50', label: 'Event' },
    { color: '#ff9800', label: 'Upkeep' },
    { color: '#9e9e9e', label: 'Misc' }
];

export type Tag = typeof tags[number];

export type TagName = Tag['label'];

export type Update = {
    title: string;
    content: string;
    date: {
        year: number;
        month: number;
        day: number;
    }
    tag: TagName;
    expanded: boolean;
}

export default function UpdateContainer() {
    const db: Update[] = [
        {
            title: 'New game addition',
            content: 'A Project Zomboid server has been added (whitelist only). If you\'re interested in joining, contact me on Discord at \'jomity\'. The server is currently running on build 41, but will be updated to build 42 when it is released. Also, Minecraft has been temporarily taken down due to lack of resources.',
            date: {
                year: 2023,
                month: 8,
                day: 25
            },
            tag: 'Update',
            expanded: false
        },
        {
            title: 'Website completed!',
            content: 'The back-end, with Node and Express, is now done. The website is now fully functional! The next step is to add more content and perhaps other pages. Thanks for visiting and checking out my work. If you have any questions, reach out to me at jomity@hotmail.com or on Discord at \'jomity\'.',
            date: {
                year: 2023,
                month: 8,
                day: 18
            },
            tag: 'Devlog',
            expanded: false
        },
        {
            title: 'Front-end progress',
            content: 'The front-end has been completed! It uses React and Material UI.',
            date: {
                year: 2023,
                month: 8,
                day: 17
            },
            tag: 'Devlog',
            expanded: false
        },
        {
            title: 'Up and running!',
            content: 'The website is now online! Development is still underway, but the website is now available to the public.',
            date: {
                year: 2023,
                month: 8,
                day: 16
            },
            tag: 'Devlog',
            expanded: false
        }
    ];
    
    const [updates, setUpdates] = useState(db);
    
    const toggleExpanded = (index: number) => {
        const newUpdates = [...updates];
        newUpdates[index].expanded = !newUpdates[index].expanded;
        setUpdates(newUpdates);
    }

    return (
        <Box
            sx={{
                display: { xs: 'none', sm: 'block' },
                position: 'relative',
                overflowY: 'scroll',
                overflowX: 'hidden',
                maxHeight: '100vh',
                '&::-webkit-scrollbar': {
                    display: 'none'
                }
            }}
        >
            <Stack direction="column" justifyContent='flex-start' alignItems='center' p={2} gap={2}>
                {updates.map((update, index) => (
                    <UpdateCard key={index} update={update} toggleExpanded={() => toggleExpanded(index)} />
                ))}

                <Box sx={{ minHeight: '50vh' }} />
            </Stack>
        </Box>
    )
}