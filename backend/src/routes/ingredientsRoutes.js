import express from 'express';
import ingredientsControllers from '../controllers/ingredientsControllers.js';

const router = express.Router();

// Stock Endpoints
router.get('/', ingredientsControllers.getStock);  // Matches GET /stock
router.put('/:id', ingredientsControllers.editStock); // Matches PUT /stock/:id


// Export the router as the default export
export default router;
