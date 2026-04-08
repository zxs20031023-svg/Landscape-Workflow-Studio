import type {
  LandscapeBrief,
  ReferenceProject,
  RetrievalHit,
  SiteAnalysis,
  SiteSwotAnalysis,
  TokenUsage,
  WorkflowSettings
} from '@/types/workflow';
import { uniqueItems } from '@/utils/helpers';

const DEFAULT_USAGE: TokenUsage = {
  totalTokens: 0,
  promptTokens: 0,
  completionTokens: 0
};

const BRIEF_SCHEMA = `{
  "projectType": "string",
  "projectPositioning": "string",
  "targetUsers": ["string"],
  "projectGoals": ["string"],
  "designPrinciples": ["string"],
  "spatialStructure": "string",
  "activityPrograms": ["string"],
  "functionalZones": ["string"],
  "plantingStrategy": "string",
  "operationManagementSuggestions": ["string"],
  "canopyClosure": 0.0,
  "pathSlopeMaxPercentage": 0,
  "hardscapeRatio": 0.0,
  "warnings": ["string"]
}`;

const SITE_SCHEMA = `{
  "locationAnalysis": "string",
  "trafficAnalysis": "string",
  "surroundingEnvironmentAnalysis": "string",
  "currentConditionsAnalysis": "string",
  "populationAnalysis": "string",
  "climateAnalysis": "string",
  "culturalHistoricalAnalysis": "string",
  "swotAnalysis": {
    "strengths": ["string"],
    "weaknesses": ["string"],
    "opportunities": ["string"],
    "threats": ["string"]
  },
  "constraints": ["string"],
  "designSuggestions": ["string"]
}`;

function estimateUsage(input: string, output: string): TokenUsage {
  const promptTokens = Math.ceil(input.length / 1.8);
  const completionTokens = Math.ceil(output.length / 1.8);
  return {
    promptTokens,
    completionTokens,
    totalTokens: promptTokens + completionTokens
  };
}

function containsAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword));
}

function safeStringify(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function renderTemplate(template: string, context: Record<string, string>) {
  return Object.entries(context).reduce((result, [key, value]) => {
    return result.replaceAll(`{{${key}}}`, value);
  }, template);
}

function extractStylePreference(userInput: string) {
  if (containsAny(userInput, ['疗愈', '康养'])) return '自然疗愈、适老友好';
  if (containsAny(userInput, ['生态', '低维护', '积水', '雨洪'])) {
    return '生态渗透、低维护运营';
  }
  if (containsAny(userInput, ['儿童', '亲子'])) return '儿童友好、邻里共享';
  if (userInput.includes('夜间')) return '夜间安全、社区社交';
  return '自然共享、日常活力';
}

function inferProjectType(userInput: string) {
  if (containsAny(userInput, ['步道', '慢行'])) return '滨水慢行景观提升';
  if (userInput.includes('街角')) return '街角绿地微更新';
  if (userInput.includes('花园')) return '疗愈花园营建';
  if (containsAny(userInput, ['口袋公园', '口袋'])) return '社区口袋公园改造';
  return '社区景观更新';
}

function inferTargetUsers(userInput: string) {
  const users: string[] = [];
  if (containsAny(userInput, ['老年', '适老', '康养'])) users.push('老年居民');
  if (containsAny(userInput, ['儿童', '亲子'])) users.push('儿童及陪护家庭');
  if (containsAny(userInput, ['夜间', '散步'])) users.push('晚间散步人群');
  users.push('周边社区居民');
  return uniqueItems(users);
}

function inferProjectGoals(userInput: string) {
  const goals = ['提升场地日常使用效率', '形成安全舒适的停留与慢行系统'];
  if (containsAny(userInput, ['适老', '轮椅', '无障碍'])) {
    goals.push('提升适老与无障碍可达性');
  }
  if (containsAny(userInput, ['儿童', '亲子'])) {
    goals.push('补足儿童活动与看护空间');
  }
  if (containsAny(userInput, ['积水', '雨洪', '生态'])) {
    goals.push('优化雨洪管理与生态渗透能力');
  }
  if (userInput.includes('夜间')) {
    goals.push('改善夜间照明与安全感');
  }
  return uniqueItems(goals);
}

function inferDesignPrinciples(userInput: string) {
  const principles = ['以真实使用为导向', '控制造价并兼顾后期维护'];
  if (containsAny(userInput, ['生态', '雨洪', '积水'])) {
    principles.push('强化海绵策略与低维护种植');
  }
  if (containsAny(userInput, ['适老', '轮椅', '无障碍'])) {
    principles.push('优先保障连续、舒适、可复核的无障碍体验');
  }
  if (containsAny(userInput, ['儿童', '亲子'])) {
    principles.push('强调可看护、安全边界清晰的儿童友好界面');
  }
  return uniqueItems(principles);
}

function inferActivityPrograms(userInput: string) {
  const programs = ['日常散步停留', '邻里交流会客'];
  if (containsAny(userInput, ['儿童', '亲子'])) programs.push('儿童轻活动与陪护互动');
  if (containsAny(userInput, ['老年', '适老', '康养'])) programs.push('低强度康体活动');
  if (containsAny(userInput, ['滨水', '亲水'])) programs.push('滨水观景与休憩');
  if (userInput.includes('草坪')) programs.push('小型社区活动与临时集会');
  return uniqueItems(programs);
}

function inferFunctionalZones(userInput: string) {
  const zones: string[] = [];
  if (containsAny(userInput, ['儿童', '亲子'])) zones.push('儿童看护活动区');
  if (containsAny(userInput, ['老年', '适老', '康养'])) zones.push('适老康体慢行区');
  if (containsAny(userInput, ['社交', '会客'])) zones.push('邻里交流会客区');
  if (containsAny(userInput, ['草坪', '活动'])) zones.push('全龄共享草坪区');
  if (containsAny(userInput, ['积水', '雨洪', '生态'])) zones.push('雨水花园与下凹绿地区');
  if (containsAny(userInput, ['滨水', '亲水'])) zones.push('滨水停留观景带');

  return uniqueItems(
    zones.length ? zones : ['复合共享绿地', '邻里停留交流区', '雨水缓冲绿化区']
  );
}

function buildDemoBrief(
  userInput: string,
  retrievalHits: RetrievalHit[],
  referenceProjects: ReferenceProject[],
  siteAnalysis?: SiteAnalysis | null,
  parkType?: string
): LandscapeBrief {
  const stylePreference = extractStylePreference(userInput);
  const projectType = parkType?.trim() || inferProjectType(userInput);
  const projectPositioning = siteAnalysis?.locationAnalysis
    ? `${siteAnalysis.locationAnalysis} 建议任务书将项目作为片区公共空间更新与日常活动承载节点统筹考虑。`
    : '项目位于社区日常生活界面中，应作为提升停留品质、优化慢行组织并承接邻里活动的微更新节点。';
  const linkedWarnings = [
    ...(siteAnalysis?.constraints || []).slice(0, 3),
    ...(siteAnalysis?.designSuggestions || [])
      .slice(0, 2)
      .map((item) => `需在任务书中转化为明确设计要求：${item}`)
  ];

  return {
    projectType,
    projectPositioning,
    targetUsers: inferTargetUsers(userInput),
    projectGoals: inferProjectGoals(userInput),
    designPrinciples: inferDesignPrinciples(userInput),
    spatialStructure:
      containsAny(userInput, ['高差', '坡'])
        ? '建议采用“一环串联、多点停留、分台组织”的空间结构，主慢行线串联核心活动节点。'
        : '建议采用“慢行环线 + 中心共享节点 + 边界缓冲绿带”的空间结构，兼顾停留、穿行与活动组织。',
    activityPrograms: inferActivityPrograms(userInput),
    functionalZones: inferFunctionalZones(userInput),
    plantingStrategy:
      containsAny(userInput, ['低维护', '雨洪', '生态'])
        ? '以耐候、低维护的乡土乔灌草复层配置为主，兼顾遮荫、雨水渗透和四季识别。'
        : '以遮荫乔木为骨架，配置可识别、易维护的灌木与地被，兼顾日常停留舒适度与景观层次。',
    operationManagementSuggestions: uniqueItems([
      '照明、铺装、座椅等高频使用设施应预留分区维护机制',
      '种植策略需控制物种数量，降低后期养护和病虫害管理难度',
      userInput.includes('夜间')
        ? '夜间时段建议采用分时照明和重点节点增强照明策略'
        : '活动高峰时段建议重点保障主入口与主要慢行线的通达性'
    ]),
    canopyClosure:
      containsAny(userInput, ['林荫', '遮荫', '适老']) || stylePreference.includes('生态')
        ? 0.68
        : 0.52,
    pathSlopeMaxPercentage:
      containsAny(userInput, ['适老', '轮椅', '无障碍', '康养']) ? 6 : 4,
    hardscapeRatio:
      stylePreference.includes('生态') || containsAny(userInput, ['绿量', '雨洪']) ? 0.32 : 0.4,
    warnings: uniqueItems([
      ...linkedWarnings,
      !retrievalHits.length ? '当前未检索到明确规范片段，建议人工复核关键控制指标。' : '',
      referenceProjects.length
        ? '参考案例仅用于启发，不应替代当前场地条件与项目边界判断。'
        : '',
      userInput.includes('夜间')
        ? '夜间使用场景需补充照明覆盖、视线安全与巡检维护策略。'
        : '',
      containsAny(userInput, ['儿童', '亲子'])
        ? '儿童活动界面需复核看护视线、软硬铺装边界与植物安全性。'
        : ''
    ].filter(Boolean))
  };
}

function buildSwot(siteText: string): SiteSwotAnalysis {
  return {
    strengths: uniqueItems([
      containsAny(siteText, ['社区', '居住']) ? '毗邻高频社区生活界面，具备稳定日常使用基础。' : '',
      containsAny(siteText, ['滨水', '亲水']) ? '自然水岸条件具备景观识别与慢行体验优势。' : '',
      containsAny(siteText, ['高差', '坡']) ? '高差可转化为分层活动与观景空间。' : '场地可塑性较强，具备微更新整合空间的条件。'
    ].filter(Boolean)),
    weaknesses: uniqueItems([
      containsAny(siteText, ['积水', '低洼']) ? '低洼积水影响雨天通行与铺装耐久性。' : '',
      containsAny(siteText, ['老旧社区', '高密']) ? '周边界面密集，施工与运营阶段容易扰民。' : '',
      containsAny(siteText, ['夜间']) ? '夜间照明与安全感基础偏弱。' : '现状公共活动设施支撑能力有限。'
    ].filter(Boolean)),
    opportunities: uniqueItems([
      containsAny(siteText, ['适老', '老年']) ? '可借适老更新导入连续慢行与康体停留系统。' : '',
      containsAny(siteText, ['儿童', '亲子']) ? '可补足儿童活动与家庭陪护界面，提升全天候使用率。' : '',
      containsAny(siteText, ['积水', '雨洪', '生态']) ? '可结合雨洪治理形成海绵示范节点。' : '可通过功能重组提升场地复合使用价值。'
    ].filter(Boolean)),
    threats: uniqueItems([
      containsAny(siteText, ['管线']) ? '地下管线不明会直接影响地形调整与种植深度。' : '',
      containsAny(siteText, ['消防']) ? '消防登高面或通道要求可能压缩可设计空间。' : '',
      '预算、分期实施与后期养护能力可能限制方案复杂度。'
    ].filter(Boolean))
  };
}

function buildDemoSiteAnalysis(siteText: string): SiteAnalysis {
  const swotAnalysis = buildSwot(siteText);

  return {
    locationAnalysis: siteText.includes('社区')
      ? '场地位于社区内部更新界面，周边以居住和底商配套为主，具备较高的日常通行与停留需求，适合作为社区公共活动补充节点。'
      : '场地处于片区公共开放空间体系中，可承担连接、停留与景观展示的复合角色。'
      ,
    trafficAnalysis: containsAny(siteText, ['早晚人流', '交通', '通行'])
      ? '场地受早晚高峰通行影响明显，主入口与慢行路径应优先梳理人流交叉点、到达路径和安全候留界面。'
      : '需进一步核实现状人车流线、周边出入口关系和消防通道边界，以确定主次入口与慢行组织策略。',
    surroundingEnvironmentAnalysis: containsAny(siteText, ['底商', '居住', '住宅'])
      ? '周边生活配套与住宅界面较近，既带来高频使用基础，也意味着噪声、照明外溢和活动时段需被严格控制。'
      : '周边环境具备复合功能潜力，但需进一步确认相邻界面性质、视线关系和边界条件。',
    currentConditionsAnalysis: containsAny(siteText, ['高差', '积水', '低洼'])
      ? '现状存在明显高差与局部积水点，场地平整度、排水坡向和雨后可达性均需在方案前期重点校核。'
      : '现状空间基础一般，需通过地形微调、铺装更新和设施补足来提升使用品质。',
    populationAnalysis: containsAny(siteText, ['老年', '儿童'])
      ? '场地服务人群以老年居民、儿童及陪护家庭为主，不同人群在步速、停留时长、安全需求和活动方式上差异明显。'
      : '需补充典型使用人群画像与时段分布，作为功能组织和设施配置依据。',
    climateAnalysis: containsAny(siteText, ['滨水'])
      ? '场地靠近水体，需重点应对潮湿环境、夏季热舒适、反光眩光和亲水安全问题。'
      : '气候层面需重点关注夏季暴晒、通风组织、遮荫覆盖率和雨天排水效率，确保全年使用舒适度。',
    culturalHistoricalAnalysis: containsAny(siteText, ['老旧社区', '历史', '文化'])
      ? '场地所在片区具备社区更新与日常生活沉淀背景，后续方案宜提炼具有地方记忆的材料、节点命名或活动场景。'
      : '当前文化与历史信息不足，建议补充片区记忆、使用习惯和社区叙事素材，以支撑场所识别。',
    swotAnalysis,
    constraints: uniqueItems([
      containsAny(siteText, ['积水', '低洼']) ? '低洼积水点需提前核实排水系统和地形调节空间。' : '',
      containsAny(siteText, ['高差', '坡']) ? '高差处理必须同步考虑无障碍、护栏安全与施工难度。' : '',
      containsAny(siteText, ['居住', '住宅', '底商']) ? '邻近居住界面，活动强度、噪声与夜间照明需受控。' : '',
      '需进一步确认地下管线、权属边界及消防操作面要求。',
      '预算和后期养护能力将直接影响设施复杂度与植物策略。'
    ].filter(Boolean)),
    designSuggestions: uniqueItems([
      '优先建立清晰的主慢行线与停留节点体系，减少人流交叉带来的安全压力。',
      containsAny(siteText, ['积水', '低洼'])
        ? '将积水问题转化为雨水花园、下凹绿地和透水铺装的综合海绵策略。'
        : '在关键节点补足遮荫、座椅和照明，提升日常停留舒适度。',
      containsAny(siteText, ['老年', '适老', '康养'])
        ? '主环线应控制坡度与步距，并配置连续休憩座椅和康体节点。'
        : '根据人群画像分层配置静态停留、轻活动和交流空间。',
      containsAny(siteText, ['儿童', '亲子'])
        ? '儿童活动区应与看护停留区形成近距离联动，并确保视线连续。'
        : '通过复合节点组织提升全天候、全龄共享的使用效率。',
      '种植与材料策略宜优先采用耐候、低维护、易替换的体系，降低运维压力。'
    ])
  };
}

async function requestJsonCompletion<T>(
  settings: WorkflowSettings,
  messages: Array<{ role: 'system' | 'user'; content: string }>
): Promise<{ data: T; usage: TokenUsage }> {
  const baseUrl = settings.baseUrl.replace(/\/$/, '');
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.apiKey}`
    },
    body: JSON.stringify({
      model: settings.modelName,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages
    })
  });

  if (!response.ok) {
    throw new Error(`远程模型调用失败：${response.status}`);
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  const usage = payload?.usage
    ? {
        totalTokens: payload.usage.total_tokens ?? 0,
        promptTokens: payload.usage.prompt_tokens ?? 0,
        completionTokens: payload.usage.completion_tokens ?? 0
      }
    : DEFAULT_USAGE;

  if (!content) {
    throw new Error('远程模型未返回有效内容。');
  }

  return {
    data: JSON.parse(content) as T,
    usage
  };
}

function buildBriefPrompt(options: {
  settings: WorkflowSettings;
  userInput: string;
  parkType?: string;
  siteAnalysis?: SiteAnalysis | null;
  senseMapping: Record<string, string>;
  retrievalHits: RetrievalHit[];
  referenceProjects: ReferenceProject[];
}) {
  const regulations =
    options.retrievalHits
      .map((item) => `[${item.source}]\n${item.excerpt}`)
      .join('\n\n') || '未检索到明确规范，请保守推断并在 warnings 中提示人工复核。';

  const referenceText = options.referenceProjects.length
    ? options.referenceProjects
        .map(
          (item) => `案例名称：${item.name}
城市：${item.city}
场景：${item.scene}
服务人群：${item.targetUsers.join('、') || '未说明'}
亮点：${item.highlights.join('、')}`
        )
        .join('\n\n')
    : '无参考项目';

  const siteAnalysisText = options.siteAnalysis
    ? [
        `公园类型：${options.parkType?.trim() || '未指定'}`,
        `区位分析：${options.siteAnalysis.locationAnalysis}`,
        `交通分析：${options.siteAnalysis.trafficAnalysis}`,
        `周边环境分析：${options.siteAnalysis.surroundingEnvironmentAnalysis}`,
        `场地现状分析：${options.siteAnalysis.currentConditionsAnalysis}`,
        `人群分析：${options.siteAnalysis.populationAnalysis}`,
        `气候分析：${options.siteAnalysis.climateAnalysis}`,
        `文化/历史分析：${options.siteAnalysis.culturalHistoricalAnalysis}`,
        `SWOT-优势：${options.siteAnalysis.swotAnalysis.strengths.join('；')}`,
        `SWOT-劣势：${options.siteAnalysis.swotAnalysis.weaknesses.join('；')}`,
        `SWOT-机会：${options.siteAnalysis.swotAnalysis.opportunities.join('；')}`,
        `SWOT-威胁：${options.siteAnalysis.swotAnalysis.threats.join('；')}`,
        `落地约束：${options.siteAnalysis.constraints.join('；')}`,
        `设计建议：${options.siteAnalysis.designSuggestions.join('；')}`
      ].join('\n')
    : `公园类型：${options.parkType?.trim() || '未指定'}\n暂无场地分析结果，请仅基于设计需求保守判断。`;

  return renderTemplate(options.settings.promptTemplates.briefUserPrompt, {
    briefSchema: BRIEF_SCHEMA,
    userInput: options.userInput,
    parkType: options.parkType?.trim() || '未指定',
    siteAnalysisText,
    senseMapping: safeStringify(options.senseMapping),
    regulations,
    referenceText
  });
}

function buildSiteAnalysisPrompt(options: {
  settings: WorkflowSettings;
  siteText: string;
}) {
  return renderTemplate(options.settings.promptTemplates.siteUserPrompt, {
    siteSchema: SITE_SCHEMA,
    siteText: options.siteText
  });
}

export async function generateBriefWithFallback(options: {
  settings: WorkflowSettings;
  userInput: string;
  parkType?: string;
  siteAnalysis?: SiteAnalysis | null;
  senseMapping: Record<string, string>;
  retrievalHits: RetrievalHit[];
  referenceProjects: ReferenceProject[];
}) {
  const demoBrief = buildDemoBrief(
    options.userInput,
    options.retrievalHits,
    options.referenceProjects,
    options.siteAnalysis,
    options.parkType
  );

  if (options.settings.runMode !== 'remote' || !options.settings.apiKey) {
    return {
      brief: demoBrief,
      tokenUsage: estimateUsage(options.userInput, JSON.stringify(demoBrief))
    };
  }

  try {
    const remote = await requestJsonCompletion<LandscapeBrief>(options.settings, [
      {
        role: 'system',
        content: options.settings.promptTemplates.briefSystemPrompt
      },
      {
        role: 'user',
        content: buildBriefPrompt(options)
      }
    ]);

    return {
      brief: remote.data,
      tokenUsage: remote.usage
    };
  } catch {
    return {
      brief: demoBrief,
      tokenUsage: estimateUsage(options.userInput, JSON.stringify(demoBrief))
    };
  }
}

export async function generateSiteAnalysisWithFallback(options: {
  settings: WorkflowSettings;
  siteText: string;
}) {
  const demoAnalysis = buildDemoSiteAnalysis(options.siteText);

  if (options.settings.runMode !== 'remote' || !options.settings.apiKey) {
    return {
      analysis: demoAnalysis,
      tokenUsage: estimateUsage(options.siteText, JSON.stringify(demoAnalysis))
    };
  }

  try {
    const remote = await requestJsonCompletion<SiteAnalysis>(options.settings, [
      {
        role: 'system',
        content: options.settings.promptTemplates.siteSystemPrompt
      },
      {
        role: 'user',
        content: buildSiteAnalysisPrompt(options)
      }
    ]);

    return {
      analysis: remote.data,
      tokenUsage: remote.usage
    };
  } catch {
    return {
      analysis: demoAnalysis,
      tokenUsage: estimateUsage(options.siteText, JSON.stringify(demoAnalysis))
    };
  }
}

export function inferBriefReview(data: {
  retrievalHits: RetrievalHit[];
  appliedRules: Array<{ warning: string }>;
  brief: LandscapeBrief;
  selectedReferenceProjects?: ReferenceProject[];
  userInput: string;
}) {
  const retrievalCount = data.retrievalHits.length;
  const ruleCount = data.appliedRules.length;
  let confidence = '低';
  if (retrievalCount >= 2 && ruleCount >= 1) confidence = '高';
  else if (retrievalCount >= 1) confidence = '中';

  const reviewItems: string[] = [];
  if (retrievalCount === 0) {
    reviewItems.push('当前未检索到明确规范依据，建议人工复核关键控制指标。');
  }
  if (
    containsAny(data.userInput, ['适老', '轮椅', '无障碍']) &&
    data.brief.pathSlopeMaxPercentage > 5
  ) {
    reviewItems.push('适老或无障碍需求下坡度偏高，建议重点复核主通行路径控制值。');
  }
  if (data.brief.hardscapeRatio > 0.45) {
    reviewItems.push('硬质铺装比例偏高，建议确认是否与生态渗透和雨洪控制目标一致。');
  }
  if (data.selectedReferenceProjects?.length) {
    reviewItems.push('已同步参考案例，请注意案例仅用于启发，不能直接替代本项目判断。');
  }
  if (!reviewItems.length) {
    reviewItems.push('当前结果结构完整，建议继续补充排水组织、儿童安全和运营维护复核。');
  }

  return { confidence, reviewItems };
}

export function inferSiteReview(data: {
  analysis: SiteAnalysis;
  appliedRules: Array<{ warning: string }>;
  recommendedProjects: ReferenceProject[];
}) {
  const ruleCount = data.appliedRules.length;
  const suggestions = data.analysis.designSuggestions.length;
  const swotCount =
    data.analysis.swotAnalysis.strengths.length +
    data.analysis.swotAnalysis.weaknesses.length +
    data.analysis.swotAnalysis.opportunities.length +
    data.analysis.swotAnalysis.threats.length;
  let confidence = '低';
  if (ruleCount >= 2 && suggestions >= 5 && swotCount >= 8) confidence = '高';
  else if (suggestions >= 4 && swotCount >= 6) confidence = '中';

  const reviewItems: string[] = [];
  if (ruleCount === 0) {
    reviewItems.push('本次未命中额外规则，建议人工确认适老、积水和高差条件。');
  }
  if (data.analysis.constraints.length < 4) {
    reviewItems.push('当前落地约束偏少，建议补充交通、管线、消防和权属边界限制。');
  }
  if (suggestions < 5) {
    reviewItems.push('设计建议还不够充分，建议补充空间组织、运维和分期实施策略。');
  }
  if (data.recommendedProjects.length) {
    reviewItems.push('系统已给出相似项目推荐，可勾选后同步到任务书模块。');
  }
  if (!reviewItems.length) {
    reviewItems.push('分析结果较完整，可直接作为任务书编制和方案启动讨论输入。');
  }

  return { confidence, reviewItems };
}
