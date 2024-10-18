import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

const drawerHeight = 54; // Adjust the height as needed


    

function Recipes() {
    const [sortOption, setSortOption] = React.useState('');
  
    const handleChange = (event) => {
      setSortOption(event.target.value);
    };

  return (
    <Box sx={{ minWidth: 200, margin: 2 }}>
      <FormControl fullWidth>
        <InputLabel id="sort-by-label">Sort By</InputLabel>
        <Select
          labelId="sort-by-label"
          id="sort-by"
          value={sortOption}
          label="Sort By"
          onChange={handleChange}
        >
          <MenuItem value="Vegetarian">Vegetarian</MenuItem>
          <MenuItem value="Dairy free">Dairy free</MenuItem>
          <MenuItem value="Gluten free">Gluten free</MenuItem>
          
          
        </Select>
      </FormControl>    
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
              <ListItemText primary="Ingredients" />
            </ListItem>
            <ListItem button sx={{ cursor: 'pointer' }}>
              <ListItemText primary="Recipes" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </Box>
  );
}
export default Recipes;
