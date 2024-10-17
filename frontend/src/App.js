import './App.css';
import Home from "./pages/home/Home";
import Recipes from "./pages/recipes/Recipes";
import Ingredients from "./pages/ingredients/Ingredients";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';


const darkTheme = createTheme({
  palette: {
      mode: 'dark',
      primary: {
          main: '#1769aa', // Adjust as needed
          contrastText: '#fff', // Button text color
      },
      background: {
          default: '#08192c', // Default background color for dark mode
          paper: '#6166ed', // Paper background color
          input: '#fff', // Input background color
      },
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/recipes" element={<Recipes />} />
                <Route path="/ingredients" element={<Ingredients />} />
            </Routes>

    </ThemeProvider>
    
  );
}

export default App;
