// theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Azul por defecto
    },
    secondary: {
      main: '#f50057', // Rosa por defecto
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          marginBottom: '16px',
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#1976d2', // Color del borde
            },
            '&:hover fieldset': {
              borderColor: '#f50057', // Color del borde al pasar el mouse
            },
            '&.Mui-focused fieldset': {
              borderColor: '#f50057', // Color del borde cuando está enfocado
            },
            '& input': {
              color: '#fff', // Color del texto dentro del campo de entrada
            },
            '& .MuiInputAdornment-root': {
              color: '#fff', // Color de los adornos, si los hay
            },
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#fff', // Color del texto del label
          '&.Mui-focused': {
            color: '#fff', // Color del label cuando está enfocado
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          backgroundColor: '#1976d2',
          color: '#fff',
          '&:hover': {
            backgroundColor: '#115293',
          },
          '&.Mui-disabled': {
            backgroundColor: '#c0c0c0',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        input: {
          color: '#fff', // Color del texto para todos los campos de entrada, incluyendo fechas
        },
        root: {
          '& .MuiSvgIcon-root': {
            color: '#fff', // Color de los íconos dentro del campo de texto
          },
        },
      },
    },
  },
});

export default theme;
