import express from 'express';
import ingredientsControllers from '../controllers/ingredientsControllers.js';

const router = express.Router();


// Define routes to match Flask API structure
router.get('/', ingredientsControllers.getIngredients);  // Matches GET /ingredients
router.post('/', ingredientsControllers.addIngredient);  // Matches POST /ingredients
router.put('/:id', ingredientsControllers.editIngredient); // Matches PUT /ingredients/:id
router.delete('/:id', ingredientsControllers.removeIngredient); // Matches DELETE /ingredients/:id
// Stock Endpoints
router.get('/stock', ingredientsControllers.getStock);  // Matches GET /stock
router.post('/stock', ingredientsControllers.addStock);  // Matches POST /stock
//router.put('/stock/:id', ingredientsControllers.editStock); // Matches PUT /stock/:id
//router.delete('/stock/:id', ingredientsControllers.removeStock); // Matches DELETE /stock/:id

// Expiry Date Endpoints
router.get('/expiry_dates', ingredientsControllers.getExpiryDates);  // Matches GET /expiry_dates
router.post('/expiry_dates', ingredientsControllers.addExpiryDate);  // Matches POST /expiry_dates
//router.put('/expiry_dates/:id', ingredientsControllers.editExpiryDate); // Matches PUT /expiry_dates/:id

// Recipes-Ingredients Link Endpoints
router.post('/recipes_has_ingredients', ingredientsControllers.addRecipeIngredientLink); // Matches POST /recipes_has_ingredients
router.delete('/recipes_has_ingredients', ingredientsControllers.removeRecipeIngredientLink); // Matches DELETE /recipes_has_ingredients

// Export the router as the default export
export default router;