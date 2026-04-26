<template>
  <AppShell>
    <div class="page-grid">
      <PageHero
        kicker="Site Analysis"
        title="场地分析、案例推荐与在线检索联动"
        description="把输入区、分析摘要、约束建议和案例联动重新组织成主副布局，更贴近 Stitch 方案二的场地分析工作台。"
      >
        <template #actions>
          <el-button type="primary" :loading="store.loading.site" @click="handleAnalyze">
            生成场地分析
          </el-button>
          <el-button @click="router.push('/design-brief')">
            查看任务书
          </el-button>
        </template>
        <template v-if="store.lastSiteResult" #aside>
          <div class="hero-summary">
            <div class="hero-summary__item">
              <span class="section-caption">SWOT</span>
              <strong>{{ swotItemCount }}</strong>
            </div>
            <div class="hero-summary__item">
              <span class="section-caption">约束</span>
              <strong>{{ store.lastSiteResult.analysis.constraints.length }}</strong>
            </div>
            <div class="hero-summary__item">
              <span class="section-caption">推荐项目</span>
              <strong>{{ store.lastSiteResult.recommendedProjects.length }}</strong>
            </div>
          </div>
        </template>
      </PageHero>

      <section class="analysis-stage">
        <section class="surface-card studio-panel">
          <div class="studio-panel__head">
            <div>
              <span class="section-caption">Analysis Studio</span>
              <h3 class="section-title">输入场地资料</h3>
            </div>
            <el-upload
              :auto-upload="false"
              :show-file-list="false"
              accept=".txt,.pdf,.docx,.doc"
              @change="handleSelectSiteFile"
            >
              <el-button type="primary" plain>选择文件</el-button>
            </el-upload>
          </div>

          <div class="studio-panel__file">
            <span class="info-label">Current File</span>
            <strong>{{ selectedSiteFile?.name || '未附加文件' }}</strong>
          </div>

          <el-input
            v-model="siteInput"
            type="textarea"
            :rows="12"
            placeholder="输入场地描述、现状问题、气候地形、周边功能和人群特征..."
          />

          <div class="studio-panel__actions">
            <el-button type="primary" :loading="store.loading.site" @click="handleAnalyze">
              生成场地分析报告
            </el-button>
            <el-button plain @click="handleSearchOnlineCases">
              检索在线案例
            </el-button>
          </div>
        </section>

        <aside class="analysis-side">
          <section class="surface-card pebble-panel">
            <span class="section-caption">Site Capsule</span>
            <div class="pebble-list">
              <div class="pebble-pill">
                <span>分析信心</span>
                <strong>{{ siteReview.confidence }}</strong>
              </div>
              <div class="pebble-pill">
                <span>在线检索</span>
                <strong>{{ store.onlineCaseResults.length }}</strong>
              </div>
              <div class="pebble-pill">
                <span>已选案例</span>
                <strong>{{ store.selectedReferenceProjectIds.length }}</strong>
              </div>
            </div>
          </section>

          <section class="surface-card note-panel">
            <span class="section-caption">Workflow Focus</span>
            <strong>
              清晰输入、结构化判断与案例联动，适合在前期汇报时直接展开说明。
            </strong>
          </section>
        </aside>
      </section>

      <section v-if="store.lastSiteResult" class="analysis-dashboard">
        <section class="surface-card dashboard-panel dashboard-panel--main">
          <div class="panel-head">
            <div>
              <span class="section-caption">Analysis Matrix</span>
              <h3 class="section-title">七个核心判断模块</h3>
            </div>
            <el-button type="primary" plain @click="downloadSiteAnalysis">
              下载 JSON
            </el-button>
          </div>

          <div class="analysis-matrix">
            <article
              v-for="section in analysisSections"
              :key="section.title"
              class="analysis-node"
            >
              <span class="info-label">{{ section.title }}</span>
              <p>{{ section.content }}</p>
            </article>
          </div>
        </section>

        <aside class="dashboard-panel dashboard-panel--side">
          <section class="surface-card dashboard-stack">
            <div>
              <span class="section-caption">Review</span>
              <h3 class="section-title">复核建议</h3>
            </div>
            <div class="review-card">
              <strong>可信度：{{ siteReview.confidence }}</strong>
              <ul>
                <li v-for="item in siteReview.reviewItems" :key="item">
                  {{ item }}
                </li>
              </ul>
            </div>
          </section>

          <section class="surface-card dashboard-stack">
            <div>
              <span class="section-caption">Metric Pebbles</span>
              <h3 class="section-title">当前结果概况</h3>
            </div>
            <div class="metric-pebbles">
              <MetricCard label="SWOT 条目" :value="String(swotItemCount)" />
              <MetricCard
                label="落地约束"
                :value="String(store.lastSiteResult.analysis.constraints.length)"
              />
              <MetricCard
                label="设计建议"
                :value="String(store.lastSiteResult.analysis.designSuggestions.length)"
              />
            </div>
          </section>
        </aside>
      </section>

      <section v-if="store.lastSiteResult" class="detail-board">
        <section class="surface-card board-panel">
          <div>
            <span class="section-caption">SWOT Board</span>
            <h3 class="section-title">SWOT 分析</h3>
          </div>
          <div class="quad-grid">
            <article class="analysis-node">
              <span class="info-label">Strengths</span>
              <ul class="fact-list">
                <li v-for="item in store.lastSiteResult.analysis.swotAnalysis.strengths" :key="item">
                  {{ item }}
                </li>
              </ul>
            </article>
            <article class="analysis-node">
              <span class="info-label">Weaknesses</span>
              <ul class="fact-list">
                <li v-for="item in store.lastSiteResult.analysis.swotAnalysis.weaknesses" :key="item">
                  {{ item }}
                </li>
              </ul>
            </article>
            <article class="analysis-node">
              <span class="info-label">Opportunities</span>
              <ul class="fact-list">
                <li
                  v-for="item in store.lastSiteResult.analysis.swotAnalysis.opportunities"
                  :key="item"
                >
                  {{ item }}
                </li>
              </ul>
            </article>
            <article class="analysis-node">
              <span class="info-label">Threats</span>
              <ul class="fact-list">
                <li v-for="item in store.lastSiteResult.analysis.swotAnalysis.threats" :key="item">
                  {{ item }}
                </li>
              </ul>
            </article>
          </div>
        </section>

        <section class="surface-card board-panel">
          <div>
            <span class="section-caption">Action Board</span>
            <h3 class="section-title">约束与建议</h3>
          </div>
          <div class="quad-grid quad-grid--two">
            <article class="analysis-node">
              <span class="info-label">落地约束</span>
              <ul class="fact-list">
                <li v-for="item in store.lastSiteResult.analysis.constraints" :key="item">
                  {{ item }}
                </li>
              </ul>
            </article>
            <article class="analysis-node">
              <span class="info-label">设计建议</span>
              <ul class="fact-list">
                <li v-for="item in store.lastSiteResult.analysis.designSuggestions" :key="item">
                  {{ item }}
                </li>
              </ul>
            </article>
          </div>
        </section>
      </section>

      <section class="surface-card board-panel">
        <div class="panel-head">
          <div>
            <span class="section-caption">Reference Library</span>
            <h3 class="section-title">相关项目推荐</h3>
            <p class="muted">勾选后会自动同步到任务书模块。</p>
          </div>
        </div>

        <el-checkbox-group
          :model-value="store.selectedReferenceProjectIds"
          @change="handleReferenceSelection"
        >
          <div class="recommendation-grid">
            <label
              v-for="project in store.siteRecommendations"
              :key="project.projectId"
              class="checkbox-card"
            >
              <div class="checkbox-card__head">
                <el-checkbox :label="project.projectId">纳入任务书</el-checkbox>
              </div>
              <CaseCard :project="project" />
            </label>
          </div>
        </el-checkbox-group>

        <el-empty
          v-if="!store.siteRecommendations.length"
          description="完成场地分析后，这里会自动出现相关推荐项目。"
        />
      </section>

      <section class="surface-card board-panel">
        <div class="panel-head">
          <div>
            <span class="section-caption">Online Search</span>
            <h3 class="section-title">在线案例检索</h3>
          </div>
          <div class="studio-panel__actions">
            <el-button :loading="store.loading.onlineSearch" @click="handleSearchOnlineCases">
              检索案例
            </el-button>
            <el-button type="primary" plain @click="handleImportCases">
              导入所选案例
            </el-button>
          </div>
        </div>

        <el-input
          v-model="onlineQuery"
          placeholder="例如：社区口袋公园 适老 儿童活动 雨洪"
        />

        <el-checkbox-group
          v-if="store.onlineCaseResults.length"
          :model-value="store.selectedOnlineCaseIds"
          @change="handleOnlineSelection"
        >
          <div class="recommendation-grid recommendation-grid--online">
            <label
              v-for="project in store.onlineCaseResults"
              :key="project.projectId"
              class="checkbox-card"
            >
              <div class="checkbox-card__head">
                <el-checkbox :label="project.projectId">导入案例库</el-checkbox>
              </div>
              <CaseCard :project="project" />
            </label>
          </div>
        </el-checkbox-group>

        <el-empty v-else description="检索后会在这里显示在线案例结果。" />
      </section>

      <JsonPanel
        v-if="store.lastSiteResult"
        title="结构化场地分析 JSON"
        :payload="store.lastSiteResult.analysis"
      />
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { UploadFile, UploadFiles } from 'element-plus';
import { ElMessage } from 'element-plus';

import AppShell from '@/components/layout/AppShell.vue';
import CaseCard from '@/components/panels/CaseCard.vue';
import JsonPanel from '@/components/panels/JsonPanel.vue';
import MetricCard from '@/components/panels/MetricCard.vue';
import PageHero from '@/components/panels/PageHero.vue';
import { inferSiteReview } from '@/services/llmService';
import { parseUploadedFile } from '@/services/fileParser';
import { useWorkflowStore } from '@/stores/workflow';
import { SITE_ANALYSIS_SAMPLE } from '@/utils/constants';
import { downloadJson } from '@/utils/download';

const router = useRouter();
const store = useWorkflowStore();

const siteInput = ref(store.lastSiteInput || SITE_ANALYSIS_SAMPLE);
const selectedSiteFile = ref<File | null>(null);
const onlineQuery = ref(store.lastSiteInput || '社区口袋公园 适老 儿童活动');

const siteReview = computed(() => {
  if (!store.lastSiteResult) {
    return {
      confidence: '低',
      reviewItems: ['生成后这里会显示可信度与人工复核建议。']
    };
  }

  return inferSiteReview({
    analysis: store.lastSiteResult.analysis,
    appliedRules: store.lastSiteResult.appliedRules,
    recommendedProjects: store.lastSiteResult.recommendedProjects
  });
});

const analysisSections = computed(() => {
  if (!store.lastSiteResult) return [];
  const analysis = store.lastSiteResult.analysis;
  return [
    { title: '区位分析', content: analysis.locationAnalysis },
    { title: '交通分析', content: analysis.trafficAnalysis },
    { title: '周边环境分析', content: analysis.surroundingEnvironmentAnalysis },
    { title: '场地现状分析', content: analysis.currentConditionsAnalysis },
    { title: '人群分析', content: analysis.populationAnalysis },
    { title: '气候分析', content: analysis.climateAnalysis },
    { title: '文化 / 历史分析', content: analysis.culturalHistoricalAnalysis }
  ];
});

const swotItemCount = computed(() => {
  if (!store.lastSiteResult) return 0;
  const swot = store.lastSiteResult.analysis.swotAnalysis;
  return (
    swot.strengths.length +
    swot.weaknesses.length +
    swot.opportunities.length +
    swot.threats.length
  );
});

function handleSelectSiteFile(uploadFile: UploadFile, _files: UploadFiles) {
  selectedSiteFile.value = uploadFile.raw || null;
}

async function handleAnalyze() {
  if (!siteInput.value.trim() && !selectedSiteFile.value) {
    ElMessage.warning('请输入场地描述或上传补充文件。');
    return;
  }

  let combinedText = siteInput.value.trim();
  if (selectedSiteFile.value) {
    try {
      const parsed = await parseUploadedFile(selectedSiteFile.value);
      combinedText = `【文件提取内容】\n${parsed.text}\n\n【用户补充描述】\n${combinedText}`.trim();
    } catch (error) {
      ElMessage.error((error as Error).message);
      return;
    }
  }

  try {
    await store.generateSiteAnalysis(combinedText);
    onlineQuery.value = siteInput.value.trim() || onlineQuery.value;
    ElMessage.success('场地分析已完成。');
  } catch (error) {
    ElMessage.error((error as Error).message);
  }
}

function handleReferenceSelection(value: Array<string | number | boolean>) {
  store.setSelectedReferenceProjectIds(value.map((item) => String(item)));
}

function handleOnlineSelection(value: Array<string | number | boolean>) {
  store.setSelectedOnlineCaseIds(value.map((item) => String(item)));
}

async function handleSearchOnlineCases() {
  const results = await store.searchOnlineCases(onlineQuery.value.trim());
  ElMessage.success(`已检索到 ${results.length} 条在线案例。`);
}

function handleImportCases() {
  const result = store.importSelectedOnlineCases();
  if (result.importedCount === 0) {
    ElMessage.info('所选在线案例已存在于本地案例库中。');
    return;
  }
  ElMessage.success(`已导入 ${result.importedCount} 条案例，并同步到推荐列表。`);
}

function downloadSiteAnalysis() {
  if (!store.lastSiteResult) return;
  downloadJson(`${store.settings.projectName}_site_analysis.json`, store.lastSiteResult);
}
</script>

<style scoped lang="scss">
.analysis-stage,
.analysis-dashboard,
.detail-board {
  display: grid;
  gap: 1rem;
}

.analysis-stage {
  grid-template-columns: minmax(0, 1.48fr) minmax(260px, 0.58fr);
}

.analysis-dashboard {
  grid-template-columns: minmax(0, 1.45fr) minmax(300px, 0.64fr);
  align-items: start;
}

.detail-board {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.studio-panel,
.board-panel,
.dashboard-stack,
.pebble-panel,
.note-panel {
  padding: 1.05rem 1.1rem;
  background:
    radial-gradient(circle at top right, rgba(216, 203, 171, 0.16), transparent 26%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.54), rgba(241, 240, 232, 0.42)),
    rgba(255, 252, 246, 0.42);
}

.studio-panel__head,
.panel-head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

.studio-panel__file {
  display: grid;
  gap: 0.25rem;
  padding: 0.85rem 0.95rem;
  border-radius: var(--radius-md);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.68), rgba(239, 238, 230, 0.46)),
    rgba(255, 252, 246, 0.38);
  border: 1px solid rgba(113, 132, 109, 0.08);
  margin: 1rem 0;
}

.studio-panel__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  margin-top: 1rem;
}

.analysis-side,
.dashboard-panel--side {
  display: grid;
  gap: 1rem;
}

.hero-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.hero-summary__item {
  display: grid;
  gap: 0.35rem;
  padding: 0.85rem 0.95rem;
  border-radius: var(--radius-md);
  border: 1px solid rgba(113, 132, 109, 0.08);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.65), rgba(239, 238, 230, 0.44)),
    rgba(255, 252, 246, 0.4);
  box-shadow: var(--shadow-soft);
}

.hero-summary__item strong {
  font-size: 1.6rem;
  line-height: 1;
  font-family: var(--font-display);
}

.pebble-list {
  display: grid;
  gap: 0.85rem;
  margin-top: 0.8rem;
}

.pebble-pill {
  display: grid;
  gap: 0.2rem;
  padding: 0.85rem 0.95rem;
  border-radius: var(--radius-md);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.7), rgba(239, 238, 230, 0.46)),
    rgba(255, 252, 246, 0.42);
  border: 1px solid rgba(113, 132, 109, 0.08);
}

.pebble-pill span {
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.pebble-pill strong,
.note-panel strong {
  font-family: var(--font-display);
}

.pebble-pill strong {
  font-size: 1.42rem;
  line-height: 1;
}

.note-panel {
  align-content: center;
}

.note-panel strong {
  font-size: 1.2rem;
  line-height: 1.28;
}

.analysis-matrix,
.quad-grid,
.recommendation-grid,
.metric-pebbles {
  display: grid;
  gap: 1rem;
}

.analysis-matrix {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 1rem;
}

.quad-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 1rem;
}

.quad-grid--two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.analysis-node,
.review-card,
.checkbox-card {
  padding: 0.95rem 1rem;
  border-radius: var(--radius-md);
  border: 1px solid rgba(113, 132, 109, 0.08);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.62), rgba(240, 239, 231, 0.46)),
    rgba(255, 252, 246, 0.38);
  box-shadow: var(--shadow-soft);
}

.analysis-node p,
.review-card ul,
.fact-list {
  margin: 0.7rem 0 0;
}

.analysis-node p {
  color: var(--text-secondary);
  line-height: 1.64;
  overflow-wrap: anywhere;
}

.info-label {
  display: block;
  color: var(--text-secondary);
  font-size: 0.76rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.metric-pebbles {
  grid-template-columns: 1fr;
}

.recommendation-grid {
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
  margin-top: 1rem;
}

.recommendation-grid--online {
  margin-top: 1rem;
}

.checkbox-card {
  display: grid;
  gap: 0.75rem;
}

.checkbox-card__head {
  display: flex;
  justify-content: flex-start;
}

@media (max-width: 1180px) {
  .analysis-stage,
  .analysis-dashboard,
  .detail-board {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .studio-panel__head,
  .panel-head {
    flex-direction: column;
  }

  .analysis-matrix,
  .quad-grid,
  .hero-summary {
    grid-template-columns: 1fr;
  }
}
</style>
