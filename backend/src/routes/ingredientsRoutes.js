import express from 'express';
import ingredientsControllers from '../controllers/ingredientsControllers.js';

const router = express.Router();

// Define routes
router.get('/', ingredientsControllers.getIngredients);
router.post('/add', ingredientsControllers.addIngredient);
router.put('/edit/:id', ingredientsControllers.editIngredient);
router.delete('/remove/:id', ingredientsControllers.removeIngredient);

// Export the router as the default export
export default router;
