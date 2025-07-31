import React, { useState, useEffect } from 'react';
import { benchmarkConfigManager } from '../services/performanceCalculator';
import './BenchmarkConfigManager.css';

const BenchmarkConfigManager = () => {
  const [configs, setConfigs] = useState({});
  const [editingKey, setEditingKey] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newConfigForm, setNewConfigForm] = useState({
    key: '',
    name: '',
    specjbb: '',
    tpcc: '',
    description: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = () => {
    const allConfigs = benchmarkConfigManager.getAllConfigs();
    setConfigs(allConfigs);
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleEdit = (key) => {
    setEditingKey(key);
    setEditForm({ ...configs[key] });
  };

  const handleSaveEdit = () => {
    const validation = benchmarkConfigManager.validateConfig(editForm);
    if (!validation.isValid) {
      showMessage('error', validation.errors.join(', '));
      return;
    }

    const success = benchmarkConfigManager.updateConfig(editingKey, editForm);
    if (success) {
      showMessage('success', '配置更新成功');
      loadConfigs();
      setEditingKey(null);
      setEditForm({});
    } else {
      showMessage('error', '配置更新失败');
    }
  };

  const handleCancelEdit = () => {
    setEditingKey(null);
    setEditForm({});
  };

  const handleAddNew = () => {
    const validation = benchmarkConfigManager.validateConfig(newConfigForm);
    if (!validation.isValid) {
      showMessage('error', validation.errors.join(', '));
      return;
    }

    if (!newConfigForm.key) {
      showMessage('error', '处理器标识不能为空');
      return;
    }

    const success = benchmarkConfigManager.addConfig(newConfigForm.key, {
      name: newConfigForm.name,
      specjbb: parseInt(newConfigForm.specjbb),
      tpcc: parseInt(newConfigForm.tpcc),
      description: newConfigForm.description
    });

    if (success) {
      showMessage('success', '新配置添加成功');
      loadConfigs();
      setShowAddForm(false);
      setNewConfigForm({
        key: '',
        name: '',
        specjbb: '',
        tpcc: '',
        description: ''
      });
    } else {
      showMessage('error', '配置添加失败，可能已存在相同标识的配置');
    }
  };

  const handleDelete = (key) => {
    if (window.confirm(`确定要删除配置 "${configs[key].name}" 吗？`)) {
      const success = benchmarkConfigManager.removeConfig(key);
      if (success) {
        showMessage('success', '配置删除成功');
        loadConfigs();
      } else {
        showMessage('error', '配置删除失败，默认配置不能删除');
      }
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm('确定要重置为默认配置吗？这将丢失所有自定义配置。')) {
      const success = benchmarkConfigManager.resetToDefault();
      if (success) {
        showMessage('success', '已重置为默认配置');
        loadConfigs();
      } else {
        showMessage('error', '重置失败');
      }
    }
  };

  const handleExport = () => {
    const configJson = benchmarkConfigManager.exportConfig();
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'benchmark-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showMessage('success', '配置导出成功');
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const success = benchmarkConfigManager.importConfig(e.target.result);
        if (success) {
          showMessage('success', '配置导入成功');
          loadConfigs();
        } else {
          showMessage('error', '配置导入失败，请检查文件格式');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="benchmark-config-manager">
      <div className="config-header">
        <h2>服务器性能基准配置管理</h2>
        <div className="config-actions">
          <button onClick={() => setShowAddForm(true)} className="btn btn-primary">
            添加新配置
          </button>
          <button onClick={handleExport} className="btn btn-secondary">
            导出配置
          </button>
          <label className="btn btn-secondary file-input-label">
            导入配置
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
          </label>
          <button onClick={handleResetToDefault} className="btn btn-warning">
            重置默认
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {showAddForm && (
        <div className="add-form">
          <h3>添加新的基准配置</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>处理器标识:</label>
              <input
                type="text"
                value={newConfigForm.key}
                onChange={(e) => setNewConfigForm({...newConfigForm, key: e.target.value})}
                placeholder="例如: e5_2680_v4"
              />
            </div>
            <div className="form-group">
              <label>处理器名称:</label>
              <input
                type="text"
                value={newConfigForm.name}
                onChange={(e) => setNewConfigForm({...newConfigForm, name: e.target.value})}
                placeholder="例如: E5-2680 V4"
              />
            </div>
            <div className="form-group">
              <label>SPECjbb2005值:</label>
              <input
                type="number"
                value={newConfigForm.specjbb}
                onChange={(e) => setNewConfigForm({...newConfigForm, specjbb: e.target.value})}
                placeholder="例如: 1500000"
              />
            </div>
            <div className="form-group">
              <label>TPC-C值:</label>
              <input
                type="number"
                value={newConfigForm.tpcc}
                onChange={(e) => setNewConfigForm({...newConfigForm, tpcc: e.target.value})}
                placeholder="例如: 800000"
              />
            </div>
            <div className="form-group full-width">
              <label>描述:</label>
              <input
                type="text"
                value={newConfigForm.description}
                onChange={(e) => setNewConfigForm({...newConfigForm, description: e.target.value})}
                placeholder="处理器描述信息"
              />
            </div>
          </div>
          <div className="form-actions">
            <button onClick={handleAddNew} className="btn btn-primary">
              保存
            </button>
            <button onClick={() => setShowAddForm(false)} className="btn btn-secondary">
              取消
            </button>
          </div>
        </div>
      )}

      <div className="config-table">
        <table>
          <thead>
            <tr>
              <th>处理器名称</th>
              <th>SPECjbb2005</th>
              <th>TPC-C</th>
              <th>描述</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(configs).map(([key, config]) => (
              <tr key={key}>
                {editingKey === key ? (
                  <>
                    <td>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={editForm.specjbb}
                        onChange={(e) => setEditForm({...editForm, specjbb: parseInt(e.target.value)})}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={editForm.tpcc}
                        onChange={(e) => setEditForm({...editForm, tpcc: parseInt(e.target.value)})}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={editForm.description}
                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      />
                    </td>
                    <td>
                      <button onClick={handleSaveEdit} className="btn btn-sm btn-primary">
                        保存
                      </button>
                      <button onClick={handleCancelEdit} className="btn btn-sm btn-secondary">
                        取消
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{config.name}</td>
                    <td>{config.specjbb?.toLocaleString()}</td>
                    <td>{config.tpcc?.toLocaleString()}</td>
                    <td>{config.description}</td>
                    <td>
                      <button onClick={() => handleEdit(key)} className="btn btn-sm btn-primary">
                        编辑
                      </button>
                      {key !== 'singleCore_2_2GHz' && (
                        <button onClick={() => handleDelete(key)} className="btn btn-sm btn-danger">
                          删除
                        </button>
                      )}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BenchmarkConfigManager;
