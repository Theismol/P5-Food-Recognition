import axios from 'axios';

const apiBaseUrl = 'http://localhost:4000'; // Base URL of your ingredients microservice

// Fetch all ingredients from the microservice
export const getIngredients = async (req, res) => {
    try {
        const response = await axios.get(`${apiBaseUrl}/ingredients`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add a new ingredient by calling the microservice
export const addIngredient = async (req, res) => {
    try {
        const response = await axios.post(`${apiBaseUrl}/ingredients`, req.body);
        res.status(201).json(response.data);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Edit an ingredient by calling the microservice
export const editIngredient = async (req, res) => {
    const { id } = req.params;
    try {
        const response = await axios.put(`${apiBaseUrl}/ingredients/${id}`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Remove an ingredient by calling the microservice
export const removeIngredient = async (req, res) => {
    const { id } = req.params;
    try {
        const response = await axios.delete(`${apiBaseUrl}/ingredients/${id}`);
        res.status(204).json(response.data);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export default {
    getIngredients,
    addIngredient,
    editIngredient,
    removeIngredient
};
