<template>
  <AppShell>
    <div class="page-grid">
      <PageHero
        kicker="Overview"
        title="把前期景观分析流程整理成一套可汇报、可追踪的工作台"
        description="围绕知识库、场地分析、任务书和项目资产建立前期协作闭环，让每一步都能被回看、下载和复用。"
      >
        <template #actions>
          <el-button type="primary" @click="router.push('/site-analysis')">
            进入场地分析
          </el-button>
          <el-button @click="router.push('/design-brief')">
            查看任务书
          </el-button>
        </template>
        <template #aside>
          <div class="hero-aside-card">
            <span class="section-caption">Studio Mood</span>
            <div class="hero-badges">
              <span class="data-chip">Zen Dashboard</span>
              <span class="data-chip">Soft Layout</span>
              <span class="data-chip">Workflow Ready</span>
            </div>
            <p class="muted">首页现在更接近 Stitch 方案二的仪表盘语气，强调主视觉、信息节奏和工作流入口。</p>
          </div>
        </template>
      </PageHero>

      <section class="dashboard-stage">
        <section class="surface-card stage-board">
          <div class="stage-board__header">
            <div>
              <span class="section-caption">Studio Canvas</span>
              <h3 class="section-title">当前工作区脉络</h3>
            </div>
            <div class="stage-board__actions">
              <el-button type="primary" plain @click="router.push('/knowledge-base')">
                导入规范
              </el-button>
              <el-button plain @click="router.push('/project-assets')">
                查看资产
              </el-button>
            </div>
          </div>

          <div class="pulse-grid">
            <article class="pulse-card pulse-card--main">
              <span class="info-label">Project Pulse</span>
              <strong>{{ store.settings.projectName }}</strong>
              <p>
                {{ featuredMessage }}
              </p>
            </article>

            <article v-for="step in store.projectProgress" :key="step.title" class="pulse-card">
              <span class="info-label">{{ step.done ? 'Completed' : 'Pending' }}</span>
              <strong>{{ step.title }}</strong>
              <p>{{ step.desc }}</p>
            </article>
          </div>
        </section>

        <aside class="stage-side">
          <section class="surface-card side-card">
            <span class="section-caption">Live Snapshot</span>
            <div class="side-stat">
              <span>运行模式</span>
              <strong>{{ store.settings.runMode === 'remote' ? 'Remote' : 'Demo' }}</strong>
            </div>
            <div class="side-stat">
              <span>知识库状态</span>
              <strong>{{ store.knowledgeBase.ready ? 'Ready' : 'Waiting' }}</strong>
            </div>
            <div class="side-stat">
              <span>参考案例</span>
              <strong>{{ store.referenceLibrary.length }}</strong>
            </div>
          </section>

          <section class="surface-card side-card side-card--note">
            <span class="section-caption">Workflow Focus</span>
            <strong>清晰输入、柔和布局与结果沉淀，适合项目汇报与前期协作。</strong>
          </section>
        </aside>
      </section>

      <section class="metric-grid">
        <MetricCard
          v-for="metric in store.dashboardMetrics"
          :key="metric.label"
          :label="metric.label"
          :value="metric.value"
        />
      </section>

      <section class="overview-grid">
        <section class="surface-card content-panel">
          <div class="panel-head">
            <div>
              <span class="section-caption">Recent Output</span>
              <h3 class="section-title">最近活动</h3>
            </div>
          </div>
          <div v-if="store.latestRecords.length" class="timeline-river">
            <article
              v-for="record in store.latestRecords"
              :key="record.runId"
              class="timeline-river__item"
            >
              <span class="info-label">
                {{ record.workflowType === 'design_brief' ? 'Digital Brief' : 'Site Analysis' }}
              </span>
              <strong>{{ record.inputPreview.slice(0, 54) }}</strong>
              <p>{{ record.artifactPath }}</p>
              <small>{{ formatDateTime(record.createdAt) }}</small>
            </article>
          </div>
          <el-empty v-else description="还没有历史记录，建议从知识库或场地分析开始。" />
        </section>

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
            <span class="section-caption">Capability River</span>
            <h3 class="section-title">系统能力带</h3>
            <p class="muted">把核心能力从“功能列表”改成更像设计板上的一排漂浮信息块。</p>
          </div>
        </div>
        <div class="feature-river">
          <article class="feature-card">
            <strong>Browser Knowledge Base</strong>
            <p>在纯前端环境中完成规范导入、分块、去重、预览和轻量检索。</p>
          </article>
          <article class="feature-card">
            <strong>Rules in TypeScript</strong>
            <p>把坡度、植物安全、场地约束等规则迁移到前端服务层，生成结果不再完全黑盒。</p>
          </article>
          <article class="feature-card">
            <strong>Dual Generation Mode</strong>
            <p>支持演示模式和远程模型模式切换，兼顾作品集展示和后续真实接入。</p>
          </article>
          <article class="feature-card">
            <strong>Asset-first Workflow</strong>
            <p>从场地分析到任务书，再到历史快照和 JSON 导出，形成完整的资产沉淀链路。</p>
          </article>
        </div>
      </section>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import { computed } from 'vue';
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

const featuredMessage = computed(() => {
  if (store.lastSiteResult && store.lastBriefResult) {
    return '当前工作区已经具备场地分析与任务书结果，可以直接进入汇报与复核阶段。';
  }
  if (store.lastSiteResult) {
    return '场地分析已完成，下一步建议把推荐案例同步到任务书模块继续整理。';
  }
  if (store.knowledgeBase.ready) {
    return '知识库已经准备好，现在可以开始做场地分析，让流程真正跑起来。';
  }
  return '建议先导入规范知识库，再开始场地分析与任务书生成，建立完整工作流。';
});
</script>

<style scoped lang="scss">
.hero-aside-card {
  display: grid;
  gap: 0.9rem;
  padding: 1.15rem 1.2rem;
  min-height: 100%;
  border-radius: 42% 58% 46% 54% / 45% 42% 58% 55%;
  border: 1px solid rgba(113, 132, 109, 0.08);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.64), rgba(240, 239, 231, 0.45)),
    rgba(255, 252, 246, 0.42);
}

.hero-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.2rem;
}

.dashboard-stage {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(260px, 0.62fr);
  gap: 1rem;
}

.stage-board,
.side-card,
.content-panel {
  padding: 1.15rem 1.2rem;
}

.stage-board {
  background:
    radial-gradient(circle at 18% 78%, rgba(130, 150, 125, 0.14), transparent 16%),
    radial-gradient(circle at 74% 20%, rgba(212, 199, 162, 0.16), transparent 18%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.54), rgba(241, 240, 232, 0.42)),
    rgba(255, 252, 246, 0.42);
}

.stage-board__header,
.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.stage-board__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.pulse-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.95rem;
  margin-top: 1rem;
}

.pulse-card {
  display: grid;
  gap: 0.45rem;
  min-height: 9.5rem;
  padding: 1rem 1.05rem;
  border-radius: 2rem;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.66), rgba(239, 238, 230, 0.46)),
    rgba(255, 252, 246, 0.4);
  border: 1px solid rgba(113, 132, 109, 0.08);
  box-shadow: var(--shadow-soft);
}

.pulse-card--main {
  grid-column: span 2;
  min-height: 12rem;
  align-content: start;
}

.pulse-card strong {
  font-size: 1.18rem;
  line-height: 1.25;
}

.pulse-card--main strong {
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 2.8vw, 2.6rem);
  line-height: 0.95;
}

.pulse-card p {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.65;
}

.info-label {
  display: block;
  color: var(--text-secondary);
  font-size: 0.76rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.stage-side {
  display: grid;
  gap: 1rem;
}

.side-card {
  display: grid;
  gap: 0.9rem;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.58), rgba(240, 239, 231, 0.42)),
    rgba(255, 252, 246, 0.38);
}

.side-card--note {
  align-content: center;
  border-radius: 46% 54% 49% 51% / 44% 42% 58% 56%;
}

.side-card--note strong {
  font-family: var(--font-display);
  font-size: 1.36rem;
  line-height: 1.2;
}

.side-stat {
  display: grid;
  gap: 0.25rem;
  padding: 0.95rem 1rem;
  border-radius: 999px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.7), rgba(239, 238, 231, 0.46)),
    rgba(255, 252, 246, 0.42);
  border: 1px solid rgba(113, 132, 109, 0.08);
}

.side-stat span {
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.side-stat strong {
  font-family: var(--font-display);
  font-size: 1.5rem;
  line-height: 1;
}

.overview-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.18fr) minmax(340px, 0.92fr);
  gap: 1rem;
}

.timeline-river {
  display: grid;
  gap: 0.9rem;
  margin-top: 1rem;
}

.timeline-river__item {
  display: grid;
  gap: 0.35rem;
  padding: 1rem 1.05rem;
  border-radius: var(--radius-lg);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.62), rgba(240, 239, 231, 0.46)),
    rgba(255, 252, 246, 0.38);
  border: 1px solid rgba(113, 132, 109, 0.08);
  box-shadow: var(--shadow-soft);
}

.timeline-river__item strong {
  font-size: 1rem;
}

.timeline-river__item p,
.timeline-river__item small {
  margin: 0;
  color: var(--text-secondary);
  overflow-wrap: anywhere;
}

.feature-river {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.feature-card {
  padding: 1rem 1.05rem;
  border-radius: 2rem;
  border: 1px solid rgba(113, 132, 109, 0.08);
  background:
    radial-gradient(circle at top right, rgba(212, 199, 162, 0.16), transparent 28%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.62), rgba(240, 239, 231, 0.46)),
    rgba(255, 252, 246, 0.38);
  box-shadow: var(--shadow-soft);
}

.feature-card p {
  margin: 0.6rem 0 0;
  color: var(--text-secondary);
  line-height: 1.65;
}

@media (max-width: 1180px) {
  .dashboard-stage,
  .overview-grid,
  .feature-river {
    grid-template-columns: 1fr;
  }

  .pulse-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 720px) {
  .stage-board__header,
  .panel-head {
    flex-direction: column;
  }

  .pulse-grid {
    grid-template-columns: 1fr;
  }

  .pulse-card--main {
    grid-column: auto;
  }
}
</style>
