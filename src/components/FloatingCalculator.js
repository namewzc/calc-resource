import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Typography,
  Grid,
  Button,
  TextField
} from '@mui/material';
import MinimizeIcon from '@mui/icons-material/Minimize';
import CloseIcon from '@mui/icons-material/Close';
import CalculateIcon from '@mui/icons-material/Calculate';

const FloatingCalculator = ({ onClose }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  
  // 拖拽相关状态
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const calculatorRef = useRef(null);

  // 处理鼠标按下事件（开始拖拽）
  const handleMouseDown = (e) => {
    if (e.target.closest('.calculator-header')) {
      setIsDragging(true);
      const rect = calculatorRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  // 处理鼠标移动事件（拖拽中）
  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // 限制在窗口范围内
      const maxX = window.innerWidth - (isMinimized ? 200 : 320);
      const maxY = window.innerHeight - (isMinimized ? 50 : 500);
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  };

  // 处理鼠标释放事件（结束拖拽）
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 添加全局事件监听器
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // 计算器逻辑
  const inputNumber = (num) => {
    if (waitingForOperand) {
      setDisplay(String(num));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(num) : display + num);
    }
  };

  const inputDot = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperation) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue, secondValue, operation) => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const handleKeyPress = (key) => {
    if (key >= '0' && key <= '9') {
      inputNumber(parseInt(key));
    } else if (key === '.') {
      inputDot();
    } else if (key === '+' || key === '-') {
      performOperation(key);
    } else if (key === '*') {
      performOperation('×');
    } else if (key === '/') {
      performOperation('÷');
    } else if (key === 'Enter' || key === '=') {
      performOperation('=');
    } else if (key === 'Escape' || key === 'c' || key === 'C') {
      clear();
    }
  };

  // 键盘事件监听
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isMinimized) {
        e.preventDefault();
        handleKeyPress(e.key);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMinimized, display, previousValue, operation, waitingForOperand]);

  return (
    <Paper
      ref={calculatorRef}
      elevation={8}
      sx={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: isMinimized ? 200 : 320,
        height: isMinimized ? 50 : 500,
        zIndex: 9999,
        borderRadius: 2,
        overflow: 'hidden',
        cursor: isDragging ? 'grabbing' : 'default',
        userSelect: 'none',
        transition: 'width 0.3s ease, height 0.3s ease'
      }}
    >
      {/* 标题栏 */}
      <Box
        className="calculator-header"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'primary.main',
          color: 'white',
          p: 1,
          cursor: 'grab',
          '&:active': { cursor: 'grabbing' }
        }}
        onMouseDown={handleMouseDown}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalculateIcon size="small" />
          <Typography variant="subtitle2">
            计算器
          </Typography>
        </Box>
        <Box>
          <IconButton
            size="small"
            sx={{ color: 'white' }}
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <MinimizeIcon />
          </IconButton>
          <IconButton
            size="small"
            sx={{ color: 'white' }}
            onClick={onClose}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* 计算器内容 */}
      {!isMinimized && (
        <Box sx={{ p: 2, height: 'calc(100% - 50px)' }}>
          {/* 显示屏 */}
          <TextField
            fullWidth
            value={display}
            InputProps={{
              readOnly: true,
              style: {
                textAlign: 'right',
                fontSize: '1.2rem',
                fontWeight: 'bold'
              }
            }}
            sx={{ mb: 2 }}
          />

          {/* 按钮网格 */}
          <Grid container spacing={1}>
            {/* 第一行 */}
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                onClick={clear}
                sx={{ height: 45 }}
              >
                C
              </Button>
            </Grid>
            <Grid item xs={3}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => performOperation('÷')}
                sx={{ height: 45 }}
              >
                ÷
              </Button>
            </Grid>
            <Grid item xs={3}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => performOperation('×')}
                sx={{ height: 45 }}
              >
                ×
              </Button>
            </Grid>

            {/* 第二行 */}
            <Grid item xs={3}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => inputNumber(7)}
                sx={{ height: 45 }}
              >
                7
              </Button>
            </Grid>
            <Grid item xs={3}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => inputNumber(8)}
                sx={{ height: 45 }}
              >
                8
              </Button>
            </Grid>
            <Grid item xs={3}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => inputNumber(9)}
                sx={{ height: 45 }}
              >
                9
              </Button>
            </Grid>
            <Grid item xs={3}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => performOperation('-')}
                sx={{ height: 45 }}
              >
                -
              </Button>
            </Grid>

            {/* 第三行 */}
            <Grid item xs={3}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => inputNumber(4)}
                sx={{ height: 45 }}
              >
                4
              </Button>
            </Grid>
            <Grid item xs={3}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => inputNumber(5)}
                sx={{ height: 45 }}
              >
                5
              </Button>
            </Grid>
            <Grid item xs={3}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => inputNumber(6)}
                sx={{ height: 45 }}
              >
                6
              </Button>
            </Grid>
            <Grid item xs={3}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => performOperation('+')}
                sx={{ height: 45 }}
              >
                +
              </Button>
            </Grid>

            {/* 第四行 */}
            <Grid item xs={3}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => inputNumber(1)}
                sx={{ height: 45 }}
              >
                1
              </Button>
            </Grid>
            <Grid item xs={3}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => inputNumber(2)}
                sx={{ height: 45 }}
              >
                2
              </Button>
            </Grid>
            <Grid item xs={3}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => inputNumber(3)}
                sx={{ height: 45 }}
              >
                3
              </Button>
            </Grid>
            <Grid item xs={3} rowSpan={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => performOperation('=')}
                sx={{ height: 93, bgcolor: 'secondary.main', color: 'white' }}
              >
                =
              </Button>
            </Grid>

            {/* 第五行 */}
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => inputNumber(0)}
                sx={{ height: 45 }}
              >
                0
              </Button>
            </Grid>
            <Grid item xs={3}>
              <Button
                fullWidth
                variant="contained"
                onClick={inputDot}
                sx={{ height: 45 }}
              >
                .
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}
    </Paper>
  );
};

// 浮动计算器触发按钮
export const FloatingCalculatorTrigger = ({ onToggle }) => {
  return (
    <IconButton
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        bgcolor: 'primary.main',
        color: 'white',
        zIndex: 9998,
        '&:hover': {
          bgcolor: 'primary.dark'
        }
      }}
      onClick={onToggle}
    >
      <CalculateIcon />
    </IconButton>
  );
};

export default FloatingCalculator; 