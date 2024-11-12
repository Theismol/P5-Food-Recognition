import React, { useState, useEffect } from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select, Grid, Typography, IconButton, Button, TextField } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import Navbar from '../components/Navbar';

const backendUrl = "http://localhost:5000";
const drawerHeight = 54;

const Ingredients = () => {
    const [sortOption, setSortOption] = useState('');
    const [sortedIngredients, setSortedIngredients] = useState([]);
    const [selectedIngredient, setSelectedIngredient] = useState(null);
    const [originalValues, setOriginalValues] = useState(null);

    useEffect(() => {
        fetchIngredients();
        const interval = setInterval(() => fetchIngredients(), 86400000);
        return () => clearInterval(interval);
    }, []);

    const fetchIngredients = async () => {
        try {
            const response = await fetch(`${backendUrl}/stock`);
            setSortedIngredients(await response.json());
        } catch (error) {
            console.error("Error fetching ingredients:", error);
        }
    };

    const handleChangeSort = (event) => {
        const sortValue = event.target.value;
        setSortOption(sortValue);

        const sorted = [...sortedIngredients];
        sorted.sort((a, b) => 
            sortValue === 'Quantity' ? b.Amount - a.Amount : new Date(a.Expiry_date) - new Date(b.Expiry_date)
        );
        setSortedIngredients(sorted);
    };

    const handleEditIngredient = (ingredient) => {
        setSelectedIngredient(ingredient);
        setOriginalValues({ ...ingredient });
    };

    const handleEditSelectedIngredient = (e) => {
        const { name, value } = e.target;
        setSelectedIngredient((prev) => ({ ...prev, [name]: value }));
    };

    const formatDate = (dateString) => new Date(dateString).toISOString().split('T')[0];
    const formatDaysUntilExpiration = (days) => (days < 0 ? "Expired" : `${days} days`);

    const handleSaveIngredient = async () => {
        if (!selectedIngredient || !originalValues) return;
        const { id, Amount, Expiry_date } = selectedIngredient;
        const updatedStock = {};

        if (Amount !== originalValues.Amount) updatedStock.Amount = Amount;
        if (Expiry_date !== originalValues.Expiry_date) updatedStock.Expiry_date = Expiry_date;

        if (Object.keys(updatedStock).length === 0) {
            setSelectedIngredient(null);
            return;
        }

        try {
            const response = await fetch(`${backendUrl}/stock/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedStock),
            });
            if (response.ok) {
                fetchIngredients();
                setSelectedIngredient(null);
                setOriginalValues(null);
            } else {
                console.error("Failed to save stock:", await response.json());
            }
        } catch (error) {
            console.error("Error saving ingredient:", error);
        }
    };

    return (
        <Box sx={{ minWidth: 200, margin: 2 }}>
            <Navbar />
            <FormControl fullWidth sx={{ width: 200, position: 'absolute', right: 50, top: drawerHeight + 30, zIndex: 10 }}>
                <InputLabel id="sort-by-label">Sort By</InputLabel>
                <Select
                    labelId="sort-by-label"
                    id="sort-by"
                    value={sortOption}
                    label="Sort By"
                    onChange={handleChangeSort}
                    sx={{
                        bgcolor: '#75c9c8',
                        '&.Mui-focused': { bgcolor: '#75c9c8' },
                        '&:hover': { bgcolor: '#75c9c8' },
                    }}
                    MenuProps={{
                        PaperProps: {
                            sx: { bgcolor: '#75c9c8' },
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
                        <Grid item xs={12} sm={6} md={4} key={index}>
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
                                {/* Display Ingredient Name */}
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    {ingredient.Ingredient}  {/* Ingredient name */}
                                </Typography>

                                {selectedIngredient && selectedIngredient.id === ingredient.id
                                    ? (
                                        <>
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
                                            <Typography variant="body1">
                                                Quantity: {ingredient.Amount} {ingredient.Unit}
                                            </Typography>
                                            <Typography variant="body1">
                                                Expiry: {formatDate(ingredient.Expiry_date)}
                                            </Typography>
                                        </>
                                    )}

                                <Typography variant="body1">
                                    Day(s) Until Expiration: {formatDaysUntilExpiration(ingredient.Days_Until_Expiration)}
                                </Typography>

                                {selectedIngredient && selectedIngredient.id === ingredient.id && (
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
};

export default Ingredients;
