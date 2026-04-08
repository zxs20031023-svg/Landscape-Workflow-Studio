import complianceRulesRaw from '@/data/compliance_rules.json';
import senseMappingRaw from '@/data/sense_mapping.json';
import type { ComplianceRules } from '@/types/data';
import type {
  BriefWorkflowResult,
  HistoryRecord,
  KnowledgeFileRecord,
  ReferenceProject,
  SiteAnalysis,
  SiteWorkflowResult,
  TokenUsage,
  WorkflowSettings
} from '@/types/workflow';
import { formatRelativePath } from '@/utils/format';
import { createId } from '@/utils/helpers';
import { retrieveKnowledgeHits } from './knowledgeBaseService';
import {
  generateBriefWithFallback,
  generateSiteAnalysisWithFallback
} from './llmService';
import { recommendProjects } from './recommendationService';
import { applyBriefRules, applySiteRules } from './rulesEngine';

const complianceRules = complianceRulesRaw as ComplianceRules;
const senseMapping = senseMappingRaw as Record<string, string>;

export function mergeTokenUsage(left: TokenUsage, right: TokenUsage): TokenUsage {
  return {
    totalTokens: left.totalTokens + right.totalTokens,
    promptTokens: left.promptTokens + right.promptTokens,
    completionTokens: left.completionTokens + right.completionTokens
  };
}

export function getWorkflowAssets() {
  return {
    complianceRules,
    senseMapping
  };
}

function serializeSiteAnalysis(analysis: SiteAnalysis | null | undefined) {
  if (!analysis) {
    return '';
  }

  const sections = [
    ['区位分析', analysis.locationAnalysis],
    ['交通分析', analysis.trafficAnalysis],
    ['周边环境分析', analysis.surroundingEnvironmentAnalysis],
    ['场地现状分析', analysis.currentConditionsAnalysis],
    ['人群分析', analysis.populationAnalysis],
    ['气候分析', analysis.climateAnalysis],
    ['文化/历史分析', analysis.culturalHistoricalAnalysis],
    ['SWOT-优势', analysis.swotAnalysis.strengths.join('；')],
    ['SWOT-劣势', analysis.swotAnalysis.weaknesses.join('；')],
    ['SWOT-机会', analysis.swotAnalysis.opportunities.join('；')],
    ['SWOT-威胁', analysis.swotAnalysis.threats.join('；')],
    ['落地约束', analysis.constraints.join('；')],
    ['设计建议', analysis.designSuggestions.join('；')]
  ];

  return sections
    .filter(([, content]) => content && content.trim())
    .map(([title, content]) => `${title}：${content}`)
    .join('\n');
}

function buildBriefWorkflowInput(options: {
  parkType?: string;
  userInput: string;
  siteAnalysis?: SiteAnalysis | null;
}) {
  const sections = [];
  const parkType = options.parkType?.trim();

  if (parkType) {
    sections.push(`【公园类型】\n${parkType}`);
  }

  const siteSummary = serializeSiteAnalysis(options.siteAnalysis);
  if (siteSummary) {
    sections.push(`【场地分析结论】\n${siteSummary}`);
  }

  sections.push(`【设计需求】\n${options.userInput.trim()}`);

  return sections.join('\n\n');
}

export async function runDesignBriefWorkflow(options: {
  userInput: string;
  parkType?: string;
  settings: WorkflowSettings;
  referenceProjects: ReferenceProject[];
  knowledgeDocuments: KnowledgeFileRecord[];
  siteAnalysis?: SiteAnalysis | null;
}): Promise<{
  result: BriefWorkflowResult;
  usage: TokenUsage;
  historyRecord: HistoryRecord;
}> {
  if (!options.knowledgeDocuments.length) {
    throw new Error('规范知识库尚未就绪，请先导入内置规范或上传文件。');
  }

  const effectiveInput = buildBriefWorkflowInput(options);
  const retrievalHits = retrieveKnowledgeHits(
    effectiveInput,
    options.knowledgeDocuments,
    options.settings.retrievalTopK
  );
  const generated = await generateBriefWithFallback({
    settings: options.settings,
    userInput: effectiveInput,
    parkType: options.parkType,
    siteAnalysis: options.siteAnalysis ?? null,
    senseMapping,
    retrievalHits,
    referenceProjects: options.referenceProjects
  });
  const ruled = applyBriefRules(generated.brief, effectiveInput, complianceRules);

  const runId = createId('brief');
  const createdAt = new Date().toISOString();
  const artifactPath = formatRelativePath('design_brief', options.settings.projectName);

  const result: BriefWorkflowResult = {
    runId,
    createdAt,
    brief: ruled.brief,
    retrievalHits,
    appliedRules: ruled.appliedRules,
    selectedReferenceProjects: options.referenceProjects,
    tokenUsage: generated.tokenUsage,
    artifactPath
  };

  const historyRecord: HistoryRecord = {
    runId,
    workflowType: 'design_brief',
    createdAt,
    projectName: options.settings.projectName,
    inputPreview: [options.parkType?.trim(), options.userInput.trim()]
      .filter(Boolean)
      .join('｜')
      .slice(0, 200),
    resultPreview: {
      brief: result.brief,
      referenceProjectNames: options.referenceProjects.map((item) => item.name),
      linkedSiteAnalysis: Boolean(options.siteAnalysis)
    },
    artifactPath
  };

  return {
    result,
    usage: generated.tokenUsage,
    historyRecord
  };
}

export async function runSiteAnalysisWorkflow(options: {
  siteText: string;
  settings: WorkflowSettings;
  library: ReferenceProject[];
}): Promise<{
  result: SiteWorkflowResult;
  usage: TokenUsage;
  historyRecord: HistoryRecord;
}> {
  const generated = await generateSiteAnalysisWithFallback({
    settings: options.settings,
    siteText: options.siteText
  });
  const ruled = applySiteRules(generated.analysis, options.siteText, complianceRules);
  const recommendedProjects = recommendProjects({
    siteText: options.siteText,
    analysis: ruled.analysis,
    topK: 4,
    library: options.library
  });

  const runId = createId('site');
  const createdAt = new Date().toISOString();
  const artifactPath = formatRelativePath('site_analysis', options.settings.projectName);

  const result: SiteWorkflowResult = {
    runId,
    createdAt,
    analysis: ruled.analysis,
    appliedRules: ruled.appliedRules,
    recommendedProjects,
    tokenUsage: generated.tokenUsage,
    artifactPath
  };

  const historyRecord: HistoryRecord = {
    runId,
    workflowType: 'site_analysis',
    createdAt,
    projectName: options.settings.projectName,
    inputPreview: options.siteText.slice(0, 200),
    resultPreview: {
      analysis: result.analysis,
      recommendedProjectNames: recommendedProjects.map((item) => item.name)
    },
    artifactPath
  };

  return {
    result,
    usage: generated.tokenUsage,
    historyRecord
  };
}
