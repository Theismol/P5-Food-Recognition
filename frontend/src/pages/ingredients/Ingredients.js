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
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';


const drawerHeight = 54; // Adjust the height as needed

const initialIngredients = [
  { name: 'Tomato', quantity: 3, unit: 'Pcs', expiry: '2024-11-01', daysInStock: 10 },
  { name: 'Milk', quantity: 1, unit: 'Liter', expiry: '2024-10-20', daysInStock: 5 },
  { name: 'Eggs', quantity: 12, unit: 'Pcs', expiry: '2024-10-18', daysInStock: 7 },
  { name: 'Butter', quantity: 200, unit: 'Gram', expiry: '2024-12-15', daysInStock: 15 },
];

function Recipes() {
  const [sortOption, setSortOption] = React.useState('');
  const [sortedIngredients, setSortedIngredients] = React.useState(initialIngredients);
  const navigate = useNavigate(); // useNavigate hook for navigation


  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleChange = (event) => {
    const sortValue = event.target.value;
    setSortOption(sortValue);

    let sorted = [...initialIngredients];
    if (sortValue === 'Quantity') {
      // Sort by quantity in descending order
      sorted.sort((a, b) => b.quantity - a.quantity);
    } else if (sortValue === 'Expiry') {
      // Sort by expiry date in ascending order (nearest expiry first)
      sorted.sort((a, b) => new Date(a.expiry) - new Date(b.expiry));
    }

    setSortedIngredients(sorted);
  };

  return (
    <Box sx={{ minWidth: 200, margin: 2 }}>
      <FormControl
        fullWidth
        sx={{
          width: 150, // Adjust the width of the dropdown menu
          position: 'absolute', // Position it absolutely within its parent container
          right: 50, // Distance from the right edge
          top: drawerHeight + 30, // Position it below the drawer
          zIndex: 10,
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
              },
            },
          }}
        >
          <MenuItem value="Expiry">Expiry</MenuItem>
          <MenuItem value="Quantity">Quantity</MenuItem>
        </Select>
      </FormControl>

      <Box sx={{ padding: 4, marginTop: 15 }}>
        <Grid container spacing={2}>
          {sortedIngredients.map((ingredient, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Box
                sx={{
                  border: '1px solid #ccc',
                  borderRadius: 2,
                  padding: 2,
                  backgroundColor: '#c0b9dd', // Restored background color
                  color: '#000000', // Ensure text is black
                  boxShadow: 1,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {ingredient.name}
                </Typography>
                <Typography variant="body1">
                  Quantity: {ingredient.quantity} {ingredient.unit}
                </Typography>
                <Typography variant="body1">
                  Expiry: {ingredient.expiry}
                </Typography>
                <Typography variant="body1">
                  Days in Stock: {ingredient.daysInStock}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

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
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
          }}//
          //
        >
          
          <List sx={{ display: 'flex' }}>
            <ListItem button sx={{ cursor: 'pointer' }} onClick={() => handleNavigation('/')}>
              <ListItemText primary="Home" sx={{ color: '#000000' }} />
            </ListItem>
            <ListItem button sx={{ cursor: 'pointer' }} onClick={() => handleNavigation('/ingredients')}>
              <ListItemText primary="Ingredients" sx={{ color: '#000000' }} />
            </ListItem>
            <ListItem button sx={{ cursor: 'pointer' }} onClick={() => handleNavigation('/recipes')}>
              <ListItemText primary="Recipes" sx={{ color: '#000000' }} />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </Box>
  );
}

export default Recipes;
