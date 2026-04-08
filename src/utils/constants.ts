import type {
  PromptTemplateSettings,
  TokenUsage,
  WorkflowSettings
} from '@/types/workflow';

export const APP_NAME =
  import.meta.env.VITE_APP_NAME || 'Landscape Workflow Studio';

export const DEFAULT_PROMPT_TEMPLATES: PromptTemplateSettings = {
  briefSystemPrompt:
    '你是一名有真实项目经验的景观前期策划顾问。你必须输出可用于项目启动、内部评审和甲方沟通的结构化数字化任务书，并且只能返回合法 JSON。',
  briefUserPrompt: `你正在编制景观项目数字化任务书，请根据以下输入输出严格 JSON。

返回结构必须为：
{{briefSchema}}

输出要求：
1. 所有内容都要贴近真实业务推进，不写空泛口号。
2. projectType 要使用真实项目表述。
3. projectPositioning 要说明项目在片区或社区中的角色。
4. targetUsers、projectGoals、designPrinciples、activityPrograms、functionalZones、operationManagementSuggestions 都要结合真实使用场景输出。
5. spatialStructure、plantingStrategy 要写成方案启动阶段可讨论的表达。
6. 数值字段 canopyClosure、pathSlopeMaxPercentage、hardscapeRatio 必须可执行、可复核。
7. warnings 输出 3 到 6 条，优先写权属、消防、管线、排水、安全、预算、施工、养护等边界条件。
8. 如果资料不足，请保守推断，并把不确定项写入 warnings。

用户需求：
{{userInput}}

语义映射：
{{senseMapping}}

规范命中：
{{regulations}}

参考案例：
{{referenceText}}`,
  siteSystemPrompt:
    '你是一名负责前期踏勘、研判和方案启动支持的景观场地分析顾问。你必须输出可用于真实项目讨论的结构化场地分析结果，并且只能返回合法 JSON。',
  siteUserPrompt: `请根据场地资料输出详细场地分析，只能返回严格 JSON。

返回结构必须为：
{{siteSchema}}

输出要求：
1. 必须完整覆盖以下模块：区位分析、交通分析、周边环境分析、场地现状分析、人群分析、SWOT分析、气候分析、文化/历史分析。
2. 每个分析模块都要体现真实业务里的判断语气，不写“提升品质”“打造亮点”这类空泛表述。
3. swotAnalysis 中 strengths、weaknesses、opportunities、threats 各输出 3 到 5 条。
4. constraints 输出 4 到 6 条，优先体现权属、交通、消防、排水、噪声、管线、施工、运维等落地约束。
5. designSuggestions 输出 5 到 8 条，必须是能支撑任务书和方案启动会的设计策略。
6. 如果资料不足，允许保守推断，但要把缺失信息转化为 constraints 或 designSuggestions 中的复核项。

场地资料：
{{siteText}}`
};

export const DEFAULT_SETTINGS: WorkflowSettings = {
  projectName: '古树公园更新模拟项目',
  apiKey: '',
  baseUrl:
    import.meta.env.VITE_DEFAULT_BASE_URL ||
    'https://dashscope.aliyuncs.com/compatible-mode/v1',
  modelName: 'qwen-plus',
  embeddingModel: 'text-embedding-v3',
  retrievalTopK: 4,
  runMode: import.meta.env.VITE_ENABLE_REMOTE_LLM === 'false' ? 'demo' : 'remote',
  promptTemplates: { ...DEFAULT_PROMPT_TEMPLATES }
};

export const DEFAULT_TOKEN_USAGE: TokenUsage = {
  totalTokens: 0,
  promptTokens: 0,
  completionTokens: 0
};

export const STORAGE_KEY = 'landscape-workflow-vue3-workspace';

export const BUNDLED_KNOWLEDGE_FILES = [
  '/seed/knowledge-base/公园设计规范.txt',
  '/seed/knowledge-base/知识库总表.txt',
  '/seed/knowledge-base/规范知识库总表.txt'
];

export const BRIEF_SAMPLES = [
  {
    label: '适老社区口袋公园',
    value:
      '项目位于老旧社区中心空地，甲方希望改造成日常高频使用的口袋公园。重点服务老年居民、儿童陪护家庭和晚间散步人群，要求提升遮荫率、增加休憩与康体设施、兼顾儿童安全看护和轮椅通行。场地面积约 1800 平方米，预算中等，后期养护力量有限，希望整体风格自然、低维护，并预留社区活动的小型共享草坪。'
  },
  {
    label: '街角绿地微更新',
    value:
      '街角绿地现状以硬铺为主，缺少停留空间和识别性。业主希望通过微更新提升社区门口形象，兼顾上下学接送停留、邻里社交、夜间照明安全和雨天排水。设计需控制造价，尽量减少大拆大建，保留现有乔木，并增加可坐可靠的小型会客空间和儿童短时活动界面。'
  },
  {
    label: '滨水康养步道',
    value:
      '项目为社区滨水步道及节点提升，目标打造适老康养型慢行系统。场地需兼顾晨练、散步、亲水停留和夜间通行安全，要求强化树荫覆盖、设置连续休憩座椅、优化无障碍坡度，并结合雨洪调蓄与低维护植物策略提升生态韧性。甲方希望整体气质安静、自然、不过度装饰，便于后期运维。'
  }
];

export const PARK_TYPE_OPTIONS = [
  '社区口袋公园',
  '城市综合公园',
  '社区公园',
  '街角游园',
  '滨水公园',
  '儿童友好公园',
  '适老康养公园',
  '湿地公园',
  '体育公园',
  '郊野公园'
];

export const SITE_ANALYSIS_SAMPLE =
  '场地位于高密度老旧社区内部，周边以居住和底商配套为主，早晚人流集中。现状内部高差约 3 米，局部存在低洼积水点，雨后通行体验较差；老年人口占比较高，儿童活动空间不足，夜间照明偏弱。业主希望后续更新能兼顾适老慢行、儿童看护活动、邻里停留和低维护运营。';
