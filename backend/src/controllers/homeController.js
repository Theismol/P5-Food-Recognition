import axios from 'axios';

export const cloudImageRecognition = async (req, res) => {
    console.log("You did it");
    const { image } = req.body;

    if (!image) {
        return res.status(400).json({ error: 'No image provided' })
    }
    try {
        const response = await axios.post('PATH-TO-IMAGE-RECOGNITION-MICROSERVICE', { image: image });
        res.json(response.data)
    }
    catch (error) {
        res.status(500).json({ error: 'Recognition failed' })
    };
};



export const addIngredientToStock = async (req, res) => {
    const { name, quantity, expiry } = req.body;

    if (!name || !quantity) {
        return res.status(400).json({ error: 'No name or quantity provided' });
    };

    try {
        const response = await axios.post('PATH-TO-ADD-INGREDIENT-MICROSERVICE', { name: name, quantity: quantity, expiry: expiry ? expiry : null })
        res.json({ message: 'Ingredient added successfully to stock' })
    }
    catch (error) {
        res.status(500).json({ error: 'Could not add ingredient' });
    }
}

