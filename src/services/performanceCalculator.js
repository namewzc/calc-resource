// SPECjbb2005计算器
export const calculateSPECjbb2005 = ({
  transactionsPerSecond, // A: 每秒最多需要同时处理的业务交易量
  peakValuePerTransaction, // B: 每笔业务交易需消耗的SPECjbb2005峰值
  redundancyCapacity, // C: 系统的冗余处理能力 (0-1)
  nonJavaResourcePercentage // D: 非Java应用所占用的系统资源百分比 (0-1)
}) => {
  // SPECjbb2005 = A × B / (1 - C - D)
  return (transactionsPerSecond * peakValuePerTransaction) / (1 - redundancyCapacity - nonJavaResourcePercentage);
};

// 计算每秒业务交易量
export const calculateTransactionsPerSecond = ({
  peakConcurrentTransactions, // 平台忙时并发业务量
  requestsPerTransaction, // 每笔业务发出应用请求数
  transactionsPerRequest // 平均每个请求处理的应用类事务数
}) => {
  return peakConcurrentTransactions * requestsPerTransaction * transactionsPerRequest;
};

// TPC-C计算器
export const calculateTPCC = ({
  peakTPS, // TPS峰值
  m2, // 联机事务处理TPC值 (5-15)
  m1, // CPU信息量 (0-1)
  m4 // 预留扩展参数
}) => {
  // TPM = TPS峰值 × M2 / (1 - M1) × M4
  return (peakTPS * m2) / (1 - m1) * m4;
};

// 计算TPS峰值
export const calculatePeakTPS = ({
  totalUsers, // 总用户数
  concurrentPercentage, // 并发用户百分比 (0-1)
  transactionsPerMinute, // 每个客户端每分钟处理事务数
  queriesPerTransaction // 每个事务查询次数
}) => {
  return totalUsers * concurrentPercentage * transactionsPerMinute * queriesPerTransaction;
};

// 计算所需服务器资源
export const calculateServerResources = ({
  tpccValue, // TPC-C测算值
  specjbbValue, // SPECjbb2005测算值
  baselineSingleCore // 基准值对象
}) => {
  const virtualizationOverhead = 0.1; // 10%虚拟化开销

  const dbServerCores = Math.ceil(tpccValue / baselineSingleCore.tpcc / (1 - virtualizationOverhead));
  const appServerCores = Math.ceil(specjbbValue / baselineSingleCore.specjbb / (1 - virtualizationOverhead));

  return {
    dbServerCores,
    appServerCores
  };
};

// 基准值配置
export const BASELINE_SINGLE_CORE = {
  specjbb: 118501, // 单核心SPECjbb2005基准值
  tpcc: 80002 // 单核心TPC-C基准值
}; 