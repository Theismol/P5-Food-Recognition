import express from 'express';
import ingredientsControllers from '../controllers/ingredientsControllers.js';

const router = express.Router();

// Ingredient Endpoints
router.get('/ingredients', ingredientsControllers.getIngredients);  // Matches GET /ingredients

// Stock Endpoints
router.get('/stock', ingredientsControllers.getStock);  // Matches GET /stock
router.post('/stock', ingredientsControllers.addStock);  // Matches POST /stock
router.put('/stock/:id', ingredientsControllers.editStock); // Matches PUT /stock/:id
router.delete('/stock/:id', ingredientsControllers.removeStock); // Matches DELETE /stock/:id

// Expiry Date Endpoints
router.post('/expiry_dates', ingredientsControllers.addExpiryDate);  // Matches POST /expiry_dates
router.put('/expiry_dates/:id', ingredientsControllers.editExpiryDate); // Matches PUT /expiry_dates/:id
router.delete('/expiry_dates/:id', ingredientsControllers.removeExpiryDate); // Matches DELETE /expiry_dates/:id

// Export the router as the default export
export default router;