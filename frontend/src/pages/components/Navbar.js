import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useNavigate } from 'react-router-dom';


const drawerHeight = 54; // Adjust the height as needed
const Navbar = () => {
    const navigate = useNavigate(); // useNavigate hook for navigation

    const handleNavigation = (path) => {
        navigate(path);
    };

    return (
        <Drawer
            variant="permanent"
            anchor="top"
            sx={{
                top: 0, // Ensure the drawer is positioned correctly at the top
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: {
                    height: drawerHeight,
                    boxSizing: 'border-box',
                    display: 'flex',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    zIndex: 10, // Ensure the drawer is behind the dropdown
                },
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                }}
            >
                <List sx={{ display: 'flex' }}>
                    <ListItem button sx={{ cursor: 'pointer' }} onClick={() => handleNavigation('/')}>
                        <ListItemText primary="Home" />
                    </ListItem>
                    <ListItem button sx={{ cursor: 'pointer' }} onClick={() => handleNavigation('/ingredients')}>
                        <ListItemText primary="Ingredients" />
                    </ListItem>
                    <ListItem button sx={{ cursor: 'pointer' }} onClick={() => handleNavigation('/recipes')}>
                        <ListItemText primary="Recipes" />
                    </ListItem>
                </List>
            </Box>
        </Drawer>
    )
}

export default Navbar
