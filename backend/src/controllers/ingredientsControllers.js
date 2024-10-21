import axios from 'axios'; // Import axios for external HTTP requests

// Function to connect to the database and execute a query
/*const executeQuery = async (query) => {
    try {
        const result = await sql.query(query);
        return result.recordset;
    } catch (error) {
        console.error('SQL error', error);
        throw error;
    }
};*/

// Manual validation function
const validateIngredientData = (data) => {
    const { amount, unit, expiryDate, type } = data;
    if (!amount || !unit || !expiryDate || !type) {
        throw new Error('Missing required fields: amount, unit, expiryDate, or type');
    }
};

// Get all ingredients
export const getIngredients = async (req, res) => {
    const query = 'SELECT * FROM Ingredients';
    try {
    
        const ingredients = await executeQuery(query);
        res.json(ingredients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add a new ingredient and notify external service via Axios
export const addIngredient = async (req, res) => {
    try {
        validateIngredientData(req.body);
    } catch (error) {
        return res.status(400).json({ message: error.message }); 
    }

    const { amount, unit, expiryDate, type } = req.body;
    const query = `INSERT INTO Ingredients (amount, unit, expiryDate, type) VALUES (${amount}, '${unit}', '${expiryDate}', '${type}')`;

    try {
        await executeQuery(query);

        const response = await axios.post('....', {
            amount,
            unit,
            expiryDate,
            type
        });

        res.status(201).json({ message: 'Ingredient added successfully', externalResponse: response.data });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
    
};

// Edit an ingredient and notify external service via Axios
export const editIngredient = async (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({ message: 'Invalid ID parameter' });
    }

    try {
        validateIngredientData(req.body);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }

    const { amount, unit, expiryDate, type } = req.body;
    const query = `UPDATE Ingredients SET amount = ${amount}, unit = '${unit}', expiryDate = '${expiryDate}', type = '${type}' WHERE id = ${id}`;

    try {
        // Execute the SQL query to update the ingredient
        await executeQuery(query);

        const response = await axios.post('...', {
            id,
            amount,
            unit,
            expiryDate,
            type
        });

        res.json({ message: 'Ingredient updated successfully', externalResponse: response.data });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Remove an ingredient and notify external service via Axios
export const removeIngredient = async (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({ message: 'Invalid ID parameter' });
    }

    const query = `DELETE FROM Ingredients WHERE id = ${id}`;

    try {
        // Execute the SQL query to delete the ingredient
        await executeQuery(query);

        const response = await axios.post('....', { id });

        res.status(204).json({ message: 'Ingredient deleted successfully', externalResponse: response.data });
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
