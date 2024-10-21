const port = 4000;
const app = express();
import express from 'express';
import cors from 'cors';
const router = express.Router();
import ingredientsRoutes from './src/routes/ingredientsRoutes.js';

//declaration
app.use('/api/ingredients', ingredientsRoutes);

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
