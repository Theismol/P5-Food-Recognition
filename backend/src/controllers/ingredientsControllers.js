import axios from 'axios';

// API endpoint where the flask app (ingredient) is running
const apiBaseUrl = 'http://127.0.0.1:5000'; // Base URL of ingredients microservice

// Ingredients Service Functions

// Fetch all ingredients
export const getIngredients = async () => {
    try {
        const response = await axios.get(`${apiBaseUrl}/ingredients`);
        return response.data;
    } catch (error) {
        console.error("Error fetching ingredients:", error);
        throw error;
    }
};

// Add a new ingredient
export const addIngredient = async (ingredientData) => {
    try {
        const response = await axios.post(`${apiBaseUrl}/ingredients`, ingredientData); // Matches Flask POST `/ingredients`
        return response.data;
    } catch (error) {
        console.error("Error adding ingredient:", error);
        throw error;
    }
};

// Edit an existing ingredient
export const editIngredient = async (id, updatedData) => {
    try {
        const response = await axios.put(`${apiBaseUrl}/ingredients/${id}`, updatedData); // Matches Flask PUT `/ingredients/<id>`
        return response.data;
    } catch (error) {
        console.error("Error editing ingredient:", error);
        throw error;
    }
};

// Remove an ingredient
export const removeIngredient = async (id) => {
    try {
        await axios.delete(`${apiBaseUrl}/ingredients/${id}`); // Matches Flask DELETE `/ingredients/<id>`
    } catch (error) {
        console.error("Error removing ingredient:", error);
        throw error;
    }
};

// Stock Service Functions

// Fetch all stock entries
export const getStock = async () => {
    try {
        const response = await axios.get(`${apiBaseUrl}/stock`);
        return response.data;
    } catch (error) {
        console.error("Error fetching stock:", error);
        throw error;
    }
};

// Add new stock
export const addStock = async (stockData) => {
    try {
        const response = await axios.post(`${apiBaseUrl}/stock`, stockData);
        return response.data;
    } catch (error) {
        console.error("Error adding stock:", error);
        throw error;
    }
};

//Expiry Date Service Functions

// Fetch all expiry dates
export const getExpiryDates = async () => {
    try {
        const response = await axios.get(`${apiBaseUrl}/expiry_dates`);
        return response.data;
    } catch (error) {
        console.error("Error fetching expiry dates:", error);
        throw error;
    }
};

// Add a new expiry date
export const addExpiryDate = async (expiryData) => {
    try {
        const response = await axios.post(`${apiBaseUrl}/expiry_dates`, expiryData);
        return response.data;
    } catch (error) {
        console.error("Error adding expiry date:", error);
        throw error;
    }
};

//Recipes-Ingredients Join Table Service Functions

// Link a recipe with an ingredient
export const addRecipeIngredientLink = async (linkData) => {
    try {
        const response = await axios.post(`${apiBaseUrl}/recipes_has_ingredients`, linkData);
        return response.data;
    } catch (error) {
        console.error("Error linking recipe with ingredient:", error);
        throw error;
    }
};

// Unlink a recipe from an ingredient
export const removeRecipeIngredientLink = async (linkData) => {
    try {
        await axios.delete(`${apiBaseUrl}/recipes_has_ingredients`, { data: linkData });
    } catch (error) {
        console.error("Error unlinking recipe from ingredient:", error);
        throw error;
    }
};

export default {
    getIngredients,
    addIngredient,
    editIngredient,
    removeIngredient,
    //delete stock 
    getStock,
    addStock,
    getExpiryDates,
    addExpiryDate,
    addRecipeIngredientLink,
    removeRecipeIngredientLink,
};
