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
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  Tooltip,
  TextareaAutosize
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SaveIcon from '@mui/icons-material/Save';
import ListIcon from '@mui/icons-material/List';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LoadIcon from '@mui/icons-material/CloudDownload';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import ClearAllIcon from '@mui/icons-material/ClearAll';

const STORAGE_KEY = 'serverResourcesData';
const SAVED_CONFIGS_KEY = 'serverResourcesSavedConfigs';
const MAX_SAVED_CONFIGS = 50;

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
  const [copySuccess, setCopySuccess] = useState(false);
  
  // 新增状态管理
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [configListDialogOpen, setConfigListDialogOpen] = useState(false);
  const [configName, setConfigName] = useState('');
  const [savedConfigs, setSavedConfigs] = useState(() => {
    const saved = localStorage.getItem(SAVED_CONFIGS_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // 复制粘贴功能状态
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [pasteDialogOpen, setPasteDialogOpen] = useState(false);
  const [pasteData, setPasteData] = useState('');
  const [pasteSuccess, setPasteSuccess] = useState(false);
  const [pasteError, setPasteError] = useState('');
  const [selectAll, setSelectAll] = useState(false);

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

  // 生成可复制到Excel的表格文本
  const generateTableText = () => {
    const headers = [
      '服务器名称', 'CPU核数', '内存(GB)', '操作系统', '系统盘(GB)', '数据盘(GB)', '总存储(GB)', '备注'
    ];
    const dataRows = rows.map(row => [
      row.serverName,
      row.cpuCores,
      row.memory,
      row.os,
      row.systemDisk,
      row.dataDisk,
      row.totalStorage,
      row.notes
    ].join('\t'));
    // 总计行
    const totalRow = [
      '总计',
      totals.cpuCores,
      totals.memory,
      '',
      totals.systemDisk,
      totals.dataDisk,
      totals.totalStorage,
      ''
    ].join('\t');
    return [headers.join('\t'), ...dataRows, totalRow].join('\n');
  };

  const handleCopyTable = () => {
    const text = generateTableText();
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
    });
  };

  // 保存当前配置
  const saveCurrentConfig = () => {
    if (!configName.trim()) {
      alert('请输入配置名称');
      return;
    }

    if (rows.length === 1 && !rows[0].serverName) {
      alert('请至少添加一个服务器配置');
      return;
    }

    const config = {
      id: Date.now().toString(),
      name: configName.trim(),
      timestamp: new Date().toLocaleString(),
      data: rows.filter(row => row.serverName), // 只保存有名称的服务器
      totals: calculateTotals()
    };

    let newSavedConfigs = [...savedConfigs];
    
    // 检查是否超过最大数量
    if (newSavedConfigs.length >= MAX_SAVED_CONFIGS) {
      // 删除最旧的配置
      newSavedConfigs = newSavedConfigs.slice(1);
    }
    
    newSavedConfigs.push(config);
    
    setSavedConfigs(newSavedConfigs);
    localStorage.setItem(SAVED_CONFIGS_KEY, JSON.stringify(newSavedConfigs));
    
    setSaveDialogOpen(false);
    setConfigName('');
    setSaveSuccess(true);
  };

  // 加载配置
  const loadConfig = (config) => {
    setRows(config.data.length ? config.data : [{ ...defaultRow }]);
    setConfigListDialogOpen(false);
  };

  // 删除已保存的配置
  const deleteSavedConfig = (configId) => {
    if (window.confirm('确定要删除这个配置吗？')) {
      const newSavedConfigs = savedConfigs.filter(config => config.id !== configId);
      setSavedConfigs(newSavedConfigs);
      localStorage.setItem(SAVED_CONFIGS_KEY, JSON.stringify(newSavedConfigs));
    }
  };

  // 打开保存对话框
  const openSaveDialog = () => {
    setConfigName('');
    setSaveDialogOpen(true);
  };

  // 打开配置列表对话框
  const openConfigListDialog = () => {
    setConfigListDialogOpen(true);
  };

  // 复制粘贴功能方法
  // 复制单行服务器配置
  const copySingleRow = (index) => {
    const row = rows[index];
    const rowData = {
      serverName: row.serverName,
      cpuCores: row.cpuCores,
      memory: row.memory,
      os: row.os,
      systemDisk: row.systemDisk,
      dataDisk: row.dataDisk,
      notes: row.notes
    };
    const jsonData = JSON.stringify(rowData, null, 2);
    navigator.clipboard.writeText(jsonData).then(() => {
      setCopySuccess(true);
    });
  };

  // 复制选中的多行配置
  const copySelectedRows = () => {
    if (selectedRows.size === 0) {
      alert('请先选择要复制的行');
      return;
    }
    const selectedData = Array.from(selectedRows).map(index => {
      const row = rows[index];
      return {
        serverName: row.serverName,
        cpuCores: row.cpuCores,
        memory: row.memory,
        os: row.os,
        systemDisk: row.systemDisk,
        dataDisk: row.dataDisk,
        notes: row.notes
      };
    });
    const jsonData = JSON.stringify(selectedData, null, 2);
    navigator.clipboard.writeText(jsonData).then(() => {
      setCopySuccess(true);
    });
  };

  // 处理行选择
  const handleRowSelect = (index) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
    setSelectAll(newSelected.size === rows.length);
  };

  // 全选/取消全选
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows(new Set());
      setSelectAll(false);
    } else {
      setSelectedRows(new Set(rows.map((_, index) => index)));
      setSelectAll(true);
    }
  };

  // 打开粘贴对话框
  const openPasteDialog = () => {
    setPasteData('');
    setPasteError('');
    setPasteDialogOpen(true);
  };

  // 解析粘贴数据
  const parsePasteData = (data) => {
    try {
      // 尝试解析JSON格式
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      } else if (typeof parsed === 'object') {
        return [parsed];
      }
    } catch (e) {
      // 如果不是JSON，尝试解析表格格式（制表符分隔）
      const lines = data.trim().split('\n');
      if (lines.length > 1) {
        const headers = lines[0].split('\t');
        const dataRows = lines.slice(1).map(line => {
          const values = line.split('\t');
          const row = { ...defaultRow };
          
          // 根据表头映射数据
          headers.forEach((header, index) => {
            const value = values[index] || '';
            switch (header.trim()) {
              case '服务器名称':
                row.serverName = value;
                break;
              case 'CPU核数':
                row.cpuCores = value;
                break;
              case '内存(GB)':
                row.memory = value;
                break;
              case '操作系统':
                row.os = value;
                break;
              case '系统盘(GB)':
                row.systemDisk = value;
                break;
              case '数据盘(GB)':
                row.dataDisk = value;
                break;
              case '备注':
                row.notes = value;
                break;
            }
          });
          return row;
        });
        return dataRows.filter(row => row.serverName); // 过滤掉没有服务器名称的行
      }
    }
    throw new Error('无法解析数据格式');
  };

  // 执行粘贴操作
  const handlePaste = () => {
    if (!pasteData.trim()) {
      setPasteError('请输入要粘贴的数据');
      return;
    }

    try {
      const parsedData = parsePasteData(pasteData);
      if (parsedData.length === 0) {
        setPasteError('没有找到有效的服务器配置数据');
        return;
      }

      // 验证数据格式
      const validData = parsedData.map(item => ({
        serverName: item.serverName || '',
        cpuCores: item.cpuCores || '',
        memory: item.memory || '',
        os: item.os || '',
        systemDisk: item.systemDisk || '',
        dataDisk: item.dataDisk || '',
        totalStorage: '',
        notes: item.notes || ''
      }));

      // 添加到现有数据中
      const newRows = [...rows];
      // 如果当前只有一个空行，替换它
      if (newRows.length === 1 && !newRows[0].serverName) {
        newRows.splice(0, 1, ...validData);
      } else {
        newRows.push(...validData);
      }

      setRows(newRows);
      setPasteDialogOpen(false);
      setPasteSuccess(true);
      setPasteData('');
      setPasteError('');
    } catch (error) {
      setPasteError(error.message || '数据格式错误，请检查输入格式');
    }
  };

  // 快速粘贴功能 - 直接从剪贴板读取并添加一行
  const handleQuickPaste = async () => {
    try {
      // 从剪贴板读取数据
      const clipboardData = await navigator.clipboard.readText();
      if (!clipboardData.trim()) {
        alert('剪贴板为空，请先复制服务器配置数据');
        return;
      }

      // 解析剪贴板数据
      const parsedData = parsePasteData(clipboardData);
      if (parsedData.length === 0) {
        alert('剪贴板中没有找到有效的服务器配置数据');
        return;
      }

      // 验证数据格式
      const validData = parsedData.map(item => ({
        serverName: item.serverName || '',
        cpuCores: item.cpuCores || '',
        memory: item.memory || '',
        os: item.os || '',
        systemDisk: item.systemDisk || '',
        dataDisk: item.dataDisk || '',
        totalStorage: '',
        notes: item.notes || ''
      }));

      // 添加到现有数据中
      const newRows = [...rows];
      // 如果当前只有一个空行，替换它
      if (newRows.length === 1 && !newRows[0].serverName) {
        newRows.splice(0, 1, ...validData);
      } else {
        newRows.push(...validData);
      }

      setRows(newRows);
      setPasteSuccess(true);
    } catch (error) {
      console.error('快速粘贴失败:', error);
      if (error.name === 'NotAllowedError') {
        alert('无法访问剪贴板，请使用"粘贴数据"按钮手动粘贴');
      } else {
        alert('粘贴失败：' + (error.message || '数据格式错误'));
      }
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          服务器资源配置
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addRow}
          >
            添加服务器
          </Button>
          <Button
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={handleCopyTable}
          >
            复制表格
          </Button>
          <Button
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={copySelectedRows}
            disabled={selectedRows.size === 0}
          >
            复制选中({selectedRows.size})
          </Button>
          <Button
            variant="outlined"
            startIcon={<ContentPasteIcon />}
            onClick={openPasteDialog}
          >
            粘贴数据
          </Button>
          <Button
            variant="contained"
            startIcon={<ContentPasteIcon />}
            onClick={handleQuickPaste}
            color="primary"
          >
            快速粘贴
          </Button>
          <Button
            variant="outlined"
            startIcon={selectAll ? <ClearAllIcon /> : <SelectAllIcon />}
            onClick={handleSelectAll}
          >
            {selectAll ? '取消全选' : '全选'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={openSaveDialog}
          >
            保存配置
          </Button>
          <Button
            variant="outlined"
            startIcon={<ListIcon />}
            onClick={openConfigListDialog}
          >
            加载配置
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={clearAllData}
          >
            清空数据
          </Button>
        </Box>
      </Box>
      
      <TableContainer component={Paper} sx={{ width: '100%', overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 1200 }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectAll}
                  onChange={handleSelectAll}
                  indeterminate={selectedRows.size > 0 && selectedRows.size < rows.length}
                />
              </TableCell>
              <TableCell sx={{ minWidth: 200 }}>服务器名称</TableCell>
              <TableCell align="right" sx={{ minWidth: 120 }}>CPU核数</TableCell>
              <TableCell align="right" sx={{ minWidth: 120 }}>内存(GB)</TableCell>
              <TableCell sx={{ minWidth: 150 }}>操作系统</TableCell>
              <TableCell align="right" sx={{ minWidth: 120 }}>系统盘(GB)</TableCell>
              <TableCell align="right" sx={{ minWidth: 120 }}>数据盘(GB)</TableCell>
              <TableCell align="right" sx={{ minWidth: 120 }}>总存储(GB)</TableCell>
              <TableCell sx={{ minWidth: 200 }}>备注</TableCell>
              <TableCell align="center" sx={{ minWidth: 120 }}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index} selected={selectedRows.has(index)}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedRows.has(index)}
                    onChange={() => handleRowSelect(index)}
                  />
                </TableCell>
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
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="复制此行">
                      <IconButton 
                        size="small" 
                        onClick={() => copySingleRow(index)}
                      >
                        <ContentCopyIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="删除此行">
                      <IconButton 
                        size="small" 
                        onClick={() => deleteRow(index)}
                        disabled={rows.length === 1}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {/* 总计行 */}
            <TableRow>
              <TableCell padding="checkbox" />
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

      {/* 可复制到Excel的表格文本和复制按钮 */}
      <Paper elevation={0} sx={{ p: 2, mt: 3, background: '#f7f7f7' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle1" sx={{ flex: 1 }}>可复制到 Excel 的表格</Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ContentCopyIcon />}
            onClick={handleCopyTable}
          >
            复制
          </Button>
        </Box>
        {/* 用Table展示表格内容 */}
        <TableContainer>
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
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell>{row.serverName}</TableCell>
                  <TableCell align="right">{row.cpuCores}</TableCell>
                  <TableCell align="right">{row.memory}</TableCell>
                  <TableCell>{row.os}</TableCell>
                  <TableCell align="right">{row.systemDisk}</TableCell>
                  <TableCell align="right">{row.dataDisk}</TableCell>
                  <TableCell align="right">{row.totalStorage}</TableCell>
                  <TableCell>{row.notes}</TableCell>
                </TableRow>
              ))}
              {/* 总计行 */}
              <TableRow>
                <TableCell><Typography variant="subtitle2">总计</Typography></TableCell>
                <TableCell align="right"><Typography variant="subtitle2">{totals.cpuCores}</Typography></TableCell>
                <TableCell align="right"><Typography variant="subtitle2">{totals.memory}</Typography></TableCell>
                <TableCell />
                <TableCell align="right"><Typography variant="subtitle2">{totals.systemDisk}</Typography></TableCell>
                <TableCell align="right"><Typography variant="subtitle2">{totals.dataDisk}</Typography></TableCell>
                <TableCell align="right"><Typography variant="subtitle2">{totals.totalStorage}</Typography></TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

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

      {/* 保存配置对话框 */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>保存当前配置</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="配置名称"
            fullWidth
            variant="outlined"
            value={configName}
            onChange={(e) => setConfigName(e.target.value)}
            placeholder="请输入配置名称"
            sx={{ mt: 2 }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            当前已保存 {savedConfigs.length} / {MAX_SAVED_CONFIGS} 个配置
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>取消</Button>
          <Button onClick={saveCurrentConfig} variant="contained">
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 配置列表对话框 */}
      <Dialog 
        open={configListDialogOpen} 
        onClose={() => setConfigListDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>已保存的配置列表</DialogTitle>
        <DialogContent>
          {savedConfigs.length === 0 ? (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              暂无保存的配置
            </Typography>
          ) : (
            <List>
              {savedConfigs.map((config) => (
                <Accordion key={config.id} sx={{ mb: 1 }}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`panel-${config.id}-content`}
                    id={`panel-${config.id}-header`}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1">{config.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          保存时间: {config.timestamp}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip 
                          label={`${config.data.length} 台服务器`} 
                          size="small" 
                          variant="outlined" 
                        />
                        <Chip 
                          label={`${config.totals.cpuCores} 核`} 
                          size="small" 
                          variant="outlined" 
                        />
                        <Chip 
                          label={`${config.totals.memory} GB`} 
                          size="small" 
                          variant="outlined" 
                        />
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        服务器详情:
                      </Typography>
                      {config.data.map((server, idx) => (
                        <Typography key={idx} variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
                          • {server.serverName}: {server.cpuCores}核, {server.memory}GB, {server.totalStorage}GB存储
                        </Typography>
                      ))}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<LoadIcon />}
                        onClick={() => loadConfig(config)}
                      >
                        加载配置
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => deleteSavedConfig(config.id)}
                      >
                        删除
                      </Button>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigListDialogOpen(false)}>关闭</Button>
        </DialogActions>
      </Dialog>

      {/* 粘贴数据对话框 */}
      <Dialog open={pasteDialogOpen} onClose={() => setPasteDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>粘贴服务器配置数据</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            支持以下格式：
            <br />• JSON格式（复制的服务器配置数据）
            <br />• 表格格式（从Excel复制的制表符分隔数据）
          </Typography>
          <TextField
            multiline
            rows={10}
            fullWidth
            variant="outlined"
            placeholder="请粘贴服务器配置数据..."
            value={pasteData}
            onChange={(e) => setPasteData(e.target.value)}
            error={!!pasteError}
            helperText={pasteError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasteDialogOpen(false)}>取消</Button>
          <Button onClick={handlePaste} variant="contained">粘贴</Button>
        </DialogActions>
      </Dialog>

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
      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        onClose={() => setCopySuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setCopySuccess(false)} severity="success" sx={{ width: '100%' }}>
          表格内容已复制，可直接粘贴到 Excel！
        </Alert>
      </Snackbar>
      <Snackbar
        open={saveSuccess}
        autoHideDuration={3000}
        onClose={() => setSaveSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSaveSuccess(false)} severity="success" sx={{ width: '100%' }}>
          配置已成功保存！
        </Alert>
      </Snackbar>
      <Snackbar
        open={pasteSuccess}
        autoHideDuration={3000}
        onClose={() => setPasteSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setPasteSuccess(false)} severity="success" sx={{ width: '100%' }}>
          数据粘贴成功！
        </Alert>
      </Snackbar>
    </Box>
  );
} 