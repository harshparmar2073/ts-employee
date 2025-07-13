// theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#000000',           // Black primary
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#764ba2',           // Vibrant purple
    },
    background: {
      default: '#f4f5f7',        // Light gray background
      paper: '#ffffff',          // White cards
      sidebar: 'linear-gradient(to bottom, #f9f9fb, #e0e4ec)', // Soft gradient
    },
    text: {
      primary: '#212121',
      secondary: '#5e35b1',
    },
  },

  typography: {
    fontFamily: '"Inter", "Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    button: {
      textTransform: 'capitalize',
      fontWeight: 600,
    },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f4f5f7',
        },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
          background: 'linear-gradient(to bottom, #f9f9fb, #e0e4ec)',
        },
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          marginInline: 8,
          marginBlock: 6,
          paddingInline: 16,
          transition: 'all 0.2s ease-in-out',
          '&.Mui-selected': {
            backgroundColor: '#b39ddb', // lighter purple
            fontWeight: 600,
            color: '#000',
          },
          '&:hover': {
            background: '#5e35b1',
            color: '#ffffff',
            '& .MuiListItemIcon-root': {
              color: '#ffffff',
            },
          },
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          height: 44,
          borderRadius: 8,
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 600,
          fontSize: 15,
          textTransform: 'capitalize',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            backgroundColor: '#5e35b1', // hover purple
            color: '#ffffff',
          },
          '&:disabled': {
            backgroundColor: 'rgba(0, 0, 0, 0.12)',
            color: 'rgba(0, 0, 0, 0.26)',
          },
        },
        containedPrimary: {
          backgroundColor: '#000000',
          color: '#ffffff',
        },
        outlinedPrimary: {
          color: '#000000',
          borderColor: '#000000',
          '&:hover': {
            backgroundColor: '#ede7f6',
            borderColor: '#5e35b1',
            color: '#5e35b1',
          },
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          borderRadius: 6,
          backgroundColor: '#ffffff',
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#5e35b1',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#5e35b1',
            },
          },
        },
      },
    },
  },
});

export default theme;