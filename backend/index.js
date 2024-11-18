import express from 'express';
import cors from 'cors';
const router = express.Router();
import ingredientsRoutes from './src/routes/ingredientsRoutes.js';
import homeRoutes from './src/routes/homeRoutes.js'
//routes
//const exampleRoute = require('path_to_your_routes.js')

import recipeRoutes from './src/routes/recipeRoutes.js';

const port = 2000;
const app = express();

app.use(cors({
   origin: true,
   methods: ['GET', 'POST', 'PUT', 'DELETE'],
   //allowedHeaders: ['Content-Type', 'Authorization'],
   credentials: true // Allow cookies to be sent with requests
}));

// Makes it so that we can receive http requests as JSON and they will automatically be in req.body
app.use(express.json());
//allows to access static files through URL
app.use(express.static('public'));

//specific routes
// app.use('/api/ROUTENAME', imported route at the top of the document);
app.use('/api/stock', ingredientsRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/recipe', recipeRoutes);

app.listen(port, () => {
   console.log(`App listening on port ${port}`)
})


// Export the app for testing
export default app;


