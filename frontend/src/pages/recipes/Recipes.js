import * as React from 'react';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Navbar from '../components/Navbar';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import { Checkbox, ListItemText, Button } from '@mui/material';

const drawerHeight = 54; // Adjust the height as needed
const recipes = [
    { name: 'chicken tikka masala', diet: ["Gluten free"] },
    { name: 'Vegetable lasagna', diet: ["Vegetarian"] },
    { name: 'Cabbage stir fry', diet: ["Vegan", "Vegetarian", "Dairy free"] },
    { name: 'Spaghetti carbonara', diet: [""] },
];

const dietaryRestrictionsChoices = ["Vegetarian", "Gluten free", "Dairy free", "Vegan"]
function Recipes() {
    const [dietaryRestrictions, setDietaryRestrictions] = React.useState([]);

    const handleChange = (event) => {

        const {
            target: { value },
        } = event;
        setDietaryRestrictions(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );
    };
    const onGenerateRecipes = () => {
        console.log("generated");
    }


    return (
        <Box sx={{ minWidth: 200 }}>
            <Navbar />
            <Button
                variant="contained"
                onClick={onGenerateRecipes} // Function to generate recipes
                sx={{
                    position: 'absolute', // Align it similarly to dropdown
                    right: 250,
                    height: 55,
                    marginRight: 10,
                    top: drawerHeight + 30, // Place it just below the dropdown
                    bgcolor: '#75c9c8', // Background color matching dropdown
                    color: '#ffffff', // Text color
                    '&:hover': {
                        bgcolor: '#67b3b2', // Slightly different color on hover
                    },
                }}
            >
                Generate Recipes
            </Button>
            <FormControl
                sx={{
                    width: 200, // Adjust the width of the dropdown menu
                    position: 'absolute', // Position it absolutely within its parent container
                    right: 50, // Distance from the right edge
                    top: drawerHeight + 30, // Position it just below the drawer, adjust as necessary
                    zIndex: 10, // Ensure dropdown is above drawer
                }}
            >
                <InputLabel id="dietary-restrictions-label">Restrictions</InputLabel>
                <Select
                    labelId="dietary-restrictions-label"
                    id="dietary-restrictions"
                    multiple
                    value={dietaryRestrictions}
                    label="dietary-restrictions"
                    renderValue={(selected) => selected.join(', ')}
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
                                maxHeight: 200
                            },
                        },
                    }}
                >
                    {dietaryRestrictionsChoices.map((restriction) => (
                        <MenuItem key={restriction} value={restriction} sx={{ color: '#000000' }}>
                            <Checkbox checked={dietaryRestrictions.includes(restriction)} />
                            <ListItemText primary={restriction} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <Box sx={{ padding: 4, marginTop: 15 }}>
                <Grid container spacing={2} columns={12}>
                    {recipes.map((recipe, index) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
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
                                    {recipe.name}
                                </Typography>
                                <Typography variant="body1">
                                    Dietary restrictions:
                                    {recipe.diet.map((diet) => (
                                        <Typography variant="body2">
                                            {"- " + diet}
                                        </Typography>
                                    ))}
                                </Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Box>

        </Box>

    );
}

export default Recipes;
