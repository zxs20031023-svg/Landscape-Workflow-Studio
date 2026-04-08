<template>
  <AppShell>
    <div class="page-grid">
      <PageHero
        kicker="Design Brief"
        title="从自然语言需求到详细数字化任务书"
        description="把设计需求、规范命中与参考案例转成更适合真实项目启动会使用的结构化任务书。"
      >
        <template #actions>
          <el-button
            type="primary"
            :disabled="!hasSiteAnalysis"
            :loading="store.loading.brief"
            @click="handleGenerate"
          >
            生成数字化任务书
          </el-button>
          <el-button @click="router.push('/site-analysis')">
            先做场地分析
          </el-button>
        </template>
      </PageHero>

      <section class="brief-grid">
        <section class="surface-card panel-stack input-panel">
          <div>
            <h3 class="section-title">输入需求</h3>
            <p class="muted">先确认场地分析，再录入公园类型和设计需求，任务书会自动联动场地结论与已选案例。</p>
          </div>

          <div class="field-stack">
            <div class="field-head">
              <span class="info-label">公园类型</span>
              <span class="muted">支持直接输入自定义类型</span>
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

          <el-select
            v-model="selectedSample"
            placeholder="快速示例"
            @change="handleSampleChange"
          >
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
            :rows="11"
            placeholder="输入设计需求..."
          />
        </section>

        <section class="surface-card panel-stack linkage-panel">
          <div class="panel-head">
            <div>
              <h3 class="section-title">场地分析联动</h3>
              <p class="muted">任务书生成时会自动读取最近一次场地分析的核心判断、落地约束和设计建议。</p>
            </div>
            <el-button plain @click="router.push('/site-analysis')">
              {{ hasSiteAnalysis ? '更新场地分析' : '去做场地分析' }}
            </el-button>
          </div>

          <el-empty
            v-if="!hasSiteAnalysis"
            description="请先完成场地分析，任务书会基于场地分析结果再结合设计需求生成。"
          />

          <div v-else class="summary-grid">
            <div
              v-for="item in siteLinkageCards"
              :key="item.label"
              class="info-block"
            >
              <span class="info-label">{{ item.label }}</span>
              <p>{{ item.value }}</p>
            </div>
          </div>
        </section>

        <section class="surface-card panel-stack selection-panel selection-panel--full">
          <div>
            <h3 class="section-title">已选参考项目</h3>
            <p class="muted">来自场地分析推荐或在线案例导入，生成任务书时会自动写入。</p>
          </div>
          <el-empty
            v-if="!store.selectedReferenceProjects.length"
            description="当前还没有勾选参考项目。"
          />
          <div v-else class="selected-projects">
            <CaseCard
              v-for="project in store.selectedReferenceProjects"
              :key="project.projectId"
              :project="project"
            />
          </div>
        </section>
      </section>

      <div v-if="store.lastBriefResult" class="page-grid">
        <section class="surface-card panel-stack panel">
          <div class="panel-head">
            <div>
              <h3 class="section-title">任务书摘要</h3>
              <p class="muted">先快速确认项目类型、定位和关键控制指标是否合理。</p>
            </div>
            <el-button type="primary" plain @click="downloadBrief">
              下载 JSON
            </el-button>
          </div>

          <div class="metric-grid">
            <MetricCard
              label="项目类型"
              :value="store.lastBriefResult.brief.projectType"
            />
            <MetricCard
              label="目标人群"
              :value="String(store.lastBriefResult.brief.targetUsers.length)"
              hint="类"
            />
            <MetricCard
              label="功能分区"
              :value="String(store.lastBriefResult.brief.functionalZones.length)"
              hint="项"
            />
            <MetricCard
              label="规范依据"
              :value="String(store.lastBriefResult.retrievalHits.length)"
              hint="条"
            />
          </div>

          <div class="summary-grid">
            <div class="info-block">
              <span class="info-label">项目定位</span>
              <p>{{ store.lastBriefResult.brief.projectPositioning }}</p>
            </div>
            <div class="info-block">
              <span class="info-label">空间结构</span>
              <p>{{ store.lastBriefResult.brief.spatialStructure }}</p>
            </div>
            <div class="info-block">
              <span class="info-label">种植策略</span>
              <p>{{ store.lastBriefResult.brief.plantingStrategy }}</p>
            </div>
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

        <section class="detail-grid">
          <section class="surface-card panel-stack panel">
            <h3 class="section-title">业务要点</h3>
            <div class="detail-columns">
              <div class="info-block">
                <span class="info-label">目标人群</span>
                <ul class="fact-list">
                  <li v-for="item in store.lastBriefResult.brief.targetUsers" :key="item">{{ item }}</li>
                </ul>
              </div>
              <div class="info-block">
                <span class="info-label">项目目标</span>
                <ul class="fact-list">
                  <li v-for="item in store.lastBriefResult.brief.projectGoals" :key="item">{{ item }}</li>
                </ul>
              </div>
              <div class="info-block">
                <span class="info-label">设计原则</span>
                <ul class="fact-list">
                  <li v-for="item in store.lastBriefResult.brief.designPrinciples" :key="item">{{ item }}</li>
                </ul>
              </div>
              <div class="info-block">
                <span class="info-label">活动编程</span>
                <ul class="fact-list">
                  <li v-for="item in store.lastBriefResult.brief.activityPrograms" :key="item">{{ item }}</li>
                </ul>
              </div>
            </div>
          </section>

          <section class="surface-card panel-stack panel">
            <h3 class="section-title">空间与运营建议</h3>
            <div class="detail-columns">
              <div class="info-block">
                <span class="info-label">功能分区</span>
                <ul class="fact-list">
                  <li v-for="item in store.lastBriefResult.brief.functionalZones" :key="item">{{ item }}</li>
                </ul>
              </div>
              <div class="info-block">
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
              <div class="info-block">
                <span class="info-label">关键控制指标</span>
                <ul class="fact-list">
                  <li>树荫覆盖目标：{{ formatPercent(store.lastBriefResult.brief.canopyClosure) }}</li>
                  <li>最大坡度：{{ store.lastBriefResult.brief.pathSlopeMaxPercentage }}%</li>
                  <li>硬质铺装比例：{{ formatPercent(store.lastBriefResult.brief.hardscapeRatio) }}</li>
                </ul>
              </div>
            </div>
          </section>
        </section>

        <section class="surface-card panel-stack panel">
          <h3 class="section-title">风险与复核项</h3>
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

        <section class="detail-grid">
          <section class="surface-card panel-stack panel">
            <div>
              <h3 class="section-title">检索依据与规则命中</h3>
              <p class="muted">便于你在汇报或答辩时说明系统不是黑盒生成。</p>
            </div>
            <div class="detail-columns">
              <div class="info-block">
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
              <div class="info-block">
                <span class="info-label">规则引擎命中</span>
                <ul v-if="store.lastBriefResult.appliedRules.length" class="fact-list">
                  <li
                    v-for="rule in store.lastBriefResult.appliedRules"
                    :key="rule.ruleId"
                  >
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
      value: analysis.constraints.slice(0, 2).join('；') || '待补充'
    },
    {
      label: '设计建议',
      value: analysis.designSuggestions.slice(0, 2).join('；') || '待补充'
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
.brief-grid,
.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.input-panel,
.linkage-panel,
.selection-panel,
.panel {
  padding: 1rem 1.1rem;
}

.field-stack {
  display: grid;
  gap: 0.45rem;
}

.field-head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
}

.selected-projects {
  display: grid;
  gap: 0.85rem;
}

.selection-panel--full {
  grid-column: 1 / -1;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

.summary-grid,
.detail-columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.85rem;
}

.info-block,
.review-card {
  padding: 1rem;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.72);
}

.info-label {
  display: block;
  margin-bottom: 0.55rem;
  color: var(--text-secondary);
  font-size: 0.86rem;
  letter-spacing: 0.03em;
}

.info-block p,
.review-card ul {
  margin: 0;
}

.fact-list {
  margin: 0;
  padding-left: 1rem;
}

.fact-list p {
  margin: 0.2rem 0 0;
  color: var(--text-secondary);
}

.warning-list {
  display: grid;
  gap: 0.75rem;
}

@media (max-width: 1180px) {
  .brief-grid,
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .selection-panel--full {
    grid-column: auto;
  }
}

@media (max-width: 720px) {
  .field-head {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
