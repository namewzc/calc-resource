import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  Typography,
  Button,
  Paper,
  Box,
  Alert
} from '@mui/material';
import {
  calculateTPCC,
  calculatePeakTPS,
  calculateServerResources,
  BASELINE_SINGLE_CORE
} from '../../services/performanceCalculator';

const STORAGE_KEY = 'tpccCalculatorData';

export default function TPCCCalculator({ onResultChange }) {
  const [inputs, setInputs] = useState(() => {
    // 从localStorage读取初始数据
    const savedData = localStorage.getItem(STORAGE_KEY);
    return savedData ? JSON.parse(savedData) : {
      warehouseCount: '',
      tpmC: '',
      systemRedundancy: '',
      nonDbResourcePercentage: ''
    };
  });

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    // 保存到localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));

    // 计算结果
    const {
      warehouseCount,
      tpmC,
      systemRedundancy,
      nonDbResourcePercentage
    } = inputs;

    const W = parseFloat(warehouseCount) || 0;
    const T = parseFloat(tpmC) || 0;
    const R = parseFloat(systemRedundancy) || 0;
    const N = parseFloat(nonDbResourcePercentage) || 0;

    let result = 0;
    let explanation = '';

    if (W > 0 && T > 0) {
      const denominator = 1 - (R / 100) - (N / 100);
      if (denominator > 0) {
        result = (W * T) / denominator;
        explanation = `
          计算过程说明：
          1. 仓库数量 (W) = ${W}
          2. 每分钟事务数 (T) = ${T}
          3. 系统冗余率 (R) = ${R}%
          4. 非数据库资源占比 (N) = ${N}%
          5. TPC-C 得分 = (W × T) / (1 - R% - N%)
          6. 最终结果 = (${W} × ${T}) / (1 - ${R}/100 - ${N}/100) = ${result.toFixed(2)}
        `;
      } else {
        explanation = '错误：系统冗余率与非数据库资源占比之和不能大于或等于100%';
      }
    }

    onResultChange({
      coreCount: Math.ceil(result),
      explanation
    });
  }, [inputs, onResultChange]);

  return (
    <Box component={Paper} p={3}>
      <Typography variant="h6" gutterBottom>
        TPC-C 计算器
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="仓库数量"
            type="number"
            value={inputs.warehouseCount}
            onChange={handleInputChange('warehouseCount')}
            helperText="输入系统中的仓库数量"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="每分钟事务数(tpmC)"
            type="number"
            value={inputs.tpmC}
            onChange={handleInputChange('tpmC')}
            helperText="输入每分钟的事务处理数量"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="系统冗余率(%)"
            type="number"
            value={inputs.systemRedundancy}
            onChange={handleInputChange('systemRedundancy')}
            helperText="输入系统预留的冗余率百分比"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="非数据库资源占比(%)"
            type="number"
            value={inputs.nonDbResourcePercentage}
            onChange={handleInputChange('nonDbResourcePercentage')}
            helperText="输入非数据库占用的系统资源百分比"
          />
        </Grid>
      </Grid>

      {parseFloat(inputs.systemRedundancy) + parseFloat(inputs.nonDbResourcePercentage) >= 100 && (
        <Box mt={2}>
          <Alert severity="error">
            系统冗余率与非数据库资源占比之和不能大于或等于100%
          </Alert>
        </Box>
      )}
    </Box>
  );
} 