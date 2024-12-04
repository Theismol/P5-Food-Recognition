import React, { useRef, useCallback, useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Navbar from '../components/Navbar';
import Select from '@mui/material/Select';
import Webcam from 'react-webcam';
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import axios from 'axios';
import * as tf from "@tensorflow/tfjs";
import { Autocomplete, TextField } from '@mui/material';
function Home() {
    const backendURL = process.env.REACT_APP_API_URL;
    const webcamRef = useRef(null)
    const [open, setOpen] = useState(false);
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [model, setModel] = useState(null);
    const [detectedItem, setDetectedItem] = useState(null);
    const [selectedIngredient, setSelectedIngredient] = useState(null);
    const labels = [
        { name: "Banana", unit: "pieces" },
        { name: "Butter", unit: "g" },
        { name: "Carrots", unit: "g" },
        { name: "Cheese", unit: "g" },
        { name: "Chicken", unit: "g" },
        { name: "Chopped Tomatoes", unit: "g" },
        { name: "Cream", unit: "ml" },
        { name: "Eggs", unit: "pieces" },
        { name: "Garlic", unit: "cloves" },
        { name: "Ground Beef", unit: "g" },
        { name: "Milk", unit: "ml" },
        { name: "Mushrooms", unit: "g" },
        { name: "Oil", unit: "ml" },
        { name: "Onion", unit: "pieces" },
        { name: "Pasta", unit: "g" },
        { name: "Rice", unit: "g" },
        { name: "Rye Bread", unit: "slices" },
        { name: "Tortillas", unit: "pieces" },
        { name: "Wheat Flour", unit: "g" }
    ];


    useEffect(() => {
        const init_model = async () => {
            const model = await loadModel();
            if (model) setModel(model)

        }
        init_model();
        return () => {
            if (model) {
                model.dispose();
                setModel(null);
            }
        };

    }, [])
    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        return imageSrc;
    }, [webcamRef]);
    const handleOpen = () => {
        setOpen(true);
    }
    const handleClose = () => {
        setSelectedIngredient(null);
        setDetectedItem(null);
        setOpen(false);
    }
    const handleAlertClose = () => {
        setAlertOpen(false);
        setAlertMessage("");
    }
    const handleAlertOpen = (message) => {
        setAlertMessage(message);
        setAlertOpen(true);
    }
    const handleSave = async () => {
        try {
            const response = await axios.post(`${backendURL}/api/stock`, { ingredientName: selectedIngredient.name, amount: selectedIngredient.quantity, expiry: selectedIngredient.expiryDate });
            handleAlertOpen("Item sucessfully added to stock");

        }
        catch (error) {
            handleAlertOpen("Error adding item to stock");

        }
    }
    const loadModel = async () => {
        try {
            const loadedModel = await tf.loadGraphModel('best_web_model/model.json');
            return loadedModel
        }
        catch (error) {
            handleAlertOpen("Error: Please reload the page");
            return null;
        }
    }
    const getItemInImages = async () => {
        const images = []
        const labelCount = {};
        handleAlertOpen("Processing image...")
        for (let i = 0; i < 5; i++) {
            const result = await predictImage();
            images.push(result.image);
            if (!labelCount[result.class]) {
                labelCount[result.class] = {
                    box: result.box,
                    confidence: result.confidence,
                    count: 1
                }
            }
            else {
                labelCount[result.class].count += 1;
                if (result.confidence > labelCount[result.class].confidence) {
                    labelCount[result.class].confidence = result.confidence;
                    labelCount[result.class].box = result.box;
                }
            }
        }
        let highestCountClass = null;
        let maxCount = 0;

        for (const className in labelCount) {
            if (labelCount[className].count > maxCount) {
                maxCount = labelCount[className].count;
                highestCountClass = className;
            }
        }
        if (highestCountClass !== "undefined") {
            setSelectedIngredient({ name: highestCountClass, quantity: 0, expiryDate: null });
            setDetectedItem({
                class: highestCountClass,
                confidence: labelCount[highestCountClass].confidence,
                image: images[0]
            });
        }
        else {
            try {
                const cloudItemDetected = await axios.post(`${backendURL}/api/home/image-rec`, {
                    images: images,
                })
                if (cloudItemDetected.data) {
                    setSelectedIngredient({ name: cloudItemDetected.data.name, quantity: 0, expiryDate: null });
                    setDetectedItem({ class: cloudItemDetected.data.name, confidence: cloudItemDetected.data.confidence, image: images[0] })
                }
            }
            catch (error) {
                handleAlertOpen("Could not detect any grocerie")
            }

        }
        return null; // If no classes were found
    }
    const predictImage = async () => {
        if (!model) {
            handleAlertOpen("Error: Please try again later");
            return;
        }

        // Convert Base64 to Image element
        const img = new Image();
        img.src = capture();


        return new Promise((resolve) => {
            img.onload = async () => {
                // Convert Image to Tensor
                let tensor = tf.browser.fromPixels(img)
                    .resizeNearestNeighbor([640, 640]) // Resize to model's expected input shape
                    .toFloat()
                    .div(tf.scalar(255.0)) // Normalize pixel values to [0, 1]
                    .expandDims(); // Add batch dimension

                // Run model prediction
                const prediction = await model.executeAsync(tensor);
                const reshapedPredictions = prediction.reshape([1, 23, 8400]);

                // Extract bounding boxes (first 4 values)
                const boxesTensor = reshapedPredictions.slice([0, 0, 0], [1, 4, 8400]);

                // Extract scores (remaining 30 values per detection)
                const scoresTensor = reshapedPredictions.slice([0, 4, 0], [1, 19, 8400]);

                // Optional: You could derive class predictions by finding the max score index in `scoresTensor`
                const classesTensor = scoresTensor.argMax(1).squeeze();

                const boxes = boxesTensor.arraySync()[0];
                const scores = scoresTensor.max(1).arraySync()[0]; // Max score per detection
                const classes = classesTensor.arraySync();
                const biggestConfidence = 0;
                const threshold = 0.8;
                let results = {};

                for (let i = 0; i < scores.length; i++) {
                    if (scores[i] >= threshold && scores[i] >= biggestConfidence) {
                        results = {
                            box: boxes.map(b => b[i]),
                            confidence: scores[i],
                            class: labels[classes[i]].name,
                            image: img.src
                        }

                    }
                }

                tensor.dispose(); // Clean up tensor to free memory
                resolve(results); // Return the processed prediction result
            };
        });
    };
    const detectedItemDropDown = () => {
        return (
            <Autocomplete
                options={labels.map(label => label.name)}
                value={selectedIngredient.name}
                onChange={(e, newValue) => {
                    handleEditSelectedIngredient({ target: { name: 'name', value: newValue } });
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label=""
                        variant="outlined"
                    />
                )}
                disableClearable
            />
        )
    }
    const handleEditSelectedIngredient = (e) => {
        const { name, value } = e.target;
        setSelectedIngredient((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh', // Full viewport height to center vertically
            }}
        >
            <Navbar />
            <Button
                onClick={handleOpen}
                variant="contained"
                size="large"
                sx={{
                    fontSize: '1.5rem', // Make the text larger
                    padding: '16px 32px', // Increase padding for a bigger button
                }}
            >
                Add Item
            </Button>
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>{detectedItem ? <>Detected item: {detectedItemDropDown()}</> : "Please put your grocery up to the camera and click capture"}</DialogTitle>
                <DialogContent>
                    {detectedItem ? <>
                        <Box
                            component="img"
                            src={detectedItem.image}
                            alt={detectedItem.class}
                        />
                        <TextField
                            label="Quantity"
                            name="quantity"
                            type="number"
                            value={selectedIngredient.quantity}
                            onChange={handleEditSelectedIngredient}
                            fullWidth
                            margin="normal"
                            InputProps={{ inputProps: { min: 0 } }} // Optional: Prevent negative numbers
                        />
                        <TextField
                            label="Expiry"
                            name="expiryDate"
                            type="date" // Date type for expiry
                            value={selectedIngredient.expiryDate}
                            onChange={handleEditSelectedIngredient}
                            fullWidth
                            margin="normal"
                            InputLabelProps={{ shrink: true }} // Keep the label shrunk for date input
                        />
                        <TextField
                            label="Unit"
                            name="unit"
                            value={labels.find(label => label.name === detectedItem.class).unit}
                            fullWidth
                            margin="normal"
                            InputProps={{ readOnly: true }} // Optional: Prevent negative numbers
                        />
                    </> :
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            width="100%" // Adjust width to fit the modal
                        />
                    }
                </DialogContent>
                <DialogActions>

                    <Button onClick={handleClose} variant="outlined" sx={{ bgcolor: "#75c9c8" }}>
                        Close
                    </Button>
                    {
                        detectedItem ? <Button onClick={handleSave} variant="outlined" sx={{ bgcolor: "#75c9c8" }}>Save</Button>
                            :
                            <Button onClick={getItemInImages} variant="outlined" sx={{ bgcolor: "#75c9c8" }}>Capture</Button>
                    }
                </DialogActions>
            </Dialog>
            {alertOpen ? (
                <Snackbar
                    open={alertOpen}
                    autoHideDuration={1000}
                    onClose={handleAlertClose}
                    anchorOrigin={{ vertical: "top", horizontal: "left" }}
                >
                    <Alert severity="info" variant="filled">
                        {alertMessage}
                    </Alert>
                </Snackbar>
            ) : null}
        </Box>
    );
}

export default Home;
