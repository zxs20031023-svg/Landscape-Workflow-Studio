import complianceRulesRaw from '@/data/compliance_rules.json';
import type { ComplianceRules } from '@/types/data';
import { applyBriefRules, applySiteRules } from './rulesEngine';
import { recommendProjects } from './recommendationService';

const rules = complianceRulesRaw as ComplianceRules;

describe('rulesEngine', () => {
  it('corrects accessible slope and appends warnings', () => {
    const result = applyBriefRules(
      {
        projectType: '社区口袋公园',
        projectPositioning: '服务社区日常活动的微更新节点',
        targetUsers: ['老年居民'],
        projectGoals: ['提升日常使用效率'],
        designPrinciples: ['生态导向'],
        spatialStructure: '一环串联多点',
        activityPrograms: ['散步休憩'],
        functionalZones: [],
        plantingStrategy: '耐候低维护种植',
        operationManagementSuggestions: ['分区维护'],
        canopyClosure: 0.6,
        pathSlopeMaxPercentage: 8,
        hardscapeRatio: 0.35,
        warnings: []
      },
      '设计一个适老社区公园，轮椅可以通行。',
      rules
    );

    expect(result.brief.pathSlopeMaxPercentage).toBe(5);
    expect(result.brief.warnings.length).toBeGreaterThan(0);
    expect(result.appliedRules.length).toBeGreaterThan(0);
  });

  it('appends site suggestions when waterlogging clues exist', () => {
    const result = applySiteRules(
      {
        locationAnalysis: '老旧社区内部',
        trafficAnalysis: '人流集中',
        surroundingEnvironmentAnalysis: '周边为住宅',
        currentConditionsAnalysis: '场地低洼，存在积水',
        populationAnalysis: '老年人较多',
        climateAnalysis: '通风一般',
        culturalHistoricalAnalysis: '社区更新背景明显',
        swotAnalysis: {
          strengths: ['需求明确'],
          weaknesses: [],
          opportunities: [],
          threats: []
        },
        constraints: [],
        designSuggestions: []
      },
      '场地低洼并长期积水。',
      rules
    );

    expect(result.analysis.designSuggestions.join('')).toContain('雨水');
    expect(result.appliedRules.length).toBeGreaterThan(0);
  });
});

describe('recommendationService', () => {
  it('returns matching projects for pocket park renewal', () => {
    const results = recommendProjects({
      siteText: '高密度社区中的口袋公园更新，强调适老、儿童活动和夜间安全。',
      analysis: null,
      topK: 3
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].projectType).toContain('公园');
  });
});
