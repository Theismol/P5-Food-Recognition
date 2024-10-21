import express from 'express';

const router = express.Router();

import { generateRecipes, chooseRecipe } from '../controllers/recipeController.js';






router.post('/generate-recipes', generateRecipes);
router.post('/choose-recipe', chooseRecipe);




export default router;
