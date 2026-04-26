<template>
  <AppShell>
    <div class="page-grid">
      <PageHero
        kicker="Assets"
        title="项目历史与结构化产出中心"
        description="把历史时间线、最近输出和 JSON 快照整理成更接近 Stitch 方案二的归档视图。"
      >
        <template #actions>
          <el-button v-if="store.lastBriefResult" type="primary" @click="downloadLatestBrief">
            下载最新任务书
          </el-button>
        </template>
        <template #aside>
          <div class="hero-summary">
            <div class="hero-summary__item">
              <span class="section-caption">总历史</span>
              <strong>{{ store.historyRecords.length }}</strong>
            </div>
            <div class="hero-summary__item">
              <span class="section-caption">任务书</span>
              <strong>{{ briefRecords.length }}</strong>
            </div>
            <div class="hero-summary__item">
              <span class="section-caption">场地分析</span>
              <strong>{{ siteRecords.length }}</strong>
            </div>
          </div>
        </template>
      </PageHero>

      <section class="metric-grid">
        <MetricCard label="总历史记录" :value="String(store.historyRecords.length)" />
        <MetricCard label="任务书次数" :value="String(briefRecords.length)" />
        <MetricCard label="场地分析次数" :value="String(siteRecords.length)" />
        <MetricCard label="当前项目" :value="store.settings.projectName" />
      </section>

      <section class="archive-layout">
        <section class="surface-card archive-panel archive-panel--timeline">
          <div class="panel-head">
            <div>
              <span class="section-caption">Timeline River</span>
              <h3 class="section-title">历史时间线</h3>
            </div>
          </div>

          <el-timeline v-if="store.latestRecords.length" class="asset-timeline">
            <el-timeline-item
              v-for="record in store.latestRecords"
              :key="record.runId"
              :timestamp="formatDateTime(record.createdAt)"
              placement="top"
            >
              <div class="timeline-card">
                <span class="info-label">
                  {{ record.workflowType === 'design_brief' ? 'Digital Brief' : 'Site Analysis' }}
                </span>
                <strong>
                  {{ record.workflowType === 'design_brief' ? '数字化任务书' : '场地分析报告' }}
                </strong>
                <p>{{ record.inputPreview }}</p>
                <span class="mono">{{ record.artifactPath }}</span>
              </div>
            </el-timeline-item>
          </el-timeline>

          <el-empty v-else description="暂无项目历史。" />
        </section>

        <aside class="archive-side">
          <section class="surface-card archive-panel">
            <div>
              <span class="section-caption">Latest Export</span>
              <h3 class="section-title">最近输出</h3>
            </div>
            <div class="asset-pebbles">
              <div class="asset-pebble">
                <span>最新任务书</span>
                <strong>{{ store.lastBriefResult ? 'Ready' : 'Empty' }}</strong>
              </div>
              <div class="asset-pebble">
                <span>最新场地分析</span>
                <strong>{{ store.lastSiteResult ? 'Ready' : 'Empty' }}</strong>
              </div>
              <div class="asset-pebble">
                <span>项目资产数</span>
                <strong>{{ store.historyRecords.length }}</strong>
              </div>
            </div>
          </section>

          <section class="surface-card archive-panel archive-panel--note">
            <span class="section-caption">Asset Focus</span>
            <strong>让每一次生成结果都能变成可回看、可导出、可复核的项目资产。</strong>
          </section>
        </aside>
      </section>

      <section class="snapshot-grid">
        <JsonPanel
          v-if="store.lastBriefResult"
          title="最新任务书结果"
          :payload="store.saveBriefPayload(store.lastBriefResult)"
          description="可直接用于汇报、归档或继续加工。"
        >
          <template #actions>
            <el-button type="primary" plain @click="downloadLatestBrief">
              下载 JSON
            </el-button>
          </template>
        </JsonPanel>

        <JsonPanel
          v-if="store.lastSiteResult"
          title="最新场地分析结果"
          :payload="store.lastSiteResult"
        >
          <template #actions>
            <el-button type="primary" plain @click="downloadSiteResult">
              下载 JSON
            </el-button>
          </template>
        </JsonPanel>
      </section>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import AppShell from '@/components/layout/AppShell.vue';
import JsonPanel from '@/components/panels/JsonPanel.vue';
import MetricCard from '@/components/panels/MetricCard.vue';
import PageHero from '@/components/panels/PageHero.vue';
import { useWorkflowStore } from '@/stores/workflow';
import { downloadJson } from '@/utils/download';
import { formatDateTime } from '@/utils/format';

const store = useWorkflowStore();

const briefRecords = computed(() =>
  store.historyRecords.filter((item) => item.workflowType === 'design_brief')
);
const siteRecords = computed(() =>
  store.historyRecords.filter((item) => item.workflowType === 'site_analysis')
);

function downloadLatestBrief() {
  if (!store.lastBriefResult) return;
  downloadJson(
    `${store.settings.projectName}_digital_brief.json`,
    store.saveBriefPayload(store.lastBriefResult)
  );
}

function downloadSiteResult() {
  if (!store.lastSiteResult) return;
  downloadJson(`${store.settings.projectName}_site_analysis.json`, store.lastSiteResult);
}
</script>

<style scoped lang="scss">
.archive-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.46fr) minmax(280px, 0.58fr);
  gap: 1rem;
}

.archive-panel {
  padding: 1.05rem 1.1rem;
  background:
    radial-gradient(circle at top right, rgba(216, 203, 171, 0.16), transparent 26%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.54), rgba(241, 240, 232, 0.42)),
    rgba(255, 252, 246, 0.42);
}

.archive-panel--timeline {
  min-height: 100%;
}

.archive-side {
  display: grid;
  gap: 1rem;
}

.archive-panel--note {
  align-content: center;
}

.archive-panel--note strong {
  font-family: var(--font-display);
  font-size: 1.2rem;
  line-height: 1.28;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

.asset-timeline {
  margin-top: 1rem;
}

.timeline-card {
  padding: 0.95rem 1rem;
  border-radius: var(--radius-md);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.62), rgba(240, 239, 231, 0.46)),
    rgba(255, 252, 246, 0.38);
  border: 1px solid rgba(113, 132, 109, 0.08);
  box-shadow: var(--shadow-soft);
}

.timeline-card p {
  margin: 0.4rem 0 0.6rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.asset-pebbles {
  display: grid;
  gap: 0.85rem;
  margin-top: 0.9rem;
}

.asset-pebble {
  display: grid;
  gap: 0.2rem;
  padding: 0.85rem 0.95rem;
  border-radius: var(--radius-md);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.68), rgba(239, 238, 230, 0.46)),
    rgba(255, 252, 246, 0.4);
  border: 1px solid rgba(113, 132, 109, 0.08);
}

.asset-pebble span {
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.asset-pebble strong,
.hero-summary__item strong {
  font-family: var(--font-display);
}

.asset-pebble strong {
  font-size: 1.38rem;
  line-height: 1;
}

.snapshot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 380px), 1fr));
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
}

.info-label {
  display: block;
  color: var(--text-secondary);
  font-size: 0.76rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

@media (max-width: 1180px) {
  .archive-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .panel-head,
  .hero-summary {
    flex-direction: column;
    grid-template-columns: 1fr;
  }
}
</style>
