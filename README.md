# 项目资源测算与说明系统

本项目是一个基于 Node.js + React 的一体化工程，支持多种 IT 资源测算标准（如 SPECjbb2005、TPC-C），自动生成测算说明文档，支持服务器资源录入与统计，所有数据本地持久化，并可通过 Docker/Nginx 部署在指定子路径下。

## 主要功能
- 支持 SPECjbb2005、TPC-C 两种测算标准，Tab 分页切换
- 输入参数实时计算，无需手动点击"计算"
- 自动生成详细、规范的测算说明文档
- 服务器资源配置表支持增删行、统计、录入多项信息
- 服务器资源说明仅展示当前录入的服务器信息
- 所有输入和表格数据浏览器本地持久化，刷新不丢失
- 前端支持子路径部署，后端支持 Docker/Nginx 一键部署

## 技术栈
- 前端：React + Material-UI
- 后端：Node.js + Express
- 部署：Docker + Nginx

## 目录结构
```
project-calc-resource/
├── Dockerfile
├── nginx.conf
├── package.json
├── public/
│   └── index.html
├── src/
│   ├── App.js
│   ├── components/
│   │   ├── calculators/
│   │   │   ├── SPECjbbCalculator.js
│   │   │   └── TPCCCalculator.js
│   │   ├── PerformanceCalculator.js
│   │   ├── ResourceSummary.js
│   │   └── ServerResources.js
│   ├── controllers/
│   ├── index.js
│   ├── middleware/
│   │   └── validation.js
│   ├── routes/
│   │   └── index.js
│   ├── services/
│   │   ├── documentGenerator.js
│   │   ├── performanceCalculator.js
│   │   └── resourceCalculator.js
│   └── utils/
└── ...
```

## 快速启动

### 1. 本地开发

1. 安装依赖：
   ```bash
   npm install
   ```
2. 启动开发环境：
   ```bash
   npm start
   ```
3. 访问：
   - 前端：http://localhost:3000/calc-resource
   - 后端接口：http://localhost:3001/

### 2. Docker 部署

1. 构建镜像：
   ```bash
   docker build -t calc-resource .
   ```
2. 运行容器（示例端口 8001）：
   ```bash
   docker run -d -p 8001:8001 --name calc-resource calc-resource
   ```
3. 访问：http://localhost:8001/calc-resource

> 如需自定义子路径或端口，请修改 `nginx.conf` 和 `Dockerfile` 中相关配置。

## 常见问题
- **node_modules 上传到仓库了怎么办？**
  - 已添加 `.gitignore`，请先 `git rm -r --cached node_modules build`，再提交并推送。
- **页面刷新数据丢失？**
  - 所有输入和表格数据已本地持久化，若有异常请检查浏览器本地存储权限。
- **Nginx 子路径/端口重定向问题？**
  - 已修正 `nginx.conf`，如有特殊需求请自行调整。

## 联系方式
如有问题或建议，请通过 GitHub Issue 提交。

## 演示
![演示](./images/show.gif)