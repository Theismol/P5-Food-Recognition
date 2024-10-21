const port = 4000;
const app = express();
import express from 'express';
import cors from 'cors';
const router = express.Router();
<<<<<<< HEAD
import ingredientsRoutes from './src/routes/ingredientsRoutes.js';

//declaration
app.use('/api/ingredients', ingredientsRoutes);
=======
import homeRoutes from './src/routes/homeRoutes.js'
//routes
//const exampleRoute = require('path_to_your_routes.js')

import recipeRoutes from './src/routes/recipeRoutes.js';
>>>>>>> 18c6de035463d43c53a1eb3fdf5fa81fd6f5dbf7

app.use(cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true // Allow cookies to be sent with requests
}));

// Makes it so that we can receive http requests as JSON and they will automatically be in req.body
app.use(express.json());
//allows to access static files through URL
app.use(express.static('public'));

//specific routes
// app.use('/api/ROUTENAME', imported route at the top of the document);

app.use('/api/home', homeRoutes);
app.use('/api/recipe', recipeRoutes);

 app.listen(port, () => {
    console.log(`App listening on port ${port}`)
}) 


// Export the app for testing
export default app;

/* Start the server after connecting to the database
const startServer = async () => {
    try {
        await connectToDatabase(); // Ensure the database connection is established
        app.listen(port, () => {
            console.log(`App listening on port ${port}`);
        });
    } catch (error) {
        console.error('Failed to start the server due to database connection issue:', error);
    }
};

// Start the server
startServer(); */
