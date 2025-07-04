import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  Typography,
  Button,
  Paper,
  Box,
  Alert,
  Snackbar
} from '@mui/material';
import {
  calculateTPCC,
  calculatePeakTPS,
  calculateServerResources,
  BASELINE_SINGLE_CORE
} from '../../services/performanceCalculator';

const STORAGE_KEY = 'tpccCalculatorData';

export default function TPCCCalculator({ onResultChange }) {
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [inputs, setInputs] = useState(() => {
    // 从localStorage读取初始数据
    const savedData = localStorage.getItem(STORAGE_KEY);
    return savedData ? JSON.parse(savedData) : {
      totalUsers: 10000, // 总用户数
      concurrentPercentage: 10, // 并发用户百分比（10%）
      transactionsPerMinute: 15, // 每个客户端每分钟处理事务数
      queriesPerTransaction: 5, // 每个事务每分钟查询次数
      m2: 5, // 联机事务处理TPC值 (5-15)
      m1: 60, // CPU信息量百分比 (60%)
      m4: 1.3 // 预留扩展参数
    };
  });

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setInputs(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  // 保存数据到localStorage的函数
  const saveToLocalStorage = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setShowSaveNotification(true);
  };

  useEffect(() => {
    // 检查数据是否真的变化了
    const savedData = localStorage.getItem(STORAGE_KEY);
    const currentData = JSON.stringify(inputs);
    
    if (savedData !== currentData) {
      saveToLocalStorage(inputs);
    }

    // 计算结果
    const {
      totalUsers,
      concurrentPercentage,
      transactionsPerMinute,
      queriesPerTransaction,
      m2,
      m1,
      m4
    } = inputs;

    const totalUsersNum = parseFloat(totalUsers) || 0;
    const concurrentPercentageNum = parseFloat(concurrentPercentage) || 0;
    const transactionsPerMinuteNum = parseFloat(transactionsPerMinute) || 0;
    const queriesPerTransactionNum = parseFloat(queriesPerTransaction) || 0;
    const m2Num = parseFloat(m2) || 0;
    const m1Num = parseFloat(m1) || 0;
    const m4Num = parseFloat(m4) || 0;

    // 新增：计算峰值并发人数
    const concurrentUsers = totalUsersNum * (concurrentPercentageNum / 100);

    let tpsValue = 0;
    let tpmResult = 0;
    let explanation = '';

    if (totalUsersNum > 0 && concurrentPercentageNum > 0 && transactionsPerMinuteNum > 0 && queriesPerTransactionNum > 0) {
      // 计算TPS峰值
      tpsValue = concurrentUsers * transactionsPerMinuteNum * queriesPerTransactionNum;
      
      // 计算TPM
      if (m1Num < 100 && m2Num > 0 && m4Num > 0) {
        tpmResult = (tpsValue * m2Num) / (1 - (m1Num / 100)) * m4Num;
        
        explanation = `数据库服务器主要处理省四套班子部署的协同办公平台的数据访问、数据转换、数据存储，采用TPC-C值测算。

计算公式为：TPM = TPS峰值 × M2 / (1 - M1) × M4

其中：
- TPS峰值为系统访问量最大值
- M2为联机事务处理所对应的TPC值，其取值根据具体的业务处理情况不同，一般系统的M2的值应该在5～15范围内
- M1是留给CPU的信息量
- M4是预留未来数据库系统扩展的参数

计算过程：
1. 并发用户数计算：
   - 总用户数：${totalUsersNum}人
   - 并发用户百分比：${concurrentPercentageNum}%
   - 并发用户数 = ${totalUsersNum} × ${concurrentPercentageNum}% = ${concurrentUsers}人

2. TPS峰值计算：
   - 每个客户端每分钟处理事务数：${transactionsPerMinuteNum}
   - 每个事务每分钟查询次数：${queriesPerTransactionNum}
   - TPS峰值 = ${concurrentUsers} × ${transactionsPerMinuteNum} × ${queriesPerTransactionNum} = ${tpsValue}

3. TPM计算：
   - M2（联机事务处理TPC值）= ${m2Num}
   - M1（CPU信息量）= ${m1Num}%
   - M4（预留扩展参数）= ${m4Num}
   - TPM = ${tpsValue} × ${m2Num} / (1 - ${m1Num}%) × ${m4Num}
   - TPM = ${tpsValue} × ${m2Num} / (1 - ${m1Num/100}) × ${m4Num} = ${tpmResult.toFixed(0)}tpmC`;
      } else {
        explanation = '错误：M1不能大于或等于100%，M2和M4必须大于0';
      }
    }

    onResultChange({
      coreCount: Math.ceil(tpmResult / BASELINE_SINGLE_CORE.tpcc * 1.1), // 考虑10%虚拟化开销
      tpccValue: tpmResult,
      explanation
    });
  }, [inputs]);

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowSaveNotification(false);
  };

  // 新增：峰值并发人数计算
  const concurrentUsers = (parseFloat(inputs.totalUsers) || 0) * ((parseFloat(inputs.concurrentPercentage) || 0) / 100);

  return (
    <Box component={Paper} p={3}>
      <Typography variant="h6" gutterBottom>
        TPC-C 计算器
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="总用户数"
            type="number"
            value={inputs.totalUsers}
            onChange={handleInputChange('totalUsers')}
            helperText="系统总用户数（人）"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="并发用户百分比(%)"
            type="number"
            value={inputs.concurrentPercentage}
            onChange={handleInputChange('concurrentPercentage')}
            helperText="并发用户占总用户数的百分比"
          />
        </Grid>

        {/* 新增：峰值并发人数显示 */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="峰值并发人数"
            value={Number.isFinite(concurrentUsers) ? concurrentUsers.toFixed(1) + ' 人' : '-'}
            disabled
            helperText="自动计算：总用户数 × 并发用户百分比"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="每个客户端每分钟处理事务数"
            type="number"
            value={inputs.transactionsPerMinute}
            onChange={handleInputChange('transactionsPerMinute')}
            helperText="每个客户端每分钟处理的事务数量"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="每个事务每分钟查询次数"
            type="number"
            value={inputs.queriesPerTransaction}
            onChange={handleInputChange('queriesPerTransaction')}
            helperText="每个事务每分钟的查询次数"
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="M2（联机事务处理TPC值）"
            type="number"
            value={inputs.m2}
            onChange={handleInputChange('m2')}
            helperText="每个事务平均消耗的TPC-C值（一般取5-15，越大表示业务更复杂）"
          />
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="M1（CPU信息量百分比）"
            type="number"
            value={inputs.m1}
            onChange={handleInputChange('m1')}
            helperText="建议留给CPU的安全余量百分比（如60%表示只用40%的CPU，留60%做冗余）"
          />
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="M4（预留扩展参数）"
            type="number"
            step="0.1"
            value={inputs.m4}
            onChange={handleInputChange('m4')}
            helperText="为将来系统扩展预留的系数（如1.3表示多预留30%的能力）"
          />
        </Grid>
      </Grid>

      {parseFloat(inputs.m1) >= 100 && (
        <Box mt={2}>
          <Alert severity="error">
            M1（CPU信息量）不能大于或等于100%
          </Alert>
        </Box>
      )}

      <Snackbar
        open={showSaveNotification}
        autoHideDuration={2000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity="success" sx={{ width: '100%' }}>
          数据已自动保存
        </Alert>
      </Snackbar>
    </Box>
  );
} 