<template>
  <AppShell>
    <div class="page-grid">
      <PageHero
        kicker="Site Analysis"
        title="场地分析、案例推荐与在线检索联动"
        description="场地分析升级为 8 大业务模块输出，可直接支撑任务书编制、方案启动会和内部评审。"
      >
        <template #actions>
          <el-button
            type="primary"
            :loading="store.loading.site"
            @click="handleAnalyze"
          >
            生成场地分析报告
          </el-button>
          <el-button @click="router.push('/design-brief')">
            去看任务书页
          </el-button>
        </template>
      </PageHero>

      <section class="site-grid">
        <section class="surface-card panel-stack input-panel">
          <div>
            <h3 class="section-title">场地资料输入</h3>
            <p class="muted">支持手动输入，也可上传 `.txt / .pdf / .docx` 作为补充材料。</p>
          </div>

          <el-upload
            :auto-upload="false"
            :show-file-list="false"
            accept=".txt,.pdf,.docx,.doc"
            @change="handleSelectSiteFile"
          >
            <el-button type="primary" plain>选择场地文件</el-button>
          </el-upload>

          <div class="file-state">
            <span class="muted">当前文件</span>
            <strong>{{ selectedSiteFile?.name || '未附加文件' }}</strong>
          </div>

          <el-input
            v-model="siteInput"
            type="textarea"
            :rows="12"
            placeholder="输入场地描述..."
          />
        </section>

        <section v-if="store.lastSiteResult" class="surface-card panel-stack panel">
          <div class="panel-head">
            <div>
              <h3 class="section-title">分析摘要</h3>
              <p class="muted">先从模块完整度、约束数量和建议数量判断这次分析是否足够支撑后续工作。</p>
            </div>
            <el-button type="primary" plain @click="downloadSiteAnalysis">
              下载 JSON
            </el-button>
          </div>

          <div class="metric-grid">
            <MetricCard label="SWOT 条目" :value="String(swotItemCount)" />
            <MetricCard
              label="落地约束"
              :value="String(store.lastSiteResult.analysis.constraints.length)"
            />
            <MetricCard
              label="设计建议"
              :value="String(store.lastSiteResult.analysis.designSuggestions.length)"
            />
            <MetricCard
              label="推荐项目"
              :value="String(store.lastSiteResult.recommendedProjects.length)"
            />
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
      </section>

      <section v-if="store.lastSiteResult" class="surface-card panel-stack panel">
        <div>
          <h3 class="section-title">八大分析模块</h3>
          <p class="muted">按真实前期分析逻辑展开，便于你逐项核对和汇报。</p>
        </div>

        <div class="analysis-grid">
          <article
            v-for="section in analysisSections"
            :key="section.title"
            class="analysis-card"
          >
            <span class="info-label">{{ section.title }}</span>
            <p>{{ section.content }}</p>
          </article>
        </div>
      </section>

      <section v-if="store.lastSiteResult" class="detail-grid">
        <section class="surface-card panel-stack panel">
          <div>
            <h3 class="section-title">SWOT 分析</h3>
            <p class="muted">把场地优势、短板、机会和风险拆开，方便方案启动阶段快速对焦。</p>
          </div>
          <div class="analysis-grid">
            <article class="analysis-card">
              <span class="info-label">Strengths</span>
              <ul class="fact-list">
                <li v-for="item in store.lastSiteResult.analysis.swotAnalysis.strengths" :key="item">
                  {{ item }}
                </li>
              </ul>
            </article>
            <article class="analysis-card">
              <span class="info-label">Weaknesses</span>
              <ul class="fact-list">
                <li v-for="item in store.lastSiteResult.analysis.swotAnalysis.weaknesses" :key="item">
                  {{ item }}
                </li>
              </ul>
            </article>
            <article class="analysis-card">
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
            <article class="analysis-card">
              <span class="info-label">Threats</span>
              <ul class="fact-list">
                <li v-for="item in store.lastSiteResult.analysis.swotAnalysis.threats" :key="item">
                  {{ item }}
                </li>
              </ul>
            </article>
          </div>
        </section>

        <section class="surface-card panel-stack panel">
          <div>
            <h3 class="section-title">落地约束与设计建议</h3>
            <p class="muted">这里的内容最适合直接迁移到任务书、方案前置风险清单或启动会纪要。</p>
          </div>
          <div class="analysis-grid">
            <article class="analysis-card">
              <span class="info-label">落地约束</span>
              <ul class="fact-list">
                <li v-for="item in store.lastSiteResult.analysis.constraints" :key="item">
                  {{ item }}
                </li>
              </ul>
            </article>
            <article class="analysis-card">
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

      <section class="surface-card panel-stack panel">
        <div class="panel-head">
          <div>
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
                <el-checkbox :label="project.projectId">
                  纳入任务书
                </el-checkbox>
              </div>
              <CaseCard :project="project" />
            </label>
          </div>
        </el-checkbox-group>

        <el-empty
          v-if="!store.siteRecommendations.length"
          description="完成场地分析后，这里会自动出现相关项目推荐。"
        />
      </section>

      <section class="surface-card panel-stack panel">
        <div class="panel-head">
          <div>
            <h3 class="section-title">在线案例检索</h3>
            <p class="muted">保留检索、勾选、导入与同步链路，便于继续扩充案例库。</p>
          </div>
          <div class="action-row">
            <el-button
              :loading="store.loading.onlineSearch"
              @click="handleSearchOnlineCases"
            >
              检索在线案例
            </el-button>
            <el-button type="primary" plain @click="handleImportCases">
              导入所选在线案例
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
          <div class="recommendation-grid">
            <label
              v-for="project in store.onlineCaseResults"
              :key="project.projectId"
              class="checkbox-card"
            >
              <div class="checkbox-card__head">
                <el-checkbox :label="project.projectId">
                  导入案例库
                </el-checkbox>
              </div>
              <CaseCard :project="project" />
            </label>
          </div>
        </el-checkbox-group>

        <el-empty
          v-else
          description="检索后会在这里显示在线案例结果。"
        />
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
    { title: '文化/历史分析', content: analysis.culturalHistoricalAnalysis }
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
  ElMessage.success(`已导入 ${result.importedCount} 条在线案例，并同步到推荐列表。`);
}

function downloadSiteAnalysis() {
  if (!store.lastSiteResult) return;
  downloadJson(
    `${store.settings.projectName}_site_analysis.json`,
    store.lastSiteResult
  );
}
</script>

<style scoped lang="scss">
.site-grid,
.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.input-panel,
.panel {
  padding: 1rem 1.1rem;
}

.file-state,
.review-card,
.analysis-card {
  padding: 0.95rem 1rem;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.74);
}

.review-card ul,
.fact-list {
  margin: 0.7rem 0 0;
  padding-left: 1rem;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

.action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.analysis-grid,
.recommendation-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

.analysis-card p {
  margin: 0;
  line-height: 1.7;
}

.info-label {
  display: block;
  margin-bottom: 0.55rem;
  color: var(--text-secondary);
  font-size: 0.86rem;
  letter-spacing: 0.03em;
}

.checkbox-card {
  display: grid;
  gap: 0.75rem;
  padding: 0.8rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--line-soft);
  background: rgba(255, 255, 255, 0.62);
}

.checkbox-card__head {
  display: flex;
  justify-content: flex-start;
}

@media (max-width: 1180px) {
  .site-grid,
  .detail-grid,
  .analysis-grid,
  .recommendation-grid {
    grid-template-columns: 1fr;
  }
}
</style>
