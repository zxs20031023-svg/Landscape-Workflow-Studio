export interface PromptTemplateSettings {
  briefSystemPrompt: string;
  briefUserPrompt: string;
  siteSystemPrompt: string;
  siteUserPrompt: string;
}

export interface WorkflowSettings {
  projectName: string;
  apiKey: string;
  baseUrl: string;
  modelName: string;
  embeddingModel: string;
  retrievalTopK: number;
  runMode: 'demo' | 'remote';
  promptTemplates: PromptTemplateSettings;
}

export interface TokenUsage {
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
}

export interface LandscapeBrief {
  projectType: string;
  projectPositioning: string;
  targetUsers: string[];
  projectGoals: string[];
  designPrinciples: string[];
  spatialStructure: string;
  activityPrograms: string[];
  functionalZones: string[];
  plantingStrategy: string;
  operationManagementSuggestions: string[];
  canopyClosure: number;
  pathSlopeMaxPercentage: number;
  hardscapeRatio: number;
  warnings: string[];
}

export interface SiteSwotAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface SiteAnalysis {
  locationAnalysis: string;
  trafficAnalysis: string;
  surroundingEnvironmentAnalysis: string;
  currentConditionsAnalysis: string;
  populationAnalysis: string;
  climateAnalysis: string;
  culturalHistoricalAnalysis: string;
  swotAnalysis: SiteSwotAnalysis;
  constraints: string[];
  designSuggestions: string[];
}

export interface RetrievalHit {
  source: string;
  excerpt: string;
}

export interface AppliedRule {
  ruleId: string;
  title: string;
  warning: string;
  payload?: Record<string, unknown>;
}

export interface ReferenceProject {
  projectId: string;
  name: string;
  city: string;
  projectType: string;
  scene: string;
  summary: string;
  sourceUrl: string;
  sourceLabel: string;
  librarySource: string;
  keywords: string[];
  targetUsers: string[];
  highlights: string[];
  matchingPoints: string[];
  recommendationReason: string;
  similarityScore: number;
}

export interface KnowledgeChunk {
  id: string;
  content: string;
  chunkIndex: number;
}

export interface KnowledgeFileRecord {
  id: string;
  filename: string;
  fileHash: string;
  chunkCount: number;
  ingestedAt: string;
  sourcePath: string;
  preview: string;
  content: string;
  chunks: KnowledgeChunk[];
  sourceType: 'bundled' | 'uploaded';
}

export interface KnowledgeBaseStats {
  ready: boolean;
  documentCount: number;
  documents: KnowledgeFileRecord[];
}

export interface IngestionResult {
  filename: string;
  chunkCount: number;
  fileHash: string;
  skipped: boolean;
}

export interface BriefWorkflowResult {
  runId: string;
  createdAt: string;
  brief: LandscapeBrief;
  retrievalHits: RetrievalHit[];
  appliedRules: AppliedRule[];
  selectedReferenceProjects: ReferenceProject[];
  tokenUsage: TokenUsage;
  artifactPath: string;
}

export interface SiteWorkflowResult {
  runId: string;
  createdAt: string;
  analysis: SiteAnalysis;
  appliedRules: AppliedRule[];
  recommendedProjects: ReferenceProject[];
  tokenUsage: TokenUsage;
  artifactPath: string;
}

export interface HistoryRecord {
  runId: string;
  workflowType: 'design_brief' | 'site_analysis';
  createdAt: string;
  projectName: string;
  inputPreview: string;
  resultPreview: Record<string, unknown>;
  artifactPath: string;
}

export interface ProjectProgressStep {
  done: boolean;
  title: string;
  desc: string;
}

export interface OnlineSearchResult extends ReferenceProject {
  imported?: boolean;
}

export interface KnowledgeFilePrecheck {
  filename: string;
  documentCount: number;
  chunkCount: number;
  preview: string;
}

export interface WorkspaceSnapshot {
  settings: WorkflowSettings;
  tokenUsage: TokenUsage;
  knowledgeBase: KnowledgeBaseStats;
  referenceLibrary: ReferenceProject[];
  lastBriefInput: string;
  lastSiteInput: string;
  lastBriefResult: BriefWorkflowResult | null;
  lastSiteResult: SiteWorkflowResult | null;
  siteRecommendations: ReferenceProject[];
  selectedReferenceProjectIds: string[];
  onlineCaseResults: OnlineSearchResult[];
  selectedOnlineCaseIds: string[];
  historyRecords: HistoryRecord[];
}
