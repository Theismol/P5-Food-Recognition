import axios from 'axios';

// API endpoint where the flask app (ingredient) is running
const apiBaseUrl = 'http://127.0.0.1:3000'; // Base URL of ingredients microservice

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

// Stock API Functions
// Fetch all stock
export const getStock = async () => {
    try {
        const response = await axios.get(`${apiBaseUrl}/stock`);
        return response.data;
    } catch (error) {
        console.error("Error fetching stock:", error);
        throw error;
    }
};

// Add a new stock entry
export const addStock = async (stockData) => {
    try {
        const response = await axios.post(`${apiBaseUrl}/stock`, stockData);
        return response.data;
    } catch (error) {
        console.error("Error adding stock:", error);
        throw error;
    }
};

// Edit existing stock by ID
export const editStock = async (id, stockData) => {
    try {
        const response = await axios.put(`${apiBaseUrl}/stock/${id}`, stockData);
        return response.data;
    } catch (error) {
        console.error("Error editing stock:", error);
        throw error;
    }
};

// Remove stock by ID
export const removeStock = async (id) => {
    try {
        const response = await axios.delete(`${apiBaseUrl}/stock/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error removing stock:", error);
        throw error;
    }
};

// Expiry Dates API Functions

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

// Edit an existing expiry date
export const editExpiryDate = async (id, expiryData) => {
    try {
        const response = await axios.put(`${apiBaseUrl}/expiry_dates/${id}`, expiryData);
        return response.data;
    } catch (error) {
        console.error("Error updating expiry date:", error);
        throw error;
    }
};

// Remove an expiry date
export const removeExpiryDate = async (id) => {
    try {
        const response = await axios.delete(`${apiBaseUrl}/expiry_dates/${id}`);
        return { message: "Expiry date deleted successfully" };
    } catch (error) {
        console.error("Error deleting expiry date:", error);
        throw error;
    }
};
export default {
    getStock,
    addStock,
    removeStock,
    editStock,
    addExpiryDate,
    removeExpiryDate,
    editExpiryDate
};