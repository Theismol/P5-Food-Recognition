import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get the current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the dummy data file
const dummyDataFile = join(__dirname, '../data/dummyData.json');

// Read the dummy data from the file
const readDummyData = () => {
    const data = readFileSync(dummyDataFile);
    return JSON.parse(data);
};

// Write data to the dummy data file
const writeDummyData = (data) => {
    writeFileSync(dummyDataFile, JSON.stringify(data, null, 2));
};

// Validate ingredient data
const validateIngredientData = (data) => {
    const { amount, unit, expiryDate, type } = data;
    if (!amount || !unit || !expiryDate || !type) {
        throw new Error('Missing required fields: amount, unit, expiryDate, or type');
    }
};

// Get all ingredients
export const getIngredients = (req, res) => {
    try {
        const ingredients = readDummyData();
        res.json(ingredients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add a new ingredient
export const addIngredient = (req, res) => {
    const ingredientData = req.body;

    try {
        validateIngredientData(ingredientData);
        const ingredients = readDummyData();

        const newId = ingredients.length > 0 ? Math.max(...ingredients.map(ing => ing.id)) + 1 : 1;

        const newIngredient = { id: newId, ...ingredientData };
        ingredients.push(newIngredient);
        writeDummyData(ingredients);
        res.status(201).json(newIngredient);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Edit an ingredient
export const editIngredient = (req, res) => {
    const { id } = req.params;
    const ingredientData = req.body;

    try {
        validateIngredientData(ingredientData);
        const ingredients = readDummyData();
        const ingredient = ingredients.find((ing) => ing.id === parseInt(id));

        if (!ingredient) {
            return res.status(404).json({ message: 'Ingredient not found' });
        }

        Object.assign(ingredient, ingredientData);
        writeDummyData(ingredients);
        res.json(ingredient);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Remove an ingredient
export const removeIngredient = (req, res) => {
    const { id } = req.params;
    console.log(`Removing ingredient with ID: ${id}`);

    try {
        let ingredients = readDummyData();
        const initialLength = ingredients.length;

        ingredients = ingredients.filter((ing) => ing.id !== parseInt(id));

        if (ingredients.length === initialLength) {
            return res.status(404).json({ message: 'Ingredient not found' });
        }

        writeDummyData(ingredients);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export default {
    getIngredients,
    addIngredient,
    editIngredient,
    removeIngredient
};
