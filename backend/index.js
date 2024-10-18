const port = 4000;
const app = express();
import express from 'express';
import cors from 'cors';

const router = express.Router();

//routes
//const exampleRoute = require('path_to_your_routes.js')



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




