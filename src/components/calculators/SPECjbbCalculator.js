import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  Typography,
  Paper,
  Box,
  Alert
} from '@mui/material';
import {
  calculateSPECjbb2005,
  calculateTransactionsPerSecond,
  calculateServerResources,
  BASELINE_SINGLE_CORE
} from '../../services/performanceCalculator';

const STORAGE_KEY = 'specjbbCalculatorData';

export default function SPECjbbCalculator({ onResultChange }) {
  const [inputs, setInputs] = useState(() => {
    // 从localStorage读取初始数据
    const savedData = localStorage.getItem(STORAGE_KEY);
    return savedData ? JSON.parse(savedData) : {
      totalUsers: 158200, // 系统用户数
      peakConcurrencyRate: 0.001, // 峰值系统并发率（0.1%）
      tasksPerConcurrentUser: 2, // 每个并发产生的任务数
      
      // 业务交易量计算参数
      requestsPerTransaction: 4, // 每笔业务发出应用请求数
      transactionsPerRequest: 5, // 平均每个请求处理的应用类事务数
      
      // SPECjbb2005计算参数
      peakValuePerTransaction: 1500, // 每笔业务交易需消耗的SPECjbb2005峰值
      redundancyCapacity: 0.3, // 系统的冗余处理能力 (30%)
      nonJavaResourcePercentage: 0 // 非Java应用所占用的系统资源百分比
    };
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setInputs(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  // 计算峰值并发用户数
  const calculatePeakConcurrentUsers = () => {
    return inputs.totalUsers * inputs.peakConcurrencyRate;
  };

  // 计算每秒并发要处理的业务量
  const calculatePeakConcurrentTransactions = () => {
    const peakConcurrentUsers = calculatePeakConcurrentUsers();
    return peakConcurrentUsers * inputs.tasksPerConcurrentUser;
  };

  useEffect(() => {
    // 保存到localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));

    const peakConcurrentTransactions = calculatePeakConcurrentTransactions();
    
    // 计算每秒业务交易量
    const transactionsPerSecond = calculateTransactionsPerSecond({
      peakConcurrentTransactions,
      requestsPerTransaction: inputs.requestsPerTransaction,
      transactionsPerRequest: inputs.transactionsPerRequest
    });

    // 计算SPECjbb2005值
    const specjbbResult = calculateSPECjbb2005({
      transactionsPerSecond,
      peakValuePerTransaction: inputs.peakValuePerTransaction,
      redundancyCapacity: inputs.redundancyCapacity,
      nonJavaResourcePercentage: inputs.nonJavaResourcePercentage
    });

    // 计算所需核数
    const { appServerCores } = calculateServerResources({
      specjbbValue: specjbbResult,
      tpccValue: 0, // 这里我们只关心SPECjbb的结果
      baselineSingleCore: BASELINE_SINGLE_CORE
    });

    const finalResult = {
      peakConcurrentUsers: calculatePeakConcurrentUsers(),
      peakConcurrentTransactions,
      transactionsPerSecond,
      specjbbValue: specjbbResult,
      appServerCores,
      explanation: generateExplanation(transactionsPerSecond, specjbbResult, appServerCores, inputs)
    };

    onResultChange(finalResult);
  }, [inputs, onResultChange]);

  const generateExplanation = (transactionsPerSecond, specjbbResult, appServerCores, params) => {
    const peakConcurrentUsers = calculatePeakConcurrentUsers();
    const peakConcurrentTransactions = calculatePeakConcurrentTransactions();
    
    return `应用服务器主要处理WEB服务器发送的业务请求处理、业务处理，主要工具箱使用，实现报表类、通用类等工具服务，每个微服务组件支持独立部署，为WEB应用提供共性服务支撑和基础信息配置。

应用服务器采用SPECjbb2005标准对其性能指标进行测算，其计算公式为：SPECjbb2005 = A × B /（1 - C - D）
其中：
A：每秒最多需要同时处理的业务交易量。
B：每笔业务交易需消耗的SPECjbb2005峰值。
C：系统的冗余处理能力。
D：非Java应用所占用的系统资源百分比。

计算过程：
1. 并发用户计算：
   - 系统用户数：${params.totalUsers}人
   - 峰值系统并发率：${(params.peakConcurrencyRate * 100).toFixed(3)}%
   - 峰值并发用户数 = ${params.totalUsers} × ${(params.peakConcurrencyRate * 100).toFixed(3)}% = ${peakConcurrentUsers.toFixed(1)}人
   - 每个并发产生的任务数：${params.tasksPerConcurrentUser}个
   - 每秒并发要处理的业务量 = ${peakConcurrentUsers.toFixed(1)} × ${params.tasksPerConcurrentUser} = ${peakConcurrentTransactions.toFixed(1)}

2. 业务交易量计算：
   - 每笔业务发出应用请求数为${params.requestsPerTransaction}
   - 平均每个请求处理的应用类事务数为${params.transactionsPerRequest}
   - 每秒钟最多需要同时处理的业务交易量 = ${peakConcurrentTransactions.toFixed(1)} × ${params.requestsPerTransaction} × ${params.transactionsPerRequest} = ${transactionsPerSecond}

3. SPECjbb2005值计算：
   - 每笔业务交易需消耗的SPECjbb2005峰值为${params.peakValuePerTransaction}
   - 系统预留${params.redundancyCapacity * 100}%冗余
   - 非Java应用所占系统资源的百分比为${params.nonJavaResourcePercentage * 100}%
   
最终SPECjbb2005值 = ${transactionsPerSecond} × ${params.peakValuePerTransaction} / (1 - ${params.redundancyCapacity} - ${params.nonJavaResourcePercentage}) = ${specjbbResult.toLocaleString()}

4. 所需核数计算：
   - 单核SPECjbb2005基准值：${BASELINE_SINGLE_CORE.specjbb}
   - 虚拟化开销：10%
   - 所需核数 = ⌈${specjbbResult.toLocaleString()} ÷ ${BASELINE_SINGLE_CORE.specjbb} ÷ (1 - 0.1)⌉ = ${appServerCores}核`;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        SPECjbb2005性能测算
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2, position: 'relative' }}>
            <Typography variant="subtitle1" gutterBottom>
              用户和并发参数
            </Typography>
            <Box 
              sx={{ 
                position: 'absolute', 
                top: 16, 
                right: 16, 
                bgcolor: 'primary.main',
                color: 'white',
                px: 2,
                py: 1,
                borderRadius: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <Typography variant="caption" sx={{ mb: 0.5 }}>
                所需核数
              </Typography>
              <Typography variant="h6" component="div">
                {(() => {
                  const peakConcurrentTransactions = calculatePeakConcurrentTransactions();
                  const transactionsPerSecond = calculateTransactionsPerSecond({
                    peakConcurrentTransactions,
                    requestsPerTransaction: inputs.requestsPerTransaction,
                    transactionsPerRequest: inputs.transactionsPerRequest
                  });
                  const specjbbResult = calculateSPECjbb2005({
                    transactionsPerSecond,
                    peakValuePerTransaction: inputs.peakValuePerTransaction,
                    redundancyCapacity: inputs.redundancyCapacity,
                    nonJavaResourcePercentage: inputs.nonJavaResourcePercentage
                  });
                  const { appServerCores } = calculateServerResources({
                    specjbbValue: specjbbResult,
                    tpccValue: 0,
                    baselineSingleCore: BASELINE_SINGLE_CORE
                  });
                  return `${appServerCores}核`;
                })()}
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="系统用户数"
                  name="totalUsers"
                  type="number"
                  value={inputs.totalUsers}
                  onChange={handleInputChange}
                  helperText="系统总用户数（人）"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="峰值系统并发率"
                  name="peakConcurrencyRate"
                  type="number"
                  value={inputs.peakConcurrencyRate}
                  onChange={handleInputChange}
                  helperText="0-1之间的小数，例如0.001表示0.1%"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="每个并发产生的任务数"
                  name="tasksPerConcurrentUser"
                  type="number"
                  value={inputs.tasksPerConcurrentUser}
                  onChange={handleInputChange}
                  helperText="每个并发用户产生的任务数（个）"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  disabled
                  label="峰值并发用户数"
                  value={calculatePeakConcurrentUsers().toFixed(1)}
                  helperText="自动计算：系统用户数 × 峰值系统并发率"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              业务交易量参数
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="每笔业务发出应用请求数"
                  name="requestsPerTransaction"
                  type="number"
                  value={inputs.requestsPerTransaction}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="平均每个请求处理的应用类事务数"
                  name="transactionsPerRequest"
                  type="number"
                  value={inputs.transactionsPerRequest}
                  onChange={handleInputChange}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              SPECjbb2005参数
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="每笔业务交易SPECjbb2005峰值"
                  name="peakValuePerTransaction"
                  type="number"
                  value={inputs.peakValuePerTransaction}
                  onChange={handleInputChange}
                  helperText="bops值"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="系统冗余处理能力"
                  name="redundancyCapacity"
                  type="number"
                  value={inputs.redundancyCapacity}
                  onChange={handleInputChange}
                  helperText="0-1之间的小数，例如0.3表示30%"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="非Java应用占用系统资源百分比"
                  name="nonJavaResourcePercentage"
                  type="number"
                  value={inputs.nonJavaResourcePercentage}
                  onChange={handleInputChange}
                  helperText="0-1之间的小数，例如0.2表示20%"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {parseFloat(inputs.redundancyCapacity) + parseFloat(inputs.nonJavaResourcePercentage) >= 100 && (
        <Box mt={2}>
          <Alert severity="error">
            系统冗余率与非Java资源占比之和不能大于或等于100%
          </Alert>
        </Box>
      )}
    </Box>
  );
} 