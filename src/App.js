import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import PerformanceCalculator from './components/PerformanceCalculator';

// 创建主题
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PerformanceCalculator />
    </ThemeProvider>
  );
}

export default App; 