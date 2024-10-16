import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

const drawerHeight = 54; // Adjust the height as needed

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

      <Drawer
        variant="permanent"
        anchor="top"
        sx={{
          height: drawerHeight,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            height: drawerHeight,
            boxSizing: 'border-box',
            display: 'flex',
            justifyContent: 'center',
            overflow: 'hidden',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center', // Center horizontally
            alignItems: 'center', // Center vertically
            width: '100%', // Take up the full width of the drawer
          }}
        >
          <List sx={{ display: 'flex' }}>
            <ListItem button sx={{ cursor: 'pointer' }}>
              <ListItemText primary="Home" />
            </ListItem>
            <ListItem button sx={{ cursor: 'pointer' }}>
              <ListItemText primary="About" />
            </ListItem>
            <ListItem button sx={{ cursor: 'pointer' }}>
              <ListItemText primary="Contact" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </Box>
  );
}

export default Home;
