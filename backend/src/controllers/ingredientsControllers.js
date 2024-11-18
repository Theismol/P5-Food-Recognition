import axios from 'axios';

// API endpoint where the flask app (ingredient) is running
const apiBaseUrl = 'http://ingredients:3000'; // Base URL of ingredients microservice

// Stock API Functions
// Fetch all stock
export const getStock = async (req, res) => {
    try {
        const response = await axios.get(`${apiBaseUrl}/stock`);
        res.status(200).json(response.data); // Forward data to frontend
    } catch (error) {
        console.error("Error fetching stock data:", error);
        res.status(500).json({ error: "Failed to fetch stock data" });
    }
};

// Edit existing stock by ID
export const editStock = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.put(`${apiBaseUrl}/stock/${id}`, req.body);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error updating stock:", error);
        res.status(500).json({ error: "Failed to update stock" });
    }
};

export default {
    getStock,
    editStock,
};
