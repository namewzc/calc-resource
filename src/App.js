import React, { useState } from 'react';
import { CssBaseline, ThemeProvider, createTheme, Tabs, Tab, Box } from '@mui/material';
import PerformanceCalculator from './components/PerformanceCalculator';
import FloatingCalculator, { FloatingCalculatorTrigger } from './components/FloatingCalculator';
import BenchmarkConfigManager from './components/BenchmarkConfigManager';

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
  const [activeTab, setActiveTab] = useState(0);

  const toggleCalculator = () => {
    setShowCalculator(!showCalculator);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      {/* 主导航标签 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="应用功能标签">
          <Tab label="性能计算器" />
          <Tab label="基准配置管理" />
        </Tabs>
      </Box>
      
      {/* 标签内容 */}
      <Box>
        {activeTab === 0 && <PerformanceCalculator />}
        {activeTab === 1 && <BenchmarkConfigManager />}
      </Box>
      
      {/* 浮动计算器 */}
      {showCalculator && <FloatingCalculator onClose={() => setShowCalculator(false)} />}
      
      {/* 计算器触发按钮 */}
      <FloatingCalculatorTrigger onToggle={toggleCalculator} />
    </ThemeProvider>
  );
}

export default App;