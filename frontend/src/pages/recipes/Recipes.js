import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useNavigate } from 'react-router-dom';

const drawerHeight = 54; // Adjust the height as needed

function Recipes() {
  const [sortOption, setSortOption] = React.useState('');
  const navigate = useNavigate(); // useNavigate hook for navigation

  const handleChange = (event) => {
    setSortOption(event.target.value);
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <Box sx={{ minWidth: 200 }}>
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
            <ListItem button sx={{ cursor: 'pointer' }} onClick={() => handleNavigation('/home')}>
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

      <Box sx={{ padding: 4, marginTop: drawerHeight, position: 'relative' }}>
        <FormControl
          sx={{
            width: 150, // Adjust the width of the dropdown menu
            position: 'absolute', // Position it absolutely within its parent container
            right: 50, // Distance from the right edge
            top: drawerHeight + 10, // Position it just below the drawer, adjust as necessary
            zIndex: 10, // Ensure dropdown is above drawer
          }}
        >
          <InputLabel id="sort-by-label">Sort By</InputLabel>
          <Select
            labelId="sort-by-label"
            id="sort-by"
            value={sortOption}
            label="Sort By"
            onChange={handleChange}
            sx={{
              bgcolor: '#75c9c8', // Background color for the Select component
              '&.Mui-focused': {
                bgcolor: '#75c9c8', // Maintain background color when focused
              },
              '&:hover': {
                bgcolor: '#75c9c8', // Maintain background color on hover
              },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: '#75c9c8', // Background color for dropdown
                  border: '1px solid #75c9c8', // Edge color for dropdown
                },
              },
            }}
          >
            <MenuItem value="Vegetarian" sx={{ color: '#000000' }}>Vegetarian</MenuItem>
            <MenuItem value="Dairy free" sx={{ color: '#000000' }}>Dairy free</MenuItem>
            <MenuItem value="Gluten free" sx={{ color: '#000000' }}>Gluten free</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
}

export default Recipes;
