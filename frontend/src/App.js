import './App.css';
import Home from "./pages/home/Home";
import Recipes from "./pages/recipes/Recipes";
import Ingredients from "./pages/ingredients/Ingredients";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const darkTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#C0B9DD',
      contrastText: '#000000', // Default text color
    },
    secondary: {
      main: "#75c9c8",
      contrastText: "#000000"
    },
    background: {
      default: '#F7F7F8',
      paper: '#F7F4EA',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          color: '#000000', // Ensures button text is black
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          color: '#000000', // Ensures ListItemText in the drawer is black
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: '#75c9c8', // Background color for dropdown menu
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: '#000000', // Text color for each item in the dropdown menu
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          color: '#000000', // Default text color for Select
        },
      },
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
