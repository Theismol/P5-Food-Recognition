import express from 'express';
const router = express.Router();

import { cloudImageRecognition, addIngredientToStock } from '../controllers/homeController.js'




router.post('/image-rec', cloudImageRecognition);
router.post('/add-ingredient', addIngredientToStock);



export default router;
