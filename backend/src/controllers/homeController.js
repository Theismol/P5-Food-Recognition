import axios from 'axios';
const imageAPIURL = "http://image-rec:3000"
const stockAPIURL = "http://ingredients:3000"
export const cloudImageRecognition = async (req, res) => {
    const { images } = req.body;

    if (!images) {
        return res.status(400).json({ error: 'No image provided' })
    }
    try {
        const response = await axios.post(`${imageAPIURL}/detect`, { images: images });
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
        const response = await axios.post(`${stockAPIURL}/add-stock`, { ingredientName: name, amount: quantity, expiry: expiry ? expiry : null })
        res.json({ message: 'Ingredient added successfully to stock' })
    }
    catch (error) {
        res.status(500).json({ error: 'Could not add ingredient' });
    }
}

