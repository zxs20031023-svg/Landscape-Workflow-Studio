<template>
  <AppShell>
    <div class="page-grid">
      <PageHero
        kicker="Overview"
        title="把原始 Streamlit 原型升级成可展示的 Vue 3 前端作品"
        description="新版以前端工程化为核心，保留知识库、任务书、场地分析、案例推荐与资产管理闭环，并提供演示模式与联网智能模式。"
      >
        <template #actions>
          <el-button type="primary" @click="router.push('/knowledge-base')">
            先导入知识库
          </el-button>
          <el-button @click="router.push('/site-analysis')">
            去做场地分析
          </el-button>
        </template>
        <template #aside>
          <div class="hero-badges">
            <span class="data-chip">Vue 3 + TypeScript</span>
            <span class="data-chip">Pinia 状态联动</span>
            <span class="data-chip">浏览器端知识库</span>
            <span class="data-chip">可切换远程模型</span>
          </div>
        </template>
      </PageHero>

      <section class="metric-grid">
        <MetricCard
          v-for="metric in store.dashboardMetrics"
          :key="metric.label"
          :label="metric.label"
          :value="metric.value"
        />
      </section>

      <section class="overview-grid">
        <div class="panel-stack">
          <section class="surface-card content-panel">
            <h3 class="section-title">项目进度</h3>
            <div class="progress-list">
              <div
                v-for="step in store.projectProgress"
                :key="step.title"
                class="progress-item"
              >
                <div :class="['progress-dot', { done: step.done }]" />
                <div>
                  <strong>{{ step.title }}</strong>
                  <p class="muted">{{ step.desc }}</p>
                </div>
              </div>
            </div>
          </section>

          <section class="surface-card content-panel">
            <h3 class="section-title">最近活动</h3>
            <div v-if="store.latestRecords.length" class="timeline">
              <div
                v-for="record in store.latestRecords"
                :key="record.runId"
                class="timeline-item"
              >
                <strong>{{ record.workflowType === 'design_brief' ? '任务书生成' : '场地分析' }}</strong>
                <p>{{ record.inputPreview }}</p>
                <small>{{ formatDateTime(record.createdAt) }}</small>
              </div>
            </div>
            <el-empty
              v-else
              description="还没有历史记录，建议从知识库导入或场地分析开始。"
            />
          </section>
        </div>

        <div class="panel-stack">
          <TokenUsageChart
            :prompt-tokens="store.tokenUsage.promptTokens"
            :completion-tokens="store.tokenUsage.completionTokens"
          />
          <WorkflowRadarChart
            :knowledge-ready="store.knowledgeBase.ready"
            :has-brief="Boolean(store.lastBriefResult)"
            :has-site-analysis="Boolean(store.lastSiteResult)"
            :history-count="store.historyRecords.length"
          />
        </div>
      </section>

      <section class="surface-card content-panel">
        <div class="panel-head">
          <div>
            <h3 class="section-title">系统能力卡片</h3>
            <p class="muted">这部分是给简历展示准备的高层摘要，适合面试时快速介绍。</p>
          </div>
        </div>
        <div class="feature-grid">
          <article class="feature-card">
            <strong>知识库浏览器端迁移</strong>
            <p>在纯前端环境中实现规范导入、分块、去重、预览和轻量检索。</p>
          </article>
          <article class="feature-card">
            <strong>规则引擎前端化</strong>
            <p>把适老坡度、植物安全、湿地提醒和场地补充建议迁移为 TypeScript 规则。</p>
          </article>
          <article class="feature-card">
            <strong>双模式生成链路</strong>
            <p>支持浏览器演示模式，也支持用户填写 OpenAI Compatible 参数直连远程模型。</p>
          </article>
          <article class="feature-card">
            <strong>案例库持续积累</strong>
            <p>本地推荐、在线检索、导入案例库和同步任务书形成状态闭环。</p>
          </article>
        </div>
      </section>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

import AppShell from '@/components/layout/AppShell.vue';
import TokenUsageChart from '@/components/charts/TokenUsageChart.vue';
import WorkflowRadarChart from '@/components/charts/WorkflowRadarChart.vue';
import MetricCard from '@/components/panels/MetricCard.vue';
import PageHero from '@/components/panels/PageHero.vue';
import { useWorkflowStore } from '@/stores/workflow';
import { formatDateTime } from '@/utils/format';

const router = useRouter();
const store = useWorkflowStore();
</script>

<style scoped lang="scss">
.hero-badges {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.overview-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.9fr;
  gap: 1rem;
}

.content-panel {
  padding: 1rem 1.1rem;
}

.progress-list,
.timeline {
  display: grid;
  gap: 0.9rem;
}

.progress-item,
.timeline-item {
  display: flex;
  gap: 0.85rem;
  align-items: flex-start;
  padding: 0.9rem;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.66);
}

.progress-item p,
.timeline-item p,
.timeline-item small {
  margin: 0.35rem 0 0;
}

.progress-dot {
  width: 14px;
  height: 14px;
  margin-top: 0.25rem;
  border-radius: 999px;
  border: 2px solid var(--line-strong);
}

.progress-dot.done {
  background: var(--brand);
  border-color: var(--brand);
}

.panel-head {
  margin-bottom: 1rem;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.feature-card {
  padding: 1rem;
  border-radius: var(--radius-md);
  background: rgba(69, 109, 86, 0.08);
}

.feature-card p {
  margin: 0.65rem 0 0;
  color: var(--text-secondary);
}

@media (max-width: 1080px) {
  .overview-grid,
  .feature-grid {
    grid-template-columns: 1fr;
  }
}
</style>
