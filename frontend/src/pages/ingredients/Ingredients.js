import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import Navbar from '../components/Navbar';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import { TextField } from '@mui/material';


const drawerHeight = 54; // Adjust the height as needed

const initialIngredients = [
    { name: 'Tomato', quantity: 3, unit: 'Pcs', expiry: '2024-11-01', daysInStock: 10 },
    { name: 'Milk', quantity: 1, unit: 'Liter', expiry: '2024-10-20', daysInStock: 5 },
    { name: 'Eggs', quantity: 12, unit: 'Pcs', expiry: '2024-10-18', daysInStock: 7 },
    { name: 'Butter', quantity: 200, unit: 'Gram', expiry: '2024-12-15', daysInStock: 15 },
];

function Ingredients() {
    const [sortOption, setSortOption] = useState('');
    const [sortedIngredients, setSortedIngredients] = useState(initialIngredients);
    const [selectedIngredient, setSelectedIngredient] = useState(null);
    useEffect(() => {
        fetchIngredients();
    })
    const handleChangeSort = (event) => {
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
    const handleEditIngredient = (ingredient) => {
        setSelectedIngredient(ingredient)
    }
    const handleEditSelectedIngredient = (e) => {
        const { name, value } = e.target;
        setSelectedIngredient((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    };
    const handleSaveIngredient = () => {
        const { name, quantity, expiry } = selectedIngredient;
        //Axios call backend to update stock for this ingredient
        fetchIngredients();
        return
    }

    const fetchIngredients = () => {
        //Call backend to get ingredients for this site
        return
    }
    return (
        <Box sx={{ minWidth: 200, margin: 2 }}>
            <Navbar />
            <FormControl
                fullWidth
                sx={{
                    width: 200, // Adjust the width of the dropdown menu
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
                    onChange={handleChangeSort}
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
                <Grid container spacing={2} columns={12}>
                    {sortedIngredients.map((ingredient, index) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                            <Box
                                sx={{
                                    border: '1px solid #ccc',
                                    borderRadius: 2,
                                    padding: 2,
                                    backgroundColor: '#c0b9dd', // Restored background color
                                    color: '#000000', // Ensure text is black
                                    boxShadow: 1,
                                    position: 'relative'
                                }}
                            >
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    {ingredient.name}
                                </Typography>
                                {selectedIngredient && selectedIngredient.name === ingredient.name
                                    ? (<TextField
                                        label="Quantity"
                                        name="quantity"
                                        type="number"
                                        value={selectedIngredient.quantity}
                                        onChange={handleEditSelectedIngredient}
                                        fullWidth
                                        margin="normal"
                                        InputProps={{ inputProps: { min: 0 } }} // Optional: Prevent negative numbers
                                    />)
                                    : (<Typography variant="body1">
                                        Quantity: {ingredient.quantity} {ingredient.unit}
                                    </Typography>)}
                                {selectedIngredient && selectedIngredient.name === ingredient.name
                                    ? (<TextField
                                        label="Expiry"
                                        name="expiry"
                                        type="date" // Date type for expiry
                                        value={formatDate(selectedIngredient.expiry)}
                                        onChange={handleEditSelectedIngredient}
                                        fullWidth
                                        margin="normal"
                                        InputLabelProps={{ shrink: true }} // Keep the label shrunk for date input
                                    />)
                                    :
                                    (<Typography variant="body1">
                                        Expiry: {formatDate(ingredient.expiry)}
                                    </Typography>
                                    )}
                                <Typography variant="body1">
                                    Days in Stock: {ingredient.daysInStock}
                                </Typography>
                                {selectedIngredient && selectedIngredient.name === ingredient.name
                                    && (<Button variant="contained" color="secondary" sx={{ position: 'absolute', bottom: 5, right: 5 }} onClick={handleSaveIngredient}>Save</Button>)}
                                <IconButton sx={{ position: 'absolute', top: 0, right: 0, color: '#000000' }} onClick={() => handleEditIngredient(ingredient)}>
                                    <EditIcon />
                                </IconButton>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Box >
    );
}

export default Ingredients;
