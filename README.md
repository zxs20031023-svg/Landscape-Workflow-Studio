# Landscape Workflow Studio

基于 `Vue 3 + TypeScript + Pinia + Vue Router + Element Plus + ECharts` 重写的景观设计需求转译与场地分析前端项目。

这个版本不是对原始 Streamlit 页面做“像素级翻译”，而是把原项目的工作流重新设计为更适合简历展示和前端岗位面试的完整作品：

- 保留原有能力链路：知识库管理、设计任务书、场地分析、案例推荐、在线案例检索、历史资产中心
- 全部文件输出到独立目录 `landscape-workflow-vue3/`
- 不改动原始 Python 项目
- 支持 `演示模式` 与 `智能联网模式`
- 适合作为“AI + 前端工程化 + 产品化设计”方向的简历项目

## 1. 项目亮点

- 浏览器端知识库：支持内置规范导入、文件预检、分块、去重与轻量检索
- 规则引擎迁移：把适老坡度、湿地提醒、敏感植物替换等规则迁到 TypeScript
- 双模式生成：既能本地演示，也能填写 OpenAI Compatible 参数直接请求远程模型
- 状态闭环：场地分析 -> 推荐案例 -> 勾选同步 -> 任务书生成 -> 历史资产沉淀
- 前端工程化：多页面路由、全局状态仓库、服务层拆分、测试与文档齐备

## 2. 技术栈

- `Vue 3`
- `TypeScript`
- `Vite`
- `Pinia`
- `Vue Router`
- `Element Plus`
- `ECharts + vue-echarts`
- `mammoth`：解析 `.docx`
- `pdfjs-dist`：解析 `.pdf`
- `Vitest`

## 3. 运行方式

### 安装依赖

```bash
npm install
```

如果 PowerShell 阻止脚本执行，可以改用：

```bash
npm.cmd install
```

### 启动开发环境

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 运行测试

```bash
npm run test
```

## 4. 模式说明

### 演示模式

- 默认可直接运行
- 使用浏览器端启发式逻辑完成任务书与场地分析
- 适合答辩演示、录屏和简历项目展示

### 智能联网模式

- 需要用户填写 `API Key / Base URL / Model`
- 前端直接请求 OpenAI Compatible 接口
- 适合有可用模型服务、且服务端允许浏览器跨域访问的场景

## 5. 功能对应关系

| 原项目能力 | Vue 3 重写版实现 |
| --- | --- |
| 规范知识库导入 | 浏览器端内置规范导入 + 文件上传预检 |
| 向量检索 | 浏览器端轻量文本分块检索 |
| 设计任务书生成 | 任务书页面 + 规则引擎 + JSON 导出 |
| 场地分析 | 场地分析页面 + 结构化结果展示 |
| 本地案例推荐 | TypeScript 推荐服务 |
| 在线案例检索 | 演示级在线案例目录检索与导入 |
| 历史记录与归档 | 项目资产中心 + 本地缓存快照 |

## 6. 目录结构

```text
landscape-workflow-vue3/
  public/
    seed/
      knowledge-base/
  src/
    components/
    data/
    router/
    services/
    stores/
    styles/
    types/
    utils/
    views/
  docs/
    ARCHITECTURE.md
    API_ADAPTER_GUIDE.md
    MIGRATION_NOTES.md
    RESUME_PROJECT_SUMMARY.md
    UI_RESEARCH.md
```

## 7. 关键设计取舍

### 为什么不是“直接调用原 Python 后端”

用户需求是“改写为 Vue 3 的完整前端项目”，并且源项目不能改动。所以新方案优先保证：

- 新目录独立运行
- 前端自身可演示
- 不依赖修改原仓库

因此我把可迁移逻辑前端化了：

- 规则引擎迁移到 `TypeScript`
- 案例推荐逻辑迁移到 `TypeScript`
- 知识库做成浏览器端轻量版本

### 为什么保留演示模式

如果只做远程 API 调用，新项目会依赖：

- 模型账号
- 跨域配置
- 网络状态

这对简历项目不友好。演示模式让它在没有后端配合的情况下也能完整跑通。

## 8. 推荐展示方式

适合在简历里写成：

> 基于 Vue 3 + TypeScript 独立重构景观设计智能工作台，将原有 Streamlit 原型升级为支持知识库、规则引擎、案例推荐、任务书与场地分析闭环的前端工程项目，并补充演示模式、资产中心与工程化文档。

更多表达方式见 [docs/RESUME_PROJECT_SUMMARY.md](./docs/RESUME_PROJECT_SUMMARY.md)。

## 9. 文档索引

- [架构说明](./docs/ARCHITECTURE.md)
- [迁移说明](./docs/MIGRATION_NOTES.md)
- [远程模型适配说明](./docs/API_ADAPTER_GUIDE.md)
- [简历项目描述](./docs/RESUME_PROJECT_SUMMARY.md)
- [UI 与技术方案调研](./docs/UI_RESEARCH.md)

