import type { ComplianceRules } from '@/types/data';
import type {
  AppliedRule,
  LandscapeBrief,
  SiteAnalysis
} from '@/types/workflow';
import { clamp, uniqueItems } from '@/utils/helpers';

function containsAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword));
}

export function applyBriefRules(
  brief: LandscapeBrief,
  userInput: string,
  rules: ComplianceRules
): { brief: LandscapeBrief; appliedRules: AppliedRule[] } {
  const updated: LandscapeBrief = {
    ...brief,
    targetUsers: [...brief.targetUsers],
    projectGoals: [...brief.projectGoals],
    designPrinciples: [...brief.designPrinciples],
    activityPrograms: [...brief.activityPrograms],
    functionalZones: [...brief.functionalZones],
    operationManagementSuggestions: [...brief.operationManagementSuggestions],
    canopyClosure: Number(clamp(brief.canopyClosure, 0, 1).toFixed(2)),
    hardscapeRatio: Number(clamp(brief.hardscapeRatio, 0, 1).toFixed(2)),
    pathSlopeMaxPercentage: Math.max(brief.pathSlopeMaxPercentage, 0),
    warnings: [...brief.warnings]
  };
  const appliedRules: AppliedRule[] = [];

  if (
    containsAny(userInput, rules.accessible_keywords) &&
    updated.pathSlopeMaxPercentage > rules.max_accessible_slope
  ) {
    const original = updated.pathSlopeMaxPercentage;
    updated.pathSlopeMaxPercentage = rules.max_accessible_slope;
    const warning = `检测到无障碍或适老通行需求，园路最大坡度已由 ${original}% 自动修正为 ${rules.max_accessible_slope}%。`;
    updated.warnings = uniqueItems([...updated.warnings, warning]);
    appliedRules.push({
      ruleId: 'accessible-slope',
      title: '无障碍坡度控制',
      warning,
      payload: { from: original, to: rules.max_accessible_slope }
    });
  }

  for (const [keyword, zoneName] of Object.entries(rules.required_zone_keywords)) {
    if (userInput.includes(keyword)) {
      updated.functionalZones = uniqueItems([...updated.functionalZones, zoneName]);
    }
  }

  if (containsAny(userInput, rules.protective_keywords)) {
    for (const [plantName, replacement] of Object.entries(rules.toxic_plants)) {
      if (userInput.includes(plantName)) {
        const warning = `检测到敏感人群活动场景且需求中包含“${plantName}”，建议替换为 ${replacement} 等安全树种。`;
        updated.warnings = uniqueItems([...updated.warnings, warning]);
        appliedRules.push({
          ruleId: `replace-${plantName}`,
          title: '敏感植物替换提醒',
          warning,
          payload: { plantName, replacement }
        });
      }
    }
  }

  if (containsAny(userInput, rules.wetland_keywords)) {
    const warning =
      '涉及湿地、水岸或积水场景，建议同步配置生态驳岸、雨水花园和安全防护节点。';
    updated.functionalZones = uniqueItems([
      ...updated.functionalZones,
      '雨水花园/生态缓冲带'
    ]);
    updated.warnings = uniqueItems([...updated.warnings, warning]);
    appliedRules.push({
      ruleId: 'wetland-ecology',
      title: '湿地与水岸生态提醒',
      warning
    });
  }

  if (updated.hardscapeRatio > 0.4 && updated.designPrinciples.join(' ').includes('生态')) {
    const original = updated.hardscapeRatio;
    updated.hardscapeRatio = 0.4;
    const warning =
      `设计原则包含生态导向，硬质铺装比例已由 ${original} 调整为 0.4，以保证绿量与雨水渗透空间。`;
    updated.warnings = uniqueItems([...updated.warnings, warning]);
    appliedRules.push({
      ruleId: 'ecology-hardscape',
      title: '生态场景铺装率修正',
      warning
    });
  }

  return { brief: updated, appliedRules };
}

export function applySiteRules(
  analysis: SiteAnalysis,
  siteText: string,
  rules: ComplianceRules
): { analysis: SiteAnalysis; appliedRules: AppliedRule[] } {
  const updated: SiteAnalysis = {
    ...analysis,
    swotAnalysis: {
      strengths: [...analysis.swotAnalysis.strengths],
      weaknesses: [...analysis.swotAnalysis.weaknesses],
      opportunities: [...analysis.swotAnalysis.opportunities],
      threats: [...analysis.swotAnalysis.threats]
    },
    constraints: [...analysis.constraints],
    designSuggestions: [...analysis.designSuggestions]
  };
  const appliedRules: AppliedRule[] = [];

  for (const rule of rules.site_suggestion_rules) {
    if (!containsAny(siteText, rule.keywords)) {
      continue;
    }

    updated.constraints = uniqueItems([...updated.constraints, ...rule.constraints]);
    updated.designSuggestions = uniqueItems([
      ...updated.designSuggestions,
      ...rule.suggestions
    ]);
    updated.swotAnalysis.threats = uniqueItems([
      ...updated.swotAnalysis.threats,
      ...rule.constraints
    ]);
    appliedRules.push({
      ruleId: rule.id,
      title: rule.title,
      warning: rule.summary,
      payload: rule as unknown as Record<string, unknown>
    });
  }

  return { analysis: updated, appliedRules };
}
