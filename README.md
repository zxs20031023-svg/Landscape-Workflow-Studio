# Landscape Workflow Studio

基于 `Vue 3 + TypeScript + Pinia + Vue Router + Element Plus + ECharts` 的景观设计前期工作流前端项目。

这个版本将原有原型型工作流整理为一个可独立运行、可演示、可继续扩展的前端工程，覆盖知识库导入、场地分析、任务书生成、案例推荐、资产沉淀和项目设置等核心环节。

## 项目目标

- 把景观设计前期分析流程做成可运行的前端工作台，而不是静态页面演示
- 保留“知识准备 -> 场地分析 -> 任务书生成 -> 结果沉淀”的完整链路
- 兼顾演示模式与远程模型模式，方便作品集展示和后续接入真实服务
- 使用清晰的工程结构承载页面、状态、规则、数据处理和持久化能力

## 当前功能

- 首页总览：展示项目进度、最近活动、Token 用量和工作流成熟度
- 知识库管理：支持导入内置规范文本，支持上传 `txt`、`pdf`、`docx` 文件并做预检、分块、去重和轻量检索
- 场地分析：根据场地描述生成结构化分析结果，并结合规则给出补充建议
- 任务书生成：结合知识库命中结果、场地分析结果和参考案例生成结构化设计任务书
- 案例推荐：基于本地案例库进行相似案例推荐，并支持导入在线案例目录结果
- 项目资产中心：查看历史记录、结果快照和工作流产出
- 设置页：维护项目名、运行模式、模型参数、检索条数和提示词模板
- 本地持久化：当前工作区状态会写入浏览器本地存储

## 技术栈

- `Vue 3`
- `TypeScript`
- `Vite`
- `Pinia`
- `Vue Router`
- `Element Plus`
- `ECharts` + `vue-echarts`
- `mammoth`
- `pdfjs-dist`
- `Vitest`

## 目录结构

```text
landscape-workflow-vue3/
  docs/
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
  .env.example
  index.html
  package.json
  README.md
  tsconfig.json
  vite.config.ts
```

## 页面结构

- `/overview`：总览页
- `/knowledge-base`：知识库管理
- `/site-analysis`：场地分析与案例检索
- `/design-brief`：设计任务书生成
- `/project-assets`：项目资产与历史记录
- `/settings`：项目配置和提示词模板

## 运行方式

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

### 生产构建

```bash
npm run build
```

### 运行测试

```bash
npm run test
```

## 两种运行模式

### 演示模式

- 不依赖外部模型服务即可运行
- 由前端内置启发式逻辑生成任务书和场地分析结果
- 适合作品集展示、录屏和页面联调

### 远程模型模式

- 需要在设置页填写 `API Key`、`Base URL`、`Model`
- 通过浏览器直接请求 OpenAI Compatible `chat/completions` 接口
- 请求失败或返回异常时，当前实现会回退到演示模式结果

## 知识库机制

当前知识库是浏览器端轻量方案，不依赖独立后端或向量数据库：

- 导入内置规范文本或用户上传文件
- 通过 `SHA-256` 做去重
- 以固定大小切片做文本分块
- 基于关键词和片段匹配做轻量召回

这套实现不等价于完整 RAG，但足以支持当前前端演示工作流。

## 数据与状态

- 全局状态由 `src/stores/workflow.ts` 维护
- 结果快照通过 `src/services/storage.ts` 持久化到 `localStorage`
- 工作流编排由 `src/services/workflowService.ts` 负责
- 规则修正由 `src/services/rulesEngine.ts` 负责
- 模型调用与回退逻辑由 `src/services/llmService.ts` 负责

## 适合展示的亮点

- 将原型式流程整理为前端工程化应用
- 保留跨页面联动和业务闭环，而不只是单点页面还原
- 通过 Pinia 建立“场地分析 -> 推荐案例 -> 任务书 -> 历史资产”的状态流
- 在没有后端改造前提下，实现可运行的浏览器端知识库和双模式生成链路

## 文档索引

- [架构说明](./docs/ARCHITECTURE.md)
- [迁移说明](./docs/MIGRATION_NOTES.md)
- [远程模型接入说明](./docs/API_ADAPTER_GUIDE.md)
- [简历项目描述](./docs/RESUME_PROJECT_SUMMARY.md)
- [UI 与技术设计说明](./docs/UI_RESEARCH.md)
