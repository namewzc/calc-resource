// 服务器性能测算基准参考值配置文件
// 表3 服务器性能测算基准参考值

/**
 * 默认基准参考值配置
 * 这些值可以通过配置管理器进行手动修改
 */
const DEFAULT_BENCHMARK_CONFIG = {
  // E5-4820 V3 处理器基准值
  e5_4820_v3: {
    name: 'E5-4820 V3',
    specjbb: 1023421, // SPECjbb2005基准值
    tpcc: 690926, // TPC-C基准值
    description: 'Intel E5-4820 V3 处理器基准性能值'
  },
  // 折算单核心（2.2GHz）基准值
  singleCore_2_2GHz: {
    name: '单核心 2.2GHz',
    specjbb: 118501, // 单核心SPECjbb2005基准值
    tpcc: 80002, // 单核心TPC-C基准值
    description: '折算单核心 2.2GHz 基准性能值'
  }
};

/**
 * 基准配置管理器
 */
class BenchmarkConfigManager {
  constructor() {
    this.config = { ...DEFAULT_BENCHMARK_CONFIG };
    this.loadFromStorage();
  }

  /**
   * 从本地存储加载配置
   */
  loadFromStorage() {
    try {
      const stored = localStorage.getItem('benchmarkConfig');
      if (stored) {
        const parsedConfig = JSON.parse(stored);
        this.config = { ...DEFAULT_BENCHMARK_CONFIG, ...parsedConfig };
      }
    } catch (error) {
      console.warn('加载基准配置失败，使用默认配置:', error);
      this.config = { ...DEFAULT_BENCHMARK_CONFIG };
    }
  }

  /**
   * 保存配置到本地存储
   */
  saveToStorage() {
    try {
      localStorage.setItem('benchmarkConfig', JSON.stringify(this.config));
      return true;
    } catch (error) {
      console.error('保存基准配置失败:', error);
      return false;
    }
  }

  /**
   * 获取所有基准配置
   */
  getAllConfigs() {
    return { ...this.config };
  }

  /**
   * 获取指定处理器的基准配置
   */
  getConfig(processorKey) {
    return this.config[processorKey] || null;
  }

  /**
   * 更新指定处理器的基准配置
   */
  updateConfig(processorKey, newConfig) {
    if (this.config[processorKey]) {
      this.config[processorKey] = {
        ...this.config[processorKey],
        ...newConfig
      };
      return this.saveToStorage();
    }
    return false;
  }

  /**
   * 添加新的处理器基准配置
   */
  addConfig(processorKey, config) {
    if (!this.config[processorKey]) {
      this.config[processorKey] = {
        name: config.name || processorKey,
        specjbb: config.specjbb || 0,
        tpcc: config.tpcc || 0,
        description: config.description || ''
      };
      return this.saveToStorage();
    }
    return false;
  }

  /**
   * 删除处理器基准配置
   */
  removeConfig(processorKey) {
    if (this.config[processorKey] && processorKey !== 'singleCore_2_2GHz') {
      delete this.config[processorKey];
      return this.saveToStorage();
    }
    return false; // 不允许删除默认的单核心配置
  }

  /**
   * 重置为默认配置
   */
  resetToDefault() {
    this.config = { ...DEFAULT_BENCHMARK_CONFIG };
    return this.saveToStorage();
  }

  /**
   * 验证配置数据
   */
  validateConfig(config) {
    const errors = [];
    
    if (!config.name || typeof config.name !== 'string') {
      errors.push('处理器名称不能为空');
    }
    
    if (!config.specjbb || typeof config.specjbb !== 'number' || config.specjbb <= 0) {
      errors.push('SPECjbb2005值必须是大于0的数字');
    }
    
    if (!config.tpcc || typeof config.tpcc !== 'number' || config.tpcc <= 0) {
      errors.push('TPC-C值必须是大于0的数字');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 导出配置为JSON
   */
  exportConfig() {
    return JSON.stringify(this.config, null, 2);
  }

  /**
   * 从JSON导入配置
   */
  importConfig(jsonString) {
    try {
      const importedConfig = JSON.parse(jsonString);
      
      // 验证导入的配置
      for (const [key, config] of Object.entries(importedConfig)) {
        const validation = this.validateConfig(config);
        if (!validation.isValid) {
          throw new Error(`配置 ${key} 验证失败: ${validation.errors.join(', ')}`);
        }
      }
      
      this.config = { ...DEFAULT_BENCHMARK_CONFIG, ...importedConfig };
      return this.saveToStorage();
    } catch (error) {
      console.error('导入配置失败:', error);
      return false;
    }
  }
}

// 创建全局配置管理器实例
const benchmarkConfigManager = new BenchmarkConfigManager();

export { benchmarkConfigManager, DEFAULT_BENCHMARK_CONFIG };
export default benchmarkConfigManager;
