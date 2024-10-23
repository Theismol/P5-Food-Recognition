import axios from 'axios';




export const generateRecipes = async (req, res) => {
    const { dietPreferences } = req.body;
    try {
        const response = await axios.post('http://localhost:5000/generate-recipes', { dietPreferences: dietPreferences });
        res.json(response.data);
    }
    catch (error) {
        res.status(500).json({ error: 'Could not generate recipes' });
    }
}


export const chooseRecipe = async (req, res) => {
    const { recipeID } = req.body;
    try {
        const response = await axios.post('http://localhost:5000/choose-recipe', { recipeID: recipeID });
        res.json({ message: "Recipe chosen succesfully. Ingredients are removed from stock automatically!" });
    }
    catch {
        res.status(500).json({ error: 'Could not choose recipe' });
    }
}
