import React, { useRef, useCallback, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Navbar from '../components/Navbar';
import Webcam from 'react-webcam';

function Home() {
    const webcamRef = useRef(null)
    const [open, setOpen] = useState(false);
    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        console.log(imageSrc);
    }, [webcamRef]);
    const handleOpen = () => {
        setOpen(true);
    }
    const handleClose = () => {
        setOpen(false);
    }
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
                onClick={handleOpen}
                variant="contained"
                size="large"
                sx={{
                    fontSize: '1.5rem', // Make the text larger
                    padding: '16px 32px', // Increase padding for a bigger button
                }}
            >
                Add Item
            </Button>
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>Please put your grocery up to the camera</DialogTitle>
                <DialogContent>
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        width="100%" // Adjust width to fit the modal
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} variant="outlined">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default Home;
