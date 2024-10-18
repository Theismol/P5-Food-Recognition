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
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

const drawerHeight = 54; // Adjust the height as needed

const ingredients = [
    { name: 'Tomato', quantity: '3 pcs', expiry: '2024-11-01', daysInStock: 10 },
    { name: 'Milk', quantity: '1 L', expiry: '2024-10-20', daysInStock: 5 },
    { name: 'Eggs', quantity: '12 pcs', expiry: '2024-10-18', daysInStock: 7 },
    { name: 'Butter', quantity: '200 g', expiry: '2024-12-15', daysInStock: 15 },
];

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
                    <MenuItem value="Expiry">Expiry</MenuItem>
                    <MenuItem value="Food group">Food group</MenuItem>
                    <MenuItem value="Quantity">Quantity</MenuItem>
                </Select>
            </FormControl>

            <Box sx={{ padding: 4 }}>
                <Grid container spacing={2}>
                    {ingredients.map((ingredient, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Box
                                sx={{
                                    border: '1px solid #ccc',
                                    borderRadius: 2,
                                    padding: 2,                                   
                                    boxShadow: 1,
                                }}
                            >
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    {ingredient.name}
                                </Typography>
                                <Typography variant="body1">
                                    Quantity: {ingredient.quantity}
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
