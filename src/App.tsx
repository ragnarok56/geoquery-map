import React from 'react'
import './App.css';
import GeoQuery from './components/GeoQuery/GeoQuery'

import { createTheme, ThemeProvider } from '@mui/material/styles';

const mainTheme = createTheme({
    palette: {
      primary: {
        main: '#333',
      },
      secondary: {
        main: '#f50057',
      },
    },
    typography: {
      fontSize: 12,
      fontFamily: 'sans-serif',
    },
  })

const theme = createTheme(mainTheme, {
    components: {
        MuiButtonBase: {
          defaultProps: {
            disableRipple: true,
          },
          styleOverrides: {
            root: {
            //   '&.MuiIconButton-root': {
            //       borderTopWidth: 2,
            //       borderBottomWidth: 2,
            //       borderLeftWidth: 2,
            //       borderRightWidth: 2,
            //       borderColor: mainTheme.palette.secondary.main
            //   }
            },
          },
        },
        MuiButton: {
          defaultProps: {
              variant: 'contained',
          },
          styleOverrides: {
            root: {
              borderRadius: 0
            },
          },
        },
        MuiPopover: {
            styleOverrides: {
                paper: {
                    borderRadius: 0
                }
            }
        },
        MuiSlider: {
            styleOverrides: {
                root: {
                    color: mainTheme.palette.secondary.main
                },
                thumb: {
                    color: mainTheme.palette.secondary.main
                }
            }
        }
      },
})

function App() {
  return (
    <ThemeProvider theme={ theme }>
        <div className="App">
            <GeoQuery/>
        </div>
    </ThemeProvider>
  )
}

export default App
