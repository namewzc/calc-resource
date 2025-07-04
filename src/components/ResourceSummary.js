import React from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box
} from '@mui/material';
import { calculateServerResources, BASELINE_SINGLE_CORE } from '../services/performanceCalculator';

export default function ResourceSummary({ results }) {
  const serverResources = calculateServerResources({
    tpccValue: results.tpcc?.tpccValue || 0,
    specjbbValue: results.specjbb?.specjbbValue || 0,
    baselineSingleCore: BASELINE_SINGLE_CORE
  });

  const generateSummaryText = () => {
    return `
综上，平台的总体处理量如下：
表2 平台总体处理量
序号\t应用程序处理量（Specjbb2005）\t数据库处理量（TPC-C）
1\t${results.specjbb?.specjbbValue?.toLocaleString() || '-'}\t${results.tpcc?.tpccValue?.toLocaleString() || '-'}

3.1.2.1.3.2.4 服务器参考基准
由于服务器CPU处理能力仅有部分型号参考，参照E5-4820 V3系列处理器（主频1.9GHz、10核心、16G内存、500G硬盘）的TPC-C、Specjbb2005有关测算结果换算至目前主流CPU单核心（主频2.2GHz），结果如下：

表3 服务器性能测算基准参考值
CPU\tSPECjbb2005\tTPC-C
E5-4820 V3\t1023421\t690926
折算单核心（2.2GHz）\t118501\t80002

基于上表折算所需服务器数量：
1. 所需数据库服务器资源数量（核数）= ${results.tpcc?.tpccValue?.toLocaleString() || '-'} / ${BASELINE_SINGLE_CORE.tpcc} / (1 - 10%) = ${serverResources.dbServerCores}核
2. 所需应用服务器资源数量（核数）= ${results.specjbb?.specjbbValue?.toLocaleString() || '-'} / ${BASELINE_SINGLE_CORE.specjbb} / (1 - 10%) = ${serverResources.appServerCores}核

注：计算结果已考虑10%虚拟化开销。`;
  };

  return (
    <Box>
      {(results.specjbb || results.tpcc) && (
        <>
          {/* <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              性能测算说明
            </Typography>
            {results.specjbb?.explanation && (
              <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                {results.specjbb.explanation}
              </Typography>
            )}
            {results.tpcc?.explanation && (
              <Typography component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                {results.tpcc.explanation}
              </Typography>
            )}
          </Paper> */}

          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              资源需求汇总
            </Typography>
            <Typography component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
              {generateSummaryText()}
            </Typography>
          </Paper>
        </>
      )}
    </Box>
  );
} 