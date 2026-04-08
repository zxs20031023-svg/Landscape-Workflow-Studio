import { defineStore } from 'pinia';

import type {
  BriefWorkflowResult,
  KnowledgeFilePrecheck,
  OnlineSearchResult,
  ProjectProgressStep,
  ReferenceProject,
  WorkflowSettings
} from '@/types/workflow';
import { saveSnapshot, loadSnapshot } from '@/services/storage';
import {
  ingestBundledResources,
  ingestUploadedFile,
  precheckUploadedFile
} from '@/services/knowledgeBaseService';
import {
  importOnlineCases,
  mergeRecommendations,
  searchOnlineCases,
  seedReferenceProjects
} from '@/services/recommendationService';
import {
  getWorkflowAssets,
  mergeTokenUsage,
  runDesignBriefWorkflow,
  runSiteAnalysisWorkflow
} from '@/services/workflowService';
import { DEFAULT_PROMPT_TEMPLATES, DEFAULT_SETTINGS } from '@/utils/constants';
import { sortByDateDesc } from '@/utils/helpers';

const assets = getWorkflowAssets();

export const useWorkflowStore = defineStore('workflow', {
  state: () => {
    const snapshot = loadSnapshot();
    return {
      ...snapshot,
      referenceLibrary: snapshot.referenceLibrary.length
        ? snapshot.referenceLibrary
        : seedReferenceProjects,
      loading: {
        bundledIngest: false,
        fileIngest: false,
        brief: false,
        site: false,
        onlineSearch: false
      },
      kbPrecheckResult: null as KnowledgeFilePrecheck | null
    };
  },
  getters: {
    selectedReferenceProjects(state): ReferenceProject[] {
      const selectedIds = new Set(state.selectedReferenceProjectIds);
      return state.siteRecommendations.filter((item) => selectedIds.has(item.projectId));
    },
    projectProgress(state): ProjectProgressStep[] {
      return [
        {
          done: true,
          title: '配置项目与模型',
          desc: '维护项目名称、运行模式、模型与提示词模板。'
        },
        {
          done: state.knowledgeBase.ready,
          title: '构建规范知识库',
          desc: '导入内置规范或上传文件，完成前期知识准备。'
        },
        {
          done: Boolean(state.lastSiteResult),
          title: '完成详细场地分析',
          desc: '输出区位、交通、现状、人群、SWOT 与设计建议。'
        },
        {
          done: Boolean(state.lastBriefResult),
          title: '生成数字化任务书',
          desc: '把自然语言需求转为结构化任务书，并保留规范依据与风险提示。'
        }
      ];
    },
    latestRecords(state) {
      return sortByDateDesc(state.historyRecords).slice(0, 8);
    },
    dashboardMetrics(state) {
      return [
        {
          label: '知识文件',
          value: String(state.knowledgeBase.documentCount)
        },
        {
          label: '累计 Token',
          value: String(state.tokenUsage.totalTokens)
        },
        {
          label: '参考项目',
          value: String(state.selectedReferenceProjectIds.length)
        },
        {
          label: '历史记录',
          value: String(state.historyRecords.length)
        }
      ];
    }
  },
  actions: {
    persist() {
      saveSnapshot({
        settings: this.settings,
        tokenUsage: this.tokenUsage,
        knowledgeBase: this.knowledgeBase,
        referenceLibrary: this.referenceLibrary,
        lastBriefInput: this.lastBriefInput,
        lastSiteInput: this.lastSiteInput,
        lastBriefResult: this.lastBriefResult,
        lastSiteResult: this.lastSiteResult,
        siteRecommendations: this.siteRecommendations,
        selectedReferenceProjectIds: this.selectedReferenceProjectIds,
        onlineCaseResults: this.onlineCaseResults,
        selectedOnlineCaseIds: this.selectedOnlineCaseIds,
        historyRecords: this.historyRecords
      });
    },
    updateSettings(patch: Partial<WorkflowSettings>) {
      this.settings = {
        ...this.settings,
        ...patch,
        promptTemplates: {
          ...this.settings.promptTemplates,
          ...(patch.promptTemplates || {})
        }
      };
      this.persist();
    },
    updatePromptTemplate(key: keyof WorkflowSettings['promptTemplates'], value: string) {
      this.settings = {
        ...this.settings,
        promptTemplates: {
          ...this.settings.promptTemplates,
          [key]: value
        }
      };
      this.persist();
    },
    resetPromptTemplates() {
      this.settings = {
        ...this.settings,
        promptTemplates: { ...DEFAULT_PROMPT_TEMPLATES }
      };
      this.persist();
    },
    setSelectedReferenceProjectIds(ids: string[]) {
      this.selectedReferenceProjectIds = ids;
      this.persist();
    },
    setSelectedOnlineCaseIds(ids: string[]) {
      this.selectedOnlineCaseIds = ids;
      this.persist();
    },
    async runPrecheck(file: File) {
      this.kbPrecheckResult = await precheckUploadedFile(file);
      return this.kbPrecheckResult;
    },
    async importBundledKnowledgeBase() {
      this.loading.bundledIngest = true;
      try {
        const output = await ingestBundledResources(this.knowledgeBase.documents);
        this.knowledgeBase.documents = [
          ...this.knowledgeBase.documents,
          ...output.records
        ];
        this.knowledgeBase.documentCount = this.knowledgeBase.documents.length;
        this.knowledgeBase.ready = this.knowledgeBase.documentCount > 0;
        this.persist();
        return output.results;
      } finally {
        this.loading.bundledIngest = false;
      }
    },
    async importUploadedKnowledgeFile(file: File) {
      this.loading.fileIngest = true;
      try {
        const output = await ingestUploadedFile(this.knowledgeBase.documents, file);
        if (output.record) {
          this.knowledgeBase.documents = [
            ...this.knowledgeBase.documents,
            output.record
          ];
          this.knowledgeBase.documentCount = this.knowledgeBase.documents.length;
          this.knowledgeBase.ready = this.knowledgeBase.documentCount > 0;
        }
        this.persist();
        return output.result;
      } finally {
        this.loading.fileIngest = false;
      }
    },
    removeKnowledgeDocument(documentId: string) {
      const target = this.knowledgeBase.documents.find((item) => item.id === documentId);
      if (!target) {
        return null;
      }

      this.knowledgeBase.documents = this.knowledgeBase.documents.filter(
        (item) => item.id !== documentId
      );
      this.knowledgeBase.documentCount = this.knowledgeBase.documents.length;
      this.knowledgeBase.ready = this.knowledgeBase.documentCount > 0;
      this.persist();
      return target;
    },
    async generateSiteAnalysis(siteText: string) {
      this.loading.site = true;
      try {
        const output = await runSiteAnalysisWorkflow({
          siteText,
          settings: this.settings,
          library: this.referenceLibrary
        });

        this.lastSiteInput = siteText;
        this.lastSiteResult = output.result;
        this.siteRecommendations = output.result.recommendedProjects;
        this.selectedReferenceProjectIds = output.result.recommendedProjects
          .slice(0, 2)
          .map((item) => item.projectId);
        this.historyRecords = sortByDateDesc([
          output.historyRecord,
          ...this.historyRecords
        ]);
        this.tokenUsage = mergeTokenUsage(this.tokenUsage, output.usage);
        this.persist();
        return output.result;
      } finally {
        this.loading.site = false;
      }
    },
    async generateDesignBrief(userInput: string, parkType?: string) {
      this.loading.brief = true;
      try {
        if (!this.lastSiteResult) {
          throw new Error('请先完成场地分析，再生成任务书。');
        }

        const output = await runDesignBriefWorkflow({
          userInput,
          parkType,
          settings: this.settings,
          referenceProjects: this.selectedReferenceProjects,
          knowledgeDocuments: this.knowledgeBase.documents,
          siteAnalysis: this.lastSiteResult.analysis
        });

        this.lastBriefInput = userInput;
        this.lastBriefResult = output.result;
        this.historyRecords = sortByDateDesc([
          output.historyRecord,
          ...this.historyRecords
        ]);
        this.tokenUsage = mergeTokenUsage(this.tokenUsage, output.usage);
        this.persist();
        return output.result;
      } finally {
        this.loading.brief = false;
      }
    },
    async searchOnlineCases(query: string) {
      this.loading.onlineSearch = true;
      try {
        const results = searchOnlineCases(query);
        this.onlineCaseResults = results;
        this.selectedOnlineCaseIds = results.slice(0, 2).map((item) => item.projectId);
        this.persist();
        return results;
      } finally {
        this.loading.onlineSearch = false;
      }
    },
    importSelectedOnlineCases() {
      const selectedIds = new Set(this.selectedOnlineCaseIds);
      const selectedCases = this.onlineCaseResults.filter((item) =>
        selectedIds.has(item.projectId)
      );
      const output = importOnlineCases(selectedCases, this.referenceLibrary);

      if (output.importedCount > 0) {
        this.referenceLibrary = [...this.referenceLibrary, ...output.importedProjects];
        this.siteRecommendations = mergeRecommendations(
          this.siteRecommendations,
          output.importedProjects
        );
        this.selectedReferenceProjectIds = Array.from(
          new Set([
            ...this.selectedReferenceProjectIds,
            ...output.importedProjects.map((item) => item.projectId)
          ])
        );
      }

      this.persist();
      return output;
    },
    resetWorkspace() {
      this.settings = {
        ...DEFAULT_SETTINGS,
        promptTemplates: { ...DEFAULT_PROMPT_TEMPLATES }
      };
      this.tokenUsage = {
        totalTokens: 0,
        promptTokens: 0,
        completionTokens: 0
      };
      this.knowledgeBase = {
        ready: false,
        documentCount: 0,
        documents: []
      };
      this.referenceLibrary = seedReferenceProjects;
      this.lastBriefInput = '';
      this.lastSiteInput = '';
      this.lastBriefResult = null;
      this.lastSiteResult = null;
      this.siteRecommendations = [];
      this.selectedReferenceProjectIds = [];
      this.onlineCaseResults = [];
      this.selectedOnlineCaseIds = [];
      this.historyRecords = [];
      this.kbPrecheckResult = null;
      this.persist();
    },
    bootstrapDemo() {
      if (this.knowledgeBase.ready || this.historyRecords.length) {
        return;
      }
      this.referenceLibrary = seedReferenceProjects;
      this.persist();
    },
    getSenseMappingPreview() {
      return Object.fromEntries(Object.entries(assets.senseMapping).slice(0, 8));
    },
    getComplianceRules() {
      return assets.complianceRules;
    },
    saveBriefPayload(result: BriefWorkflowResult) {
      return {
        projectName: this.settings.projectName,
        runId: result.runId,
        createdAt: result.createdAt,
        userInput: this.lastBriefInput,
        brief: result.brief,
        selectedReferenceProjects: result.selectedReferenceProjects,
        retrievalHits: result.retrievalHits,
        appliedRules: result.appliedRules
      };
    }
  }
});
