import React, { useState } from 'react';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Navbar from '../components/Navbar';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import { Checkbox, ListItemText, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import axios from 'axios';

const drawerHeight = 54; // Adjust the height as needed
const dietaryRestrictionsChoices = ["Vegetarian", "Gluten free", "Dairy free", "Vegan"];

function Recipes() {
    const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [availableRecipes, setAvailableRecipes] = useState([]);

    const handleChange = (event) => {
        const {
            target: { value },
        } = event;
        setDietaryRestrictions(
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    const handleGenerateRecipes = async () => {
        try {
            const response = await axios.post('http://localhost:2000/generate-recipes', { dietPreferences: dietaryRestrictions });
            setAvailableRecipes(response.data.recipes || []);
        } catch (error) {
            console.error('Error fetching recipes:', error);
        }
    };

    const handleMakeRecipe = (recipe) => {
        setSelectedRecipe(recipe);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedRecipe(null);
    };

    const handleRecipeDone = async () => {
        if (selectedRecipe) {
            try {
                await axios.post('http://localhost:2000/choose-recipe', { recipeID: selectedRecipe.RecipeID });
                // Refresh the available recipes
                await handleGenerateRecipes();
                handleClose();
            } catch (error) {
                console.error('Error choosing recipe:', error);
            }
        }
    };

    return (
        <Box sx={{ minWidth: 200 }}>
            <Navbar />
            <Button
                variant="contained"
                onClick={handleGenerateRecipes} // Function to generate recipes
                sx={{
                    position: 'absolute',
                    right: 250,
                    height: 55,
                    marginRight: 10,
                    top: drawerHeight + 30,
                    bgcolor: '#75c9c8',
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
                    {availableRecipes.map((recipe, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index} sx={{ position: "relative" }}>
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
                                    {recipe.RecipeName}
                                </Typography>
                                <Typography variant="body1">
                                    Dietary restrictions:
                                    {(recipe.diet || []).map((diet, dietIndex) => (
                                        <Typography key={dietIndex} variant="body2">
                                            {"- " + diet}
                                        </Typography>
                                    ))}
                                </Typography>
                                <Button variant="contained" color="secondary" sx={{ position: 'absolute', right: 5, top: 5 }} onClick={() => { handleMakeRecipe(recipe) }}>Make recipe</Button>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Box>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{selectedRecipe?.RecipeName}</DialogTitle>
                <DialogContent>
                    <Typography variant="h6">Ingredients:</Typography>
                    {(selectedRecipe?.Ingredients || []).map((ingredient, index) => (
                        <Typography key={index} variant="body2">
                            - {ingredient.Ingredient} - {ingredient.Amount} {ingredient.unit}
                        </Typography>
                    ))}
                    <Typography variant="h6" sx={{ mt: 2 }}>Instructions:</Typography>
                    <Typography variant="body2">{selectedRecipe?.Instructions}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleRecipeDone} sx={{ bgcolor: "#75c9c8" }}>Recipe finished!</Button>
                    <Button onClick={handleClose} sx={{ bgcolor: "#75c9c8" }}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default Recipes;
