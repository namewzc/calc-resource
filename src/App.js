import React, { useState } from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import PerformanceCalculator from './components/PerformanceCalculator';
import FloatingCalculator, { FloatingCalculatorTrigger } from './components/FloatingCalculator';

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
  const [showCalculator, setShowCalculator] = useState(false);

  const toggleCalculator = () => {
    setShowCalculator(!showCalculator);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PerformanceCalculator />
      
      {/* 浮动计算器 */}
      {showCalculator && <FloatingCalculator onClose={() => setShowCalculator(false)} />}
      
      {/* 计算器触发按钮 */}
      <FloatingCalculatorTrigger onToggle={toggleCalculator} />
    </ThemeProvider>
  );
}

export default App; 