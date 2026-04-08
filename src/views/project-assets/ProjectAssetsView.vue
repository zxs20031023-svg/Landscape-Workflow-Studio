<template>
  <AppShell>
    <div class="page-grid">
      <PageHero
        kicker="Assets"
        title="项目历史与结构化产出中心"
        description="前端版保留原项目的资产意识，把每次任务书与场地分析都作为可回看、可下载的项目输出。"
      >
        <template #actions>
          <el-button
            v-if="store.lastBriefResult"
            type="primary"
            @click="downloadLatestBrief"
          >
            下载最新任务书
          </el-button>
        </template>
      </PageHero>

      <section class="metric-grid">
        <MetricCard label="总历史记录" :value="String(store.historyRecords.length)" />
        <MetricCard
          label="任务书次数"
          :value="String(briefRecords.length)"
        />
        <MetricCard
          label="场地分析次数"
          :value="String(siteRecords.length)"
        />
        <MetricCard
          label="当前项目"
          :value="store.settings.projectName"
        />
      </section>

      <section class="assets-grid">
        <section class="surface-card panel">
          <div class="panel-head">
            <div>
              <h3 class="section-title">历史时间线</h3>
              <p class="muted">按时间倒序查看最近输出。</p>
            </div>
          </div>
          <el-timeline v-if="store.latestRecords.length">
            <el-timeline-item
              v-for="record in store.latestRecords"
              :key="record.runId"
              :timestamp="formatDateTime(record.createdAt)"
              placement="top"
            >
              <div class="timeline-card">
                <strong>{{ record.workflowType === 'design_brief' ? '数字化任务书' : '场地分析报告' }}</strong>
                <p>{{ record.inputPreview }}</p>
                <span class="mono">{{ record.artifactPath }}</span>
              </div>
            </el-timeline-item>
          </el-timeline>
          <el-empty v-else description="暂无项目历史。" />
        </section>

        <div class="panel-stack">
          <JsonPanel
            v-if="store.lastBriefResult"
            title="最新任务书结果"
            :payload="store.saveBriefPayload(store.lastBriefResult)"
            description="可直接作为答辩或作品集中的结构化成果页。"
          >
            <template #actions>
              <el-button
                type="primary"
                plain
                @click="downloadLatestBrief"
              >
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
              <el-button
                type="primary"
                plain
                @click="downloadSiteResult"
              >
                下载 JSON
              </el-button>
            </template>
          </JsonPanel>
        </div>
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
  downloadJson(
    `${store.settings.projectName}_site_analysis.json`,
    store.lastSiteResult
  );
}
</script>

<style scoped lang="scss">
.assets-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.panel {
  padding: 1rem 1.1rem;
}

.timeline-card {
  padding: 0.9rem;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.7);
}

.timeline-card p {
  margin: 0.4rem 0 0.6rem;
  color: var(--text-secondary);
}

.panel-head {
  margin-bottom: 0.6rem;
}

@media (max-width: 1080px) {
  .assets-grid {
    grid-template-columns: 1fr;
  }
}
</style>
