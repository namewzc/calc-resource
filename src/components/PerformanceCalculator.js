import React, { useState } from 'react';
import {
  Box,
  Tab,
  Tabs,
  Typography,
  Paper,
  Container,
  Grid,
  Divider
} from '@mui/material';
import SPECjbbCalculator from './calculators/SPECjbbCalculator';
import TPCCCalculator from './calculators/TPCCCalculator';
import ResourceSummary from './ResourceSummary';
import ServerResources from './ServerResources';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`calculator-tabpanel-${index}`}
      aria-labelledby={`calculator-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function PerformanceCalculator() {
  const [tabValue, setTabValue] = useState(0);
  const [results, setResults] = useState({
    specjbb: null,
    tpcc: null
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSPECjbbResult = (result) => {
    setResults(prev => ({
      ...prev,
      specjbb: result
    }));
  };

  const handleTPCCResult = (result) => {
    setResults(prev => ({
      ...prev,
      tpcc: result
    }));
  };

  return (
    <Box sx={{ width: '100%', px: 2, py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mx: 'auto', maxWidth: '100%' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          性能测算工具
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="SPECjbb2005" />
            <Tab label="TPC-C" />
            <Tab label="服务器资源" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <SPECjbbCalculator onResultChange={handleSPECjbbResult} />
          {results.specjbb?.explanation && (
            <>
              <Divider sx={{ my: 4 }} />
              <Typography variant="h6" gutterBottom>
                SPECjbb2005性能测算说明
              </Typography>
              <Typography
                component="pre"
                sx={{
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'inherit',
                  fontSize: 'inherit'
                }}
              >
                {results.specjbb.explanation}
              </Typography>
            </>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <TPCCCalculator onResultChange={handleTPCCResult} />
          {results.tpcc?.explanation && (
            <>
              <Divider sx={{ my: 4 }} />
              <Typography variant="h6" gutterBottom>
                TPC-C性能测算说明
              </Typography>
              <Typography
                component="pre"
                sx={{
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'inherit',
                  fontSize: 'inherit'
                }}
              >
                {results.tpcc.explanation}
              </Typography>
            </>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <ServerResources />
        </TabPanel>

        {(results.specjbb || results.tpcc) && tabValue !== 2 && (
          <Box sx={{ mt: 4 }}>
            <Divider sx={{ mb: 4 }} />
            <ResourceSummary results={results} />
          </Box>
        )}
      </Paper>
    </Box>
  );
} 