import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  IconButton,
  Typography,
  Snackbar,
  Alert,
  Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const STORAGE_KEY = 'serverResourcesData';

const defaultRow = {
  serverName: '',
  cpuCores: '',
  memory: '',
  os: '',
  systemDisk: '',
  dataDisk: '',
  totalStorage: '',
  notes: ''
};

export default function ServerResources() {
  const [rows, setRows] = useState(() => {
    // 从localStorage读取初始数据
    const savedData = localStorage.getItem(STORAGE_KEY);
    return savedData ? JSON.parse(savedData) : [{ ...defaultRow }];
  });

  const [showSaveNotification, setShowSaveNotification] = useState(false);

  // 计算总计
  const calculateTotals = () => {
    return rows.reduce((acc, row) => ({
      cpuCores: acc.cpuCores + (parseInt(row.cpuCores) || 0),
      memory: acc.memory + (parseInt(row.memory) || 0),
      systemDisk: acc.systemDisk + (parseInt(row.systemDisk) || 0),
      dataDisk: acc.dataDisk + (parseInt(row.dataDisk) || 0),
      totalStorage: acc.totalStorage + (parseInt(row.totalStorage) || 0)
    }), {
      cpuCores: 0,
      memory: 0,
      systemDisk: 0,
      dataDisk: 0,
      totalStorage: 0
    });
  };

  // 生成配置说明
  const generateExplanation = (totals, servers) => {
    const validServers = servers.filter(server => server.serverName);
    if (validServers.length === 0) {
      return '暂无服务器配置信息';
    }

    const serverDetails = validServers.map((server, index) => 
      `${index + 1}. ${server.serverName}
   - CPU：${server.cpuCores}核
   - 内存：${server.memory}GB
   - 操作系统：${server.os || '未指定'}
   - 系统盘：${server.systemDisk}GB
   - 数据盘：${server.dataDisk}GB
   - 总存储：${server.totalStorage}GB
   - 备注：${server.notes || '无'}`
    ).join('\n\n');

    return `服务器配置清单：

${serverDetails}

系统资源总量：
- CPU总核数：${totals.cpuCores}核
- 内存总容量：${totals.memory}GB
- 存储总容量：${totals.totalStorage}GB（系统盘：${totals.systemDisk}GB，数据盘：${totals.dataDisk}GB）`;
  };

  // 自动计算总存储并保存到localStorage
  useEffect(() => {
    const newRows = rows.map(row => ({
      ...row,
      totalStorage: ((parseInt(row.systemDisk) || 0) + (parseInt(row.dataDisk) || 0)).toString()
    }));
    
    if (JSON.stringify(newRows) !== JSON.stringify(rows)) {
      setRows(newRows);
    }

    // 保存到localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newRows));
    setShowSaveNotification(true);
  }, [rows]);

  const handleChange = (index, field, value) => {
    const newRows = [...rows];
    newRows[index] = {
      ...newRows[index],
      [field]: value
    };
    setRows(newRows);
  };

  const addRow = () => {
    setRows([...rows, { ...defaultRow }]);
  };

  const deleteRow = (index) => {
    const newRows = rows.filter((_, i) => i !== index);
    setRows(newRows.length ? newRows : [{ ...defaultRow }]);
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowSaveNotification(false);
  };

  const clearAllData = () => {
    if (window.confirm('确定要清除所有数据吗？此操作不可恢复。')) {
      setRows([{ ...defaultRow }]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const totals = calculateTotals();

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          服务器资源配置
        </Typography>
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={clearAllData}
        >
          清除所有数据
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>服务器名称</TableCell>
              <TableCell align="right">CPU核数</TableCell>
              <TableCell align="right">内存(GB)</TableCell>
              <TableCell>操作系统</TableCell>
              <TableCell align="right">系统盘(GB)</TableCell>
              <TableCell align="right">数据盘(GB)</TableCell>
              <TableCell align="right">总存储(GB)</TableCell>
              <TableCell>备注</TableCell>
              <TableCell align="center">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                <TableCell>
                  <TextField
                    size="small"
                    fullWidth
                    value={row.serverName}
                    onChange={(e) => handleChange(index, 'serverName', e.target.value)}
                  />
                </TableCell>
                <TableCell align="right">
                  <TextField
                    size="small"
                    type="number"
                    value={row.cpuCores}
                    onChange={(e) => handleChange(index, 'cpuCores', e.target.value)}
                    inputProps={{ style: { textAlign: 'right' } }}
                  />
                </TableCell>
                <TableCell align="right">
                  <TextField
                    size="small"
                    type="number"
                    value={row.memory}
                    onChange={(e) => handleChange(index, 'memory', e.target.value)}
                    inputProps={{ style: { textAlign: 'right' } }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    fullWidth
                    value={row.os}
                    onChange={(e) => handleChange(index, 'os', e.target.value)}
                  />
                </TableCell>
                <TableCell align="right">
                  <TextField
                    size="small"
                    type="number"
                    value={row.systemDisk}
                    onChange={(e) => handleChange(index, 'systemDisk', e.target.value)}
                    inputProps={{ style: { textAlign: 'right' } }}
                  />
                </TableCell>
                <TableCell align="right">
                  <TextField
                    size="small"
                    type="number"
                    value={row.dataDisk}
                    onChange={(e) => handleChange(index, 'dataDisk', e.target.value)}
                    inputProps={{ style: { textAlign: 'right' } }}
                  />
                </TableCell>
                <TableCell align="right">
                  <TextField
                    size="small"
                    type="number"
                    value={row.totalStorage}
                    disabled
                    inputProps={{ style: { textAlign: 'right' } }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    fullWidth
                    value={row.notes}
                    onChange={(e) => handleChange(index, 'notes', e.target.value)}
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton 
                    size="small" 
                    onClick={() => deleteRow(index)}
                    disabled={rows.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {/* 总计行 */}
            <TableRow>
              <TableCell>
                <Typography variant="subtitle2">总计</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle2">{totals.cpuCores}</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle2">{totals.memory}</Typography>
              </TableCell>
              <TableCell />
              <TableCell align="right">
                <Typography variant="subtitle2">{totals.systemDisk}</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle2">{totals.dataDisk}</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle2">{totals.totalStorage}</Typography>
              </TableCell>
              <TableCell />
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={addRow}
        >
          添加服务器
        </Button>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Paper elevation={1} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          配置说明
        </Typography>
        <Typography
          component="pre"
          sx={{
            whiteSpace: 'pre-wrap',
            fontFamily: 'inherit',
            fontSize: 'inherit'
          }}
        >
          {generateExplanation(totals, rows)}
        </Typography>
      </Paper>

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