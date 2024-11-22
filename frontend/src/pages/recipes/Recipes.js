import React, { useState, useEffect } from 'react';
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


const backendURL = process.env.REACT_APP_API_URL;
function Recipes() {
    const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [availableRecipes, setAvailableRecipes] = useState([]);
    const [numberOfPeople, setNumberOfPeople] = useState(4); // Default to 4 people
    const [adjustedIngredients, setAdjustedIngredients] = useState([]);

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
            const response = await axios.post(`${backendURL}/api/recipe/generate-recipes`, { dietPreferences: dietaryRestrictions });
            setAvailableRecipes(response.data.recipes || []);
        } catch (error) {
            console.error('Error fetching recipes:', error);
        }
    };

    const handleMakeRecipe = (recipe) => {
        setSelectedRecipe(recipe);
        setNumberOfPeople(recipe.NumberOfPeople); // Set default number of people from the recipe
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedRecipe(null);
    };

    const handleRecipeDone = async () => {
        if (selectedRecipe) {
            try {
                await axios.post(`${backendURL}/api/recipe/choose-recipe`, {
                    recipeID: selectedRecipe.RecipeID,
                    numberOfPeople: numberOfPeople, // Include number of people in the request
                });
                await handleGenerateRecipes(); // Refresh the available recipes
                handleClose();
            } catch (error) {
                console.error("Error choosing recipe:", error);
            }
        }
    };

    const handleNumberOfPeopleChange = (event) => {
        const newCount = event.target.value;
        setNumberOfPeople(newCount);
    };

    useEffect(() => {
        if (selectedRecipe && selectedRecipe.Ingredients) {
            const scaleFactor = numberOfPeople / selectedRecipe.NumberOfPeople;
            const updatedIngredients = selectedRecipe.Ingredients.map((ingredient) => ({
                ...ingredient,
                Amount: (ingredient.Amount * scaleFactor).toFixed(2),
            }));
            setAdjustedIngredients(updatedIngredients);
        }
    }, [numberOfPeople, selectedRecipe]);

    return (
        <Box sx={{ minWidth: 200 }}>
            <Navbar />
            <Button
                variant="contained"
                onClick={handleGenerateRecipes}
                sx={{
                    position: 'absolute',
                    right: 250,
                    height: 55,
                    marginRight: 10,
                    top: 54 + 30,
                    bgcolor: '#75c9c8',
                    '&:hover': {
                        bgcolor: '#67b3b2',
                    },
                }}
            >
                Generate Recipes
            </Button>
            <FormControl
                sx={{
                    width: 200,
                    position: 'absolute',
                    right: 50,
                    top: 54 + 30,
                    zIndex: 10,
                }}
            >
                <InputLabel id="dietary-restrictions-label">Restrictions</InputLabel>
                <Select
                    labelId="dietary-restrictions-label"
                    id="dietary-restrictions"
                    multiple
                    value={dietaryRestrictions}
                    onChange={handleChange}
                    sx={{
                        bgcolor: '#75c9c8',
                        '&.Mui-focused': { bgcolor: '#75c9c8' },
                        '&:hover': { bgcolor: '#75c9c8' },
                    }}
                    MenuProps={{
                        PaperProps: {
                            sx: {
                                bgcolor: '#75c9c8',
                                border: '1px solid #75c9c8',
                                maxHeight: 200,
                            },
                        },
                    }}
                >
                    {["Vegetarian", "Gluten free", "Dairy free", "Vegan"].map((restriction) => (
                        <MenuItem key={restriction} value={restriction}>
                            <Checkbox checked={dietaryRestrictions.includes(restriction)} />
                            <ListItemText primary={restriction} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <Box sx={{ padding: 4, marginTop: 15, width: '100vw' }}>
                <Grid container spacing={2} columns={12}>
                    {availableRecipes.map((recipe, index) => (
                        <Grid item xs={12} sm={6} md={4} lg={4} xl={4} key={index} sx={{ position: "relative" }}>
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
                                <Button variant="contained" color="secondary" sx={{ position: 'absolute', bottom: 5, right: 5 }} onClick={() => { handleMakeRecipe(recipe) }}>Make</Button>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Box>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{selectedRecipe?.RecipeName}</DialogTitle>
                <DialogContent>
                    <Typography variant="h6">Number of People:</Typography>
                    <FormControl fullWidth>
                        <Select value={numberOfPeople} onChange={handleNumberOfPeopleChange}>
                            {[2, 3, 4, 5, 6, 7, 8].map((number) => (
                                <MenuItem key={number} value={number}>{number}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Typography variant="h6" sx={{ mt: 2 }}>Ingredients:</Typography>
                    {adjustedIngredients.map((ingredient, index) => (
                        <Typography key={index}>
                            - {ingredient.Ingredient}: {ingredient.Amount} {ingredient.unit}
                        </Typography>
                    ))}
                    <Typography variant="h6" sx={{ mt: 2 }}>Instructions:</Typography>
                    <Typography>{selectedRecipe?.Instructions}</Typography>
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
