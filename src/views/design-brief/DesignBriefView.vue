<template>
  <AppShell>
    <div class="page-grid">
      <PageHero
        kicker="Design Brief"
        title="从自然语言需求到结构化任务书"
        description="把输入区、场地联动、参考案例和结果矩阵改造成更接近 Stitch 方案二的主副版式。"
      >
        <template #actions>
          <el-button
            type="primary"
            :disabled="!hasSiteAnalysis"
            :loading="store.loading.brief"
            @click="handleGenerate"
          >
            生成任务书
          </el-button>
          <el-button @click="router.push('/site-analysis')">
            返回场地分析
          </el-button>
        </template>
        <template v-if="store.lastBriefResult" #aside>
          <div class="hero-summary">
            <div class="hero-summary__item">
              <span class="section-caption">目标人群</span>
              <strong>{{ store.lastBriefResult.brief.targetUsers.length }}</strong>
            </div>
            <div class="hero-summary__item">
              <span class="section-caption">功能分区</span>
              <strong>{{ store.lastBriefResult.brief.functionalZones.length }}</strong>
            </div>
            <div class="hero-summary__item">
              <span class="section-caption">规范命中</span>
              <strong>{{ store.lastBriefResult.retrievalHits.length }}</strong>
            </div>
          </div>
        </template>
      </PageHero>

      <section class="brief-stage">
        <section class="surface-card studio-panel">
          <div class="panel-head">
            <div>
              <span class="section-caption">Brief Studio</span>
              <h3 class="section-title">输入设计需求</h3>
            </div>
            <el-button plain @click="router.push('/site-analysis')">
              {{ hasSiteAnalysis ? '更新场地分析' : '去做场地分析' }}
            </el-button>
          </div>

          <div class="field-stack">
            <div class="field-head">
              <span class="info-label">Park Type</span>
              <span class="muted">支持输入自定义类型</span>
            </div>
            <el-select
              v-model="selectedParkType"
              filterable
              allow-create
              default-first-option
              clearable
              placeholder="选择或输入公园类型"
            >
              <el-option
                v-for="item in PARK_TYPE_OPTIONS"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </div>

          <el-select v-model="selectedSample" placeholder="快速示例" @change="handleSampleChange">
            <el-option
              v-for="item in BRIEF_SAMPLES"
              :key="item.label"
              :label="item.label"
              :value="item.value"
            />
          </el-select>

          <el-input
            v-model="briefInput"
            type="textarea"
            :rows="12"
            placeholder="输入设计需求、目标人群、活动方向、预算条件和风格取向..."
          />
        </section>

        <aside class="brief-side">
          <section class="surface-card pebble-panel">
            <span class="section-caption">Linked Site Context</span>
            <el-empty
              v-if="!hasSiteAnalysis"
              description="请先完成场地分析，任务书会自动读取场地结论与约束。"
            />
            <div v-else class="context-pebbles">
              <div v-for="item in siteLinkageCards" :key="item.label" class="context-pebble">
                <span class="info-label">{{ item.label }}</span>
                <p>{{ item.value }}</p>
              </div>
            </div>
          </section>

          <section class="surface-card note-panel">
            <span class="section-caption">Workflow Focus</span>
            <strong>把场地判断、规范命中与参考案例真正并入同一份任务书结构。</strong>
          </section>
        </aside>
      </section>

      <section class="surface-card board-panel">
        <div class="panel-head">
          <div>
            <span class="section-caption">Reference Board</span>
            <h3 class="section-title">已选参考项目</h3>
            <p class="muted">来自场地分析推荐或在线案例导入，生成任务书时会自动写入。</p>
          </div>
        </div>
        <el-empty v-if="!store.selectedReferenceProjects.length" description="当前还没有勾选参考项目。" />
        <div v-else class="reference-grid">
          <CaseCard
            v-for="project in store.selectedReferenceProjects"
            :key="project.projectId"
            :project="project"
          />
        </div>
      </section>

      <div v-if="store.lastBriefResult" class="page-grid">
        <section class="brief-dashboard">
          <section class="surface-card board-panel board-panel--main">
            <div class="panel-head">
              <div>
                <span class="section-caption">Brief Summary</span>
                <h3 class="section-title">任务书摘要</h3>
              </div>
              <el-button type="primary" plain @click="downloadBrief">
                下载 JSON
              </el-button>
            </div>

            <div class="summary-matrix">
              <article class="summary-node summary-node--main">
                <span class="info-label">Project Type</span>
                <strong>{{ store.lastBriefResult.brief.projectType }}</strong>
                <p>{{ store.lastBriefResult.brief.projectPositioning }}</p>
              </article>
              <article class="summary-node">
                <span class="info-label">Spatial Structure</span>
                <p>{{ store.lastBriefResult.brief.spatialStructure }}</p>
              </article>
              <article class="summary-node">
                <span class="info-label">Planting Strategy</span>
                <p>{{ store.lastBriefResult.brief.plantingStrategy }}</p>
              </article>
            </div>
          </section>

          <aside class="brief-dashboard__side">
            <section class="surface-card board-panel">
              <div>
                <span class="section-caption">Review</span>
                <h3 class="section-title">复核建议</h3>
              </div>
              <div class="review-card">
                <strong>可信度：{{ briefReview.confidence }}</strong>
                <ul>
                  <li v-for="item in briefReview.reviewItems" :key="item">
                    {{ item }}
                  </li>
                </ul>
              </div>
            </section>

            <section class="surface-card board-panel">
              <div>
                <span class="section-caption">Brief Metrics</span>
                <h3 class="section-title">结果概况</h3>
              </div>
              <div class="metric-column">
                <MetricCard label="目标人群" :value="String(store.lastBriefResult.brief.targetUsers.length)" />
                <MetricCard label="功能分区" :value="String(store.lastBriefResult.brief.functionalZones.length)" />
                <MetricCard label="规范命中" :value="String(store.lastBriefResult.retrievalHits.length)" />
              </div>
            </section>
          </aside>
        </section>

        <section class="detail-board">
          <section class="surface-card board-panel">
            <div>
              <span class="section-caption">Requirement Matrix</span>
              <h3 class="section-title">业务要点</h3>
            </div>
            <div class="detail-grid">
              <div class="detail-node">
                <span class="info-label">目标人群</span>
                <ul class="fact-list">
                  <li v-for="item in store.lastBriefResult.brief.targetUsers" :key="item">{{ item }}</li>
                </ul>
              </div>
              <div class="detail-node">
                <span class="info-label">项目目标</span>
                <ul class="fact-list">
                  <li v-for="item in store.lastBriefResult.brief.projectGoals" :key="item">{{ item }}</li>
                </ul>
              </div>
              <div class="detail-node">
                <span class="info-label">设计原则</span>
                <ul class="fact-list">
                  <li v-for="item in store.lastBriefResult.brief.designPrinciples" :key="item">{{ item }}</li>
                </ul>
              </div>
              <div class="detail-node">
                <span class="info-label">活动编程</span>
                <ul class="fact-list">
                  <li v-for="item in store.lastBriefResult.brief.activityPrograms" :key="item">{{ item }}</li>
                </ul>
              </div>
            </div>
          </section>

          <section class="surface-card board-panel">
            <div>
              <span class="section-caption">Implementation Matrix</span>
              <h3 class="section-title">空间与运营建议</h3>
            </div>
            <div class="detail-grid">
              <div class="detail-node">
                <span class="info-label">功能分区</span>
                <ul class="fact-list">
                  <li v-for="item in store.lastBriefResult.brief.functionalZones" :key="item">{{ item }}</li>
                </ul>
              </div>
              <div class="detail-node">
                <span class="info-label">运维建议</span>
                <ul class="fact-list">
                  <li
                    v-for="item in store.lastBriefResult.brief.operationManagementSuggestions"
                    :key="item"
                  >
                    {{ item }}
                  </li>
                </ul>
              </div>
              <div class="detail-node">
                <span class="info-label">关键指标</span>
                <ul class="fact-list">
                  <li>树冠覆盖目标：{{ formatPercent(store.lastBriefResult.brief.canopyClosure) }}</li>
                  <li>最大坡度：{{ store.lastBriefResult.brief.pathSlopeMaxPercentage }}%</li>
                  <li>硬质铺装比例：{{ formatPercent(store.lastBriefResult.brief.hardscapeRatio) }}</li>
                </ul>
              </div>
            </div>
          </section>
        </section>

        <section class="surface-card board-panel">
          <div>
            <span class="section-caption">Warnings</span>
            <h3 class="section-title">风险与复核项</h3>
          </div>
          <div class="warning-list">
            <el-alert
              v-for="warning in store.lastBriefResult.brief.warnings"
              :key="warning"
              :title="warning"
              type="warning"
              :closable="false"
            />
          </div>
        </section>

        <section class="detail-board">
          <section class="surface-card board-panel">
            <div>
              <span class="section-caption">Evidence Board</span>
              <h3 class="section-title">检索依据与规则命中</h3>
            </div>
            <div class="detail-grid detail-grid--evidence">
              <div class="detail-node">
                <span class="info-label">规范检索命中</span>
                <ul class="fact-list">
                  <li
                    v-for="item in store.lastBriefResult.retrievalHits"
                    :key="`${item.source}-${item.excerpt}`"
                  >
                    <strong>{{ item.source }}</strong>
                    <p>{{ item.excerpt.slice(0, 160) }}</p>
                  </li>
                </ul>
              </div>
              <div class="detail-node">
                <span class="info-label">规则引擎命中</span>
                <ul v-if="store.lastBriefResult.appliedRules.length" class="fact-list">
                  <li v-for="rule in store.lastBriefResult.appliedRules" :key="rule.ruleId">
                    <strong>{{ rule.title }}</strong>
                    <p>{{ rule.warning }}</p>
                  </li>
                </ul>
                <el-empty v-else description="本次没有触发额外规则。" />
              </div>
            </div>
          </section>

          <JsonPanel
            v-if="store.lastBriefResult"
            title="任务书主体 JSON"
            :payload="store.lastBriefResult.brief"
          />
        </section>
      </div>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

import AppShell from '@/components/layout/AppShell.vue';
import CaseCard from '@/components/panels/CaseCard.vue';
import JsonPanel from '@/components/panels/JsonPanel.vue';
import MetricCard from '@/components/panels/MetricCard.vue';
import PageHero from '@/components/panels/PageHero.vue';
import { inferBriefReview } from '@/services/llmService';
import { useWorkflowStore } from '@/stores/workflow';
import { BRIEF_SAMPLES, PARK_TYPE_OPTIONS } from '@/utils/constants';
import { downloadJson } from '@/utils/download';
import { formatPercent } from '@/utils/format';

const router = useRouter();
const store = useWorkflowStore();

const selectedSample = ref(BRIEF_SAMPLES[0].value);
const selectedParkType = ref(store.lastBriefResult?.brief.projectType || PARK_TYPE_OPTIONS[0]);
const briefInput = ref(store.lastBriefInput || BRIEF_SAMPLES[0].value);
const hasSiteAnalysis = computed(() => Boolean(store.lastSiteResult));

const siteLinkageCards = computed(() => {
  if (!store.lastSiteResult) {
    return [];
  }

  const analysis = store.lastSiteResult.analysis;
  return [
    {
      label: '区位判断',
      value: analysis.locationAnalysis
    },
    {
      label: '交通判断',
      value: analysis.trafficAnalysis
    },
    {
      label: '重点约束',
      value: analysis.constraints.slice(0, 2).join('、') || '待补充'
    },
    {
      label: '设计建议',
      value: analysis.designSuggestions.slice(0, 2).join('、') || '待补充'
    }
  ];
});

const briefReview = computed(() => {
  if (!store.lastBriefResult) {
    return {
      confidence: '低',
      reviewItems: ['生成后这里会显示结果可信度与人工复核建议。']
    };
  }

  return inferBriefReview({
    retrievalHits: store.lastBriefResult.retrievalHits,
    appliedRules: store.lastBriefResult.appliedRules,
    brief: store.lastBriefResult.brief,
    selectedReferenceProjects: store.lastBriefResult.selectedReferenceProjects,
    userInput: store.lastBriefInput
  });
});

function handleSampleChange(value: string) {
  briefInput.value = value;
}

async function handleGenerate() {
  if (!store.lastSiteResult) {
    ElMessage.warning('请先完成场地分析，再生成任务书。');
    router.push('/site-analysis');
    return;
  }

  if (!briefInput.value.trim()) {
    ElMessage.warning('请输入设计需求。');
    return;
  }

  try {
    await store.generateDesignBrief(
      briefInput.value.trim(),
      selectedParkType.value?.trim() || undefined
    );
    ElMessage.success('数字化任务书已生成。');
  } catch (error) {
    ElMessage.error((error as Error).message);
  }
}

function downloadBrief() {
  if (!store.lastBriefResult) return;
  downloadJson(
    `${store.settings.projectName}_digital_brief.json`,
    store.saveBriefPayload(store.lastBriefResult)
  );
}
</script>

<style scoped lang="scss">
.brief-stage,
.brief-dashboard,
.detail-board {
  display: grid;
  gap: 1rem;
}

.brief-stage {
  grid-template-columns: minmax(0, 1.45fr) minmax(290px, 0.62fr);
}

.brief-dashboard {
  grid-template-columns: minmax(0, 1.42fr) minmax(300px, 0.68fr);
  align-items: start;
}

.detail-board {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.studio-panel,
.board-panel,
.pebble-panel,
.note-panel {
  padding: 1.15rem 1.2rem;
  background:
    radial-gradient(circle at top right, rgba(216, 203, 171, 0.16), transparent 26%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.54), rgba(241, 240, 232, 0.42)),
    rgba(255, 252, 246, 0.42);
}

.panel-head,
.field-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.field-stack {
  display: grid;
  gap: 0.45rem;
  margin: 1rem 0 0.9rem;
}

.brief-side,
.brief-dashboard__side {
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
  padding: 0.9rem 1rem;
  border-radius: 44% 56% 48% 52% / 46% 41% 59% 54%;
  border: 1px solid rgba(113, 132, 109, 0.08);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.65), rgba(239, 238, 230, 0.44)),
    rgba(255, 252, 246, 0.4);
  box-shadow: var(--shadow-soft);
}

.hero-summary__item strong {
  font-size: 1.8rem;
  line-height: 1;
  font-family: var(--font-display);
}

.context-pebbles,
.metric-column,
.reference-grid,
.warning-list {
  display: grid;
  gap: 1rem;
}

.context-pebbles {
  margin-top: 0.8rem;
}

.context-pebble,
.summary-node,
.detail-node,
.review-card {
  padding: 1rem 1.05rem;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(113, 132, 109, 0.08);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.62), rgba(240, 239, 231, 0.46)),
    rgba(255, 252, 246, 0.38);
  box-shadow: var(--shadow-soft);
}

.context-pebble p,
.summary-node p,
.review-card ul {
  margin: 0.65rem 0 0;
  color: var(--text-secondary);
  line-height: 1.7;
}

.summary-matrix,
.detail-grid {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
}

.summary-matrix {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.summary-node--main {
  grid-column: span 2;
}

.summary-node--main strong {
  display: block;
  margin-top: 0.35rem;
  font-family: var(--font-display);
  font-size: clamp(2rem, 3vw, 2.8rem);
  line-height: 0.95;
}

.detail-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.detail-grid--evidence {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.detail-node .fact-list {
  margin: 0.65rem 0 0;
}

.detail-node .fact-list p {
  margin: 0.2rem 0 0;
  color: var(--text-secondary);
}

.note-panel {
  align-content: center;
  border-radius: 46% 54% 49% 51% / 44% 42% 58% 56%;
}

.note-panel strong {
  font-family: var(--font-display);
  font-size: 1.36rem;
  line-height: 1.2;
}

.info-label {
  display: block;
  color: var(--text-secondary);
  font-size: 0.76rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

@media (max-width: 1180px) {
  .brief-stage,
  .brief-dashboard,
  .detail-board {
    grid-template-columns: 1fr;
  }

  .detail-grid,
  .detail-grid--evidence {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 720px) {
  .panel-head,
  .field-head,
  .hero-summary,
  .summary-matrix,
  .detail-grid,
  .detail-grid--evidence {
    grid-template-columns: 1fr;
    flex-direction: column;
  }

  .summary-node--main {
    grid-column: auto;
  }
}
</style>
