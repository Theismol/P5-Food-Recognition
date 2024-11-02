import express from 'express';
import ingredientsControllers from '../controllers/ingredientsControllers.js';

const router = express.Router();


// Define routes to match Flask API structure
router.get('/', ingredientsControllers.getIngredients);  // Matches GET /ingredients
router.post('/', ingredientsControllers.addIngredient);  // Matches POST /ingredients
router.put('/:id', ingredientsControllers.editIngredient); // Matches PUT /ingredients/:id
router.delete('/:id', ingredientsControllers.removeIngredient); // Matches DELETE /ingredients/:id

// Export the router as the default export
export default router;