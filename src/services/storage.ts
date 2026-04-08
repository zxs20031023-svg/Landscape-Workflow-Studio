import type {
  LandscapeBrief,
  SiteAnalysis,
  SiteWorkflowResult,
  BriefWorkflowResult,
  WorkspaceSnapshot
} from '@/types/workflow';
import {
  DEFAULT_PROMPT_TEMPLATES,
  DEFAULT_SETTINGS,
  DEFAULT_TOKEN_USAGE,
  STORAGE_KEY
} from '@/utils/constants';

function asString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function asStringArray(value: unknown, fallback: string[] = []) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : fallback;
}

function normalizeBrief(raw: unknown): LandscapeBrief | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const data = raw as Record<string, unknown>;
  const functionalZones = asStringArray(data.functionalZones);
  const projectGoals = asStringArray(data.projectGoals);
  const designPrinciples = asStringArray(data.designPrinciples);
  const targetUsers = asStringArray(data.targetUsers);
  const activityPrograms = asStringArray(data.activityPrograms);
  const operationManagementSuggestions = asStringArray(data.operationManagementSuggestions);
  const warnings = asStringArray(data.warnings);

  return {
    projectType: asString(data.projectType, '社区景观更新'),
    projectPositioning: asString(
      data.projectPositioning,
      '项目应作为连接社区日常活动、慢行停留和公共交往的更新节点。'
    ),
    targetUsers: targetUsers.length ? targetUsers : ['周边社区居民'],
    projectGoals: projectGoals.length
      ? projectGoals
      : ['提升场地日常使用效率', '形成安全舒适的停留与慢行系统'],
    designPrinciples: designPrinciples.length
      ? designPrinciples
      : [asString(data.stylePreference, '以真实使用和低维护运维为导向')],
    spatialStructure: asString(
      data.spatialStructure,
      '建议建立主慢行线串联核心活动节点，并形成中心共享空间与边界缓冲区。'
    ),
    activityPrograms: activityPrograms.length
      ? activityPrograms
      : ['日常散步停留', '邻里交流会客'],
    functionalZones,
    plantingStrategy: asString(
      data.plantingStrategy,
      '以耐候、易维护的乔灌草复层配置为主，兼顾遮荫、识别性与后期养护。'
    ),
    operationManagementSuggestions: operationManagementSuggestions.length
      ? operationManagementSuggestions
      : ['建议按高频区域优先维护，控制植物种类数量并预留照明维护接口'],
    canopyClosure: typeof data.canopyClosure === 'number' ? data.canopyClosure : 0.52,
    pathSlopeMaxPercentage:
      typeof data.pathSlopeMaxPercentage === 'number' ? data.pathSlopeMaxPercentage : 4,
    hardscapeRatio: typeof data.hardscapeRatio === 'number' ? data.hardscapeRatio : 0.4,
    warnings
  };
}

function normalizeSiteAnalysis(raw: unknown): SiteAnalysis | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const data = raw as Record<string, unknown>;
  const constraints = asStringArray(data.constraints);
  const designSuggestions = asStringArray(data.designSuggestions);
  const opportunities = asStringArray(data.opportunities);
  const oldSwot = (data.swotAnalysis || {}) as Record<string, unknown>;

  return {
    locationAnalysis: asString(
      data.locationAnalysis ?? data.locationContext,
      '需进一步补充片区区位、周边功能和公共空间体系关系。'
    ),
    trafficAnalysis: asString(
      data.trafficAnalysis,
      '需进一步核实现状人车流线、主次出入口和消防通道边界。'
    ),
    surroundingEnvironmentAnalysis: asString(
      data.surroundingEnvironmentAnalysis,
      '需补充周边住宅、商业或公共设施界面关系，以判断噪声、照明和使用时段影响。'
    ),
    currentConditionsAnalysis: asString(
      data.currentConditionsAnalysis ?? data.topographyFeatures,
      '需进一步校核地形、铺装、排水和设施现状。'
    ),
    populationAnalysis: asString(
      data.populationAnalysis,
      '需补充典型使用人群、活动时段和行为模式，以支撑功能组织。'
    ),
    climateAnalysis: asString(
      data.climateAnalysis ?? data.climateEnvironment,
      '需结合日照、通风、雨天排水和热舒适条件进行综合判断。'
    ),
    culturalHistoricalAnalysis: asString(
      data.culturalHistoricalAnalysis,
      '当前文化与历史信息不足，建议补充社区记忆与片区叙事素材。'
    ),
    swotAnalysis: {
      strengths: asStringArray(oldSwot.strengths),
      weaknesses: asStringArray(oldSwot.weaknesses),
      opportunities: asStringArray(oldSwot.opportunities, opportunities),
      threats: asStringArray(oldSwot.threats, constraints)
    },
    constraints,
    designSuggestions
  };
}

function normalizeBriefResult(raw: unknown): BriefWorkflowResult | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const data = raw as Record<string, unknown>;
  const brief = normalizeBrief(data.brief);
  if (!brief) {
    return null;
  }

  return {
    runId: asString(data.runId),
    createdAt: asString(data.createdAt),
    brief,
    retrievalHits: Array.isArray(data.retrievalHits) ? (data.retrievalHits as any[]) : [],
    appliedRules: Array.isArray(data.appliedRules) ? (data.appliedRules as any[]) : [],
    selectedReferenceProjects: Array.isArray(data.selectedReferenceProjects)
      ? (data.selectedReferenceProjects as any[])
      : [],
    tokenUsage:
      typeof data.tokenUsage === 'object' && data.tokenUsage
        ? (data.tokenUsage as BriefWorkflowResult['tokenUsage'])
        : { ...DEFAULT_TOKEN_USAGE },
    artifactPath: asString(data.artifactPath)
  };
}

function normalizeSiteResult(raw: unknown): SiteWorkflowResult | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const data = raw as Record<string, unknown>;
  const analysis = normalizeSiteAnalysis(data.analysis);
  if (!analysis) {
    return null;
  }

  return {
    runId: asString(data.runId),
    createdAt: asString(data.createdAt),
    analysis,
    appliedRules: Array.isArray(data.appliedRules) ? (data.appliedRules as any[]) : [],
    recommendedProjects: Array.isArray(data.recommendedProjects)
      ? (data.recommendedProjects as any[])
      : [],
    tokenUsage:
      typeof data.tokenUsage === 'object' && data.tokenUsage
        ? (data.tokenUsage as SiteWorkflowResult['tokenUsage'])
        : { ...DEFAULT_TOKEN_USAGE },
    artifactPath: asString(data.artifactPath)
  };
}

export function createEmptySnapshot(): WorkspaceSnapshot {
  return {
    settings: {
      ...DEFAULT_SETTINGS,
      promptTemplates: { ...DEFAULT_PROMPT_TEMPLATES }
    },
    tokenUsage: { ...DEFAULT_TOKEN_USAGE },
    knowledgeBase: {
      ready: false,
      documentCount: 0,
      documents: []
    },
    referenceLibrary: [],
    lastBriefInput: '',
    lastSiteInput: '',
    lastBriefResult: null,
    lastSiteResult: null,
    siteRecommendations: [],
    selectedReferenceProjectIds: [],
    onlineCaseResults: [],
    selectedOnlineCaseIds: [],
    historyRecords: []
  };
}

export function loadSnapshot(): WorkspaceSnapshot {
  if (typeof localStorage === 'undefined') {
    return createEmptySnapshot();
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return createEmptySnapshot();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<WorkspaceSnapshot>;
    const empty = createEmptySnapshot();

    return {
      ...empty,
      ...parsed,
      settings: {
        ...empty.settings,
        ...(parsed.settings || {}),
        promptTemplates: {
          ...DEFAULT_PROMPT_TEMPLATES,
          ...(parsed.settings?.promptTemplates || {})
        }
      },
      lastBriefResult: normalizeBriefResult(parsed.lastBriefResult),
      lastSiteResult: normalizeSiteResult(parsed.lastSiteResult)
    } as WorkspaceSnapshot;
  } catch {
    return createEmptySnapshot();
  }
}

export function saveSnapshot(snapshot: WorkspaceSnapshot) {
  if (typeof localStorage === 'undefined') {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}
