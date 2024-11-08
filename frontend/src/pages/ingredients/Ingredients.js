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

const drawerHeight = 54;
const backendUrl = "http://localhost:5000";

function Ingredients() {
    const [sortOption, setSortOption] = useState('');
    const [sortedIngredients, setSortedIngredients] = useState([]);
    const [selectedIngredient, setSelectedIngredient] = useState(null);
    const [originalValues, setOriginalValues] = useState(null); // Track original values

    // Fetch ingredients from the backend
    const fetchIngredients = async () => {
        try {
            const response = await fetch(`${backendUrl}/stock`);
            const data = await response.json();

            setSortedIngredients(data);
        } catch (error) {
            console.error("Error fetching ingredients:", error);
        }
    };

    useEffect(() => {
        fetchIngredients();
        
        // Periodic refresh every 24 hours
        const interval = setInterval(() => {
            fetchIngredients();
        }, 86400000);

        return () => clearInterval(interval);  // Cleanup on unmount
    }, []);  // Empty dependency array to call only on mount

    // Handle sorting based on user selection
    const handleChangeSort = (event) => {
        const sortValue = event.target.value;
        setSortOption(sortValue);

        let sorted = [...sortedIngredients];
        if (sortValue === 'Quantity') {
            sorted.sort((a, b) => b.Amount - a.Amount);
        } else if (sortValue === 'Expiry') {
            sorted.sort((a, b) => new Date(a.Expiry_date) - new Date(b.Expiry_date));
        }

        setSortedIngredients(sorted);
    };

    // Start editing an ingredient (triggered by clicking "Edit")
    const handleEditIngredient = (ingredient) => {
        setSelectedIngredient(ingredient);
        setOriginalValues({ ...ingredient }); // Save original values when editing starts
    };

    // Handle changes in the input fields for editing
    const handleEditSelectedIngredient = (e) => {
        const { name, value } = e.target;
        setSelectedIngredient((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Format date to 'YYYY-MM-DD'
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    // Save or update the ingredient's stock data in the backend
    const handleSaveIngredient = async () => {
        if (!selectedIngredient || !originalValues) return;

        const { id, Amount, Expiry_date } = selectedIngredient;

        // Create an object to store only the fields that have been modified
        const updatedStock = {};

        // Compare current values with original values and add only the changed fields
        if (Amount !== originalValues.Amount) {
            updatedStock.Amount = Amount;
        }
        if (Expiry_date !== originalValues.Expiry_date) {
            updatedStock.Expiry_date = Expiry_date;
        }

        // If no fields have been modified, skip the update
        if (Object.keys(updatedStock).length === 0) {
            console.log("No changes to save.");
            setSelectedIngredient(null);
            return;
        }

        try {
            const response = await fetch(`${backendUrl}/stock/${id}`, {
                method: 'PUT',  // Use PUT for updating
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedStock),
            });

            if (response.ok) {
                console.log("Stock updated successfully");
                fetchIngredients();  // Refresh the ingredients list after saving/updating

                // Reset selectedIngredient and originalValues to return to the initial state
                setSelectedIngredient(null);
                setOriginalValues(null);
            } else {
                console.error("Failed to save stock:", await response.json());
            }
        } catch (error) {
            console.error("Error saving ingredient:", error);
        }
    };

    // Format Days_in_Stock for display
    const formatDaysInStock = (days) => {
        if (days < 0) return "Expired";
        return `${days} days`;
    };

    return (
        <Box sx={{ minWidth: 200, margin: 2 }}>
            <Navbar />
            <FormControl
                fullWidth
                sx={{
                    width: 200,
                    position: 'absolute',
                    right: 50,
                    top: drawerHeight + 30,
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
                        bgcolor: '#75c9c8',
                        '&.Mui-focused': {
                            bgcolor: '#75c9c8',
                        },
                        '&:hover': {
                            bgcolor: '#75c9c8',
                        },
                    }}
                    MenuProps={{
                        PaperProps: {
                            sx: {
                                bgcolor: '#75c9c8',
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
                                    backgroundColor: '#c0b9dd',
                                    color: '#000000',
                                    boxShadow: 1,
                                    position: 'relative'
                                }}
                            >
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    {ingredient.Ingredient}
                                </Typography>
                                {selectedIngredient && selectedIngredient.id === ingredient.id
                                    ? (
                                        <>
                                            {/* Editable fields */}
                                            <TextField
                                                label="Quantity"
                                                name="Amount"
                                                type="number"
                                                value={selectedIngredient.Amount}
                                                onChange={handleEditSelectedIngredient}
                                                fullWidth
                                                margin="normal"
                                                InputProps={{ inputProps: { min: 0 } }}
                                            />
                                            <TextField
                                                label="Expiry"
                                                name="Expiry_date"
                                                type="date"
                                                value={formatDate(selectedIngredient.Expiry_date)}
                                                onChange={handleEditSelectedIngredient}
                                                fullWidth
                                                margin="normal"
                                                InputLabelProps={{ shrink: true }}
                                            />
                                        </>
                                    )
                                    : (
                                        <>
                                            {/* Non-editable fields */}
                                            <Typography variant="body1">
                                                Quantity: {ingredient.Amount} {ingredient.Unit}
                                            </Typography>
                                            <Typography variant="body1">
                                                Expiry: {formatDate(ingredient.Expiry_date)}
                                            </Typography>
                                        </>
                                    )}
                                <Typography variant="body1">
                                    Days in Stock: {formatDaysInStock(ingredient.Days_in_Stock)}
                                </Typography>
                                {selectedIngredient && selectedIngredient.id === ingredient.id
                                    && (
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            sx={{ position: 'absolute', bottom: 5, right: 5 }}
                                            onClick={handleSaveIngredient}
                                        >
                                            Save
                                        </Button>
                                    )}
                                <IconButton
                                    sx={{ position: 'absolute', top: 0, right: 0, color: '#000000' }}
                                    onClick={() => handleEditIngredient(ingredient)}
                                >
                                    <EditIcon />
                                </IconButton>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Box>
    );
}

export default Ingredients;
