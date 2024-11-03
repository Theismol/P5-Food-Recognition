import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Navbar from '../components/Navbar';


function Home() {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh', // Full viewport height to center vertically
            }}
        >
            <Navbar />
            <Button
                variant="contained"
                size="large"
                sx={{
                    fontSize: '1.5rem', // Make the text larger
                    padding: '16px 32px', // Increase padding for a bigger button
                }}
            >
                Add Item
            </Button>
        </Box>
    );
}

export default Home;
