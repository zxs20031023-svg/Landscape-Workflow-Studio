import projectLibraryRaw from '@/data/project_case_library.json';
import { onlineCaseCatalog } from '@/data/onlineCaseCatalog';
import type { RawProjectLibrary, RawReferenceProject } from '@/types/data';
import type {
  OnlineSearchResult,
  ReferenceProject,
  SiteAnalysis
} from '@/types/workflow';
import { normalizeText, splitByPunctuation } from '@/utils/helpers';

function mapProject(item: RawReferenceProject): ReferenceProject {
  return {
    projectId: item.project_id,
    name: item.name,
    city: item.city,
    projectType: item.project_type,
    scene: item.scene,
    summary: item.summary,
    sourceUrl: item.source_url || '',
    sourceLabel: item.source_label || '本地案例库',
    librarySource: item.library_source || 'local',
    keywords: item.keywords || [],
    targetUsers: item.target_users || [],
    highlights: item.highlights || [],
    matchingPoints: [],
    recommendationReason: '',
    similarityScore: 0
  };
}

function analysisToText(analysis: SiteAnalysis | null) {
  if (!analysis) {
    return '';
  }

  return [
    analysis.locationAnalysis,
    analysis.trafficAnalysis,
    analysis.surroundingEnvironmentAnalysis,
    analysis.currentConditionsAnalysis,
    analysis.populationAnalysis,
    analysis.climateAnalysis,
    analysis.culturalHistoricalAnalysis,
    ...analysis.swotAnalysis.strengths,
    ...analysis.swotAnalysis.weaknesses,
    ...analysis.swotAnalysis.opportunities,
    ...analysis.swotAnalysis.threats,
    ...analysis.constraints,
    ...analysis.designSuggestions
  ].join('\n');
}

function bigrams(value: string) {
  const normalized = normalizeText(value);
  const items: string[] = [];
  for (let index = 0; index < normalized.length - 1; index += 1) {
    items.push(normalized.slice(index, index + 2));
  }
  return items;
}

function similarity(left: string, right: string) {
  const leftBigrams = bigrams(left);
  const rightBigrams = bigrams(right);
  if (!leftBigrams.length || !rightBigrams.length) {
    return 0;
  }

  const map = new Map<string, number>();
  leftBigrams.forEach((item) => map.set(item, (map.get(item) || 0) + 1));

  let intersection = 0;
  for (const item of rightBigrams) {
    const count = map.get(item) || 0;
    if (count > 0) {
      map.set(item, count - 1);
      intersection += 1;
    }
  }

  return (2 * intersection) / (leftBigrams.length + rightBigrams.length);
}

function buildReason(
  matchedKeywords: string[],
  matchedUsers: string[],
  semanticRatio: number
) {
  const parts: string[] = [];
  if (matchedKeywords.length) {
    parts.push(`命中关键词：${matchedKeywords.slice(0, 4).join('、')}`);
  }
  if (matchedUsers.length) {
    parts.push(`匹配服务人群：${matchedUsers.slice(0, 3).join('、')}`);
  }
  if (semanticRatio >= 0.18) {
    parts.push('整体场景语义与设计诉求较为接近');
  }
  if (!parts.length) {
    parts.push('与当前项目在场景类型或空间策略上具备参考价值');
  }
  return parts.join('；');
}

export const seedReferenceProjects = (
  (projectLibraryRaw as RawProjectLibrary).projects || []
).map(mapProject);

export function recommendProjects(options: {
  siteText: string;
  analysis: SiteAnalysis | null;
  topK?: number;
  library?: ReferenceProject[];
}): ReferenceProject[] {
  const queryText = `${options.siteText}\n${analysisToText(options.analysis)}`.trim();
  const library = options.library || seedReferenceProjects;
  const topK = options.topK || 4;

  return library
    .map((project) => {
      const matchedKeywords = project.keywords.filter(
        (keyword) => keyword && queryText.includes(keyword)
      );
      const matchedUsers = project.targetUsers.filter(
        (user) => user && queryText.includes(user)
      );
      const referenceText = [
        project.name,
        project.city,
        project.projectType,
        project.scene,
        project.summary,
        ...project.keywords,
        ...project.highlights
      ].join(' ');
      const semanticRatio = similarity(queryText, referenceText);
      let score =
        matchedKeywords.length * 18 + matchedUsers.length * 10 + semanticRatio * 100;

      if (project.scene && queryText.includes(project.scene)) {
        score += 12;
      }
      if (project.projectType && queryText.includes(project.projectType)) {
        score += 10;
      }

      const matchingPoints = [...matchedKeywords];
      matchedUsers.forEach((item) => {
        if (!matchingPoints.includes(item)) {
          matchingPoints.push(item);
        }
      });
      if (semanticRatio >= 0.18) {
        matchingPoints.push('场景语义接近');
      }

      return {
        ...project,
        matchingPoints: matchingPoints.slice(0, 5),
        recommendationReason: buildReason(
          matchedKeywords,
          matchedUsers,
          semanticRatio
        ),
        similarityScore: Number(Math.min(score, 100).toFixed(1))
      };
    })
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, topK);
}

export function searchOnlineCases(query: string): OnlineSearchResult[] {
  const tokens = splitByPunctuation(query || '景观设计 公园 案例');
  return onlineCaseCatalog
    .map((item, index) => {
      const text = `${item.name} ${item.summary} ${item.scene} ${item.keywords.join(' ')}`;
      const matchedKeywords = tokens.filter((token) => token && text.includes(token));
      const baseScore = Math.max(55, 96 - index * 8);

      return {
        ...item,
        matchingPoints: matchedKeywords.slice(0, 4),
        recommendationReason:
          matchedKeywords.length > 0
            ? `命中检索词：${matchedKeywords.join('、')}`
            : '与当前检索主题具有潜在相关性',
        similarityScore: Math.min(100, baseScore + matchedKeywords.length * 4)
      };
    })
    .sort((a, b) => b.similarityScore - a.similarityScore);
}

export function mergeRecommendations(
  base: ReferenceProject[],
  extra: ReferenceProject[]
) {
  const merged = new Map<string, ReferenceProject>();
  [...base, ...extra].forEach((item) => {
    merged.set(item.projectId, item);
  });
  return [...merged.values()].sort((a, b) => b.similarityScore - a.similarityScore);
}

export function importOnlineCases(
  selectedCases: OnlineSearchResult[],
  library: ReferenceProject[]
) {
  const existingIds = new Set(library.map((item) => item.projectId));
  const imported: ReferenceProject[] = [];

  for (const item of selectedCases) {
    if (existingIds.has(item.projectId)) {
      continue;
    }
    imported.push({
      ...item,
      librarySource: 'local',
      sourceLabel: item.sourceLabel || '在线导入'
    });
    existingIds.add(item.projectId);
  }

  return {
    importedCount: imported.length,
    importedProjects: imported
  };
}
