<template>
  <div class="app-shell">
    <div class="app-shell__mist app-shell__mist--left" aria-hidden="true" />
    <div class="app-shell__mist app-shell__mist--right" aria-hidden="true" />

    <aside class="app-sidebar surface-card">
      <div class="sidebar-brand">
        <div class="sidebar-brand__top">
          <span class="kicker">Landscape Studio</span>
          <span class="sidebar-status">
            {{ store.knowledgeBase.ready ? 'Knowledge Ready' : 'Waiting for Docs' }}
          </span>
        </div>
        <h1>Landscape Studio</h1>
        <p>
          以场地分析、知识库、任务书与资产沉淀为核心的前期工作流界面。
        </p>
      </div>

      <div class="sidebar-overview">
        <div class="sidebar-pill">
          <span>当前项目</span>
          <strong>{{ store.settings.projectName }}</strong>
        </div>
        <div class="sidebar-pill">
          <span>运行模式</span>
          <strong>{{ store.settings.runMode === 'remote' ? '远程模型' : '演示模式' }}</strong>
        </div>
      </div>

      <div class="sidebar-nav-head">
        <span>Workflow</span>
        <strong>核心页面</strong>
      </div>

      <el-menu :default-active="route.path" class="nav-menu" @select="handleSelect">
        <el-menu-item v-for="item in navItems" :key="item.path" :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </el-menu-item>
      </el-menu>

      <div class="sidebar-card">
        <div class="sidebar-card__head">
          <span>工作区状态</span>
          <strong>最近同步 {{ currentTime }}</strong>
        </div>
        <div class="sidebar-card__meta">
          <span>知识库</span>
          <b>{{ store.knowledgeBase.ready ? '已就绪' : '待导入' }}</b>
        </div>
        <div class="sidebar-card__meta">
          <span>文档数</span>
          <b>{{ store.knowledgeBase.documentCount }}</b>
        </div>
        <div class="sidebar-card__meta">
          <span>历史记录</span>
          <b>{{ store.historyRecords.length }}</b>
        </div>
      </div>
    </aside>

    <div class="app-main">
      <header class="topbar">
        <div class="topbar__metrics">
          <div class="topbar-metric surface-card">
            <span>累计 Token</span>
            <strong>{{ store.tokenUsage.totalTokens }}</strong>
          </div>
          <div class="topbar-metric surface-card">
            <span>参考案例</span>
            <strong>{{ store.referenceLibrary.length }}</strong>
          </div>
          <div class="topbar-metric surface-card">
            <span>历史记录</span>
            <strong>{{ store.historyRecords.length }}</strong>
          </div>
        </div>

        <div class="topbar__headline">
          <p class="topbar__eyebrow">Landscape Workflow Dashboard</p>
          <h2>{{ routeMetaTitle }}</h2>
          <p>{{ routeMetaDescription }}</p>
        </div>
      </header>

      <main class="page-slot">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  DataAnalysis,
  DocumentCopy,
  Files,
  Grid,
  Setting,
  TrendCharts
} from '@element-plus/icons-vue';

import { useWorkflowStore } from '@/stores/workflow';

const router = useRouter();
const route = useRoute();
const store = useWorkflowStore();

const navItems = [
  {
    path: '/overview',
    label: '总览',
    icon: Grid
  },
  {
    path: '/knowledge-base',
    label: '知识库',
    icon: Files
  },
  {
    path: '/site-analysis',
    label: '场地分析',
    icon: TrendCharts
  },
  {
    path: '/design-brief',
    label: '任务书',
    icon: DocumentCopy
  },
  {
    path: '/project-assets',
    label: '项目资产',
    icon: DataAnalysis
  },
  {
    path: '/settings',
    label: '设置',
    icon: Setting
  }
];

const pageMeta: Record<string, { title: string; description: string }> = {
  '/overview': {
    title: 'Landscape Analysis Dashboard V2',
    description: '从总览视角查看项目进度、知识库状态、分析结果与最近产出。'
  },
  '/knowledge-base': {
    title: 'Knowledge Base Workspace',
    description: '导入规范、预检文档并维护当前项目的知识依据。'
  },
  '/design-brief': {
    title: 'Digital Brief Composer',
    description: '把场地结论、规范命中和参考案例组合成结构化任务书。'
  },
  '/site-analysis': {
    title: 'Site Analysis Detail',
    description: '输入场地描述，生成结构化分析并联动相关项目推荐。'
  },
  '/project-assets': {
    title: 'Project Assets Archive',
    description: '统一查看分析记录、任务书快照与可导出的工作流产出。'
  },
  '/settings': {
    title: 'Studio Settings',
    description: '维护运行模式、模型参数与提示词模板，保持输出策略一致。'
  }
};

const routeMetaTitle = computed(
  () => pageMeta[route.path]?.title || 'Landscape Studio Workspace'
);
const routeMetaDescription = computed(
  () => pageMeta[route.path]?.description || '面向前期分析与方案启动的浏览器端工作流界面。'
);
const currentTime = computed(() =>
  new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date())
);

function handleSelect(path: string) {
  router.push(path);
}

onMounted(() => {
  store.bootstrapDemo();
});
</script>

<style scoped lang="scss">
.app-shell {
  --shell-padding: clamp(0.9rem, 1.4vw, 1.35rem);
  --shell-gap: clamp(1rem, 1.4vw, 1.35rem);
  --sidebar-width: clamp(268px, 20vw, 304px);
  min-height: 100vh;
  width: 100%;
  max-width: 100%;
  padding: var(--shell-padding);
  overflow-x: clip;
  position: relative;
}

.app-shell__mist {
  position: absolute;
  pointer-events: none;
  border-radius: 52% 48% 42% 58% / 46% 36% 64% 54%;
  filter: blur(12px);
  opacity: 0.44;
}

.app-shell__mist--left {
  left: -3rem;
  top: 3rem;
  width: 22rem;
  height: 28rem;
  background: rgba(133, 152, 129, 0.16);
}

.app-shell__mist--right {
  right: -2rem;
  top: 0.75rem;
  width: 18rem;
  height: 24rem;
  background: rgba(216, 204, 170, 0.18);
}

.app-sidebar {
  position: fixed;
  left: var(--shell-padding);
  top: var(--shell-padding);
  width: var(--sidebar-width);
  height: calc(100vh - (var(--shell-padding) * 2));
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.05rem;
  background:
    linear-gradient(rgba(51, 74, 55, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(51, 74, 55, 0.045) 1px, transparent 1px),
    radial-gradient(circle at top left, rgba(154, 173, 146, 0.2), transparent 34%),
    linear-gradient(180deg, rgba(253, 251, 245, 0.86), rgba(239, 239, 228, 0.72));
  background-size: 28px 28px, 28px 28px, auto, auto;
}

.sidebar-brand {
  display: grid;
  gap: 0.75rem;
}

.sidebar-brand__top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
}

.sidebar-status {
  padding: 0.45rem 0.78rem;
  border-radius: var(--radius-pill);
  background: rgba(255, 252, 246, 0.65);
  border: 1px solid rgba(113, 132, 109, 0.1);
  color: var(--brand-deep);
  font-size: 0.78rem;
  font-weight: 700;
}

.sidebar-brand h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 2rem;
  line-height: 1;
  letter-spacing: 0;
}

.sidebar-brand p {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.65;
}

.sidebar-overview {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

.sidebar-pill {
  display: grid;
  gap: 0.28rem;
  padding: 0.85rem 0.95rem;
  border: 1px solid rgba(87, 98, 82, 0.1);
  border-radius: var(--radius-md);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.68), rgba(242, 240, 232, 0.56)),
    rgba(255, 255, 255, 0.48);
}

.sidebar-pill span,
.sidebar-nav-head span,
.sidebar-card__head span {
  color: var(--text-secondary);
}

.sidebar-pill strong {
  line-height: 1.35;
}

.sidebar-nav-head {
  display: grid;
  gap: 0.15rem;
  padding-inline: 0.2rem;
}

.sidebar-nav-head span {
  font-size: 0.76rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.nav-menu {
  border: none;
  background: transparent;
}

.nav-menu :deep(.el-menu-item) {
  margin-bottom: 0.45rem;
  border-radius: 12px;
  height: 48px;
  padding-inline: 0.88rem;
  font-weight: 600;
  transition:
    background-color 180ms var(--ease-standard),
    color 180ms var(--ease-standard),
    transform 180ms var(--ease-standard);
}

.nav-menu :deep(.el-menu-item:hover) {
  background: rgba(255, 255, 255, 0.58);
  transform: translateX(2px);
}

.nav-menu :deep(.el-menu-item.is-active) {
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.78), rgba(226, 230, 216, 0.6)),
    rgba(255, 255, 255, 0.5);
  color: var(--brand-deep);
  box-shadow:
    inset 3px 0 0 var(--accent),
    inset 0 0 0 1px rgba(98, 122, 93, 0.12);
}

.sidebar-card {
  margin-top: auto;
  padding: 0.95rem 1rem;
  border: 1px solid var(--line-soft);
  border-radius: var(--radius-lg);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.62), rgba(241, 239, 230, 0.44)),
    rgba(255, 252, 247, 0.62);
}

.sidebar-card__head {
  display: grid;
  gap: 0.2rem;
  margin-bottom: 0.8rem;
}

.sidebar-card__meta {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.55rem 0;
  border-top: 1px dashed rgba(87, 98, 82, 0.12);
}

.app-main {
  min-width: 0;
  width: auto;
  max-width: min(
    calc(100vw - (var(--shell-padding) * 3) - var(--sidebar-width) - var(--shell-gap)),
    var(--content-max)
  );
  margin-left: calc(var(--sidebar-width) + var(--shell-gap));
  display: grid;
  gap: 1rem;
  overflow-x: clip;
}

.topbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 0.72fr);
  gap: 1rem;
  align-items: start;
}

.topbar__metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.85rem;
  order: 2;
}

.topbar-metric {
  padding: 0.9rem 1rem;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.58), rgba(244, 242, 234, 0.48)),
    rgba(255, 252, 246, 0.42);
}

.topbar-metric span {
  color: var(--text-secondary);
  font-size: 0.82rem;
}

.topbar-metric strong {
  display: block;
  margin-top: 0.35rem;
  font-size: clamp(1.45rem, 1.8vw, 1.85rem);
  line-height: 1;
  font-family: var(--font-display);
}

.topbar__headline {
  display: grid;
  gap: 0.3rem;
  padding: 0.1rem 0.15rem;
  order: 1;
}

.topbar__eyebrow {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.84rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.topbar h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(2.1rem, 3.4vw, 3.1rem);
  line-height: 1;
}

.topbar__headline > p:last-child {
  margin: 0;
  color: var(--text-secondary);
  max-width: 52rem;
}

.page-slot {
  min-width: 0;
  width: 100%;
  max-width: 100%;
  overflow-x: clip;
}

@media (max-width: 1320px) {
  .app-shell {
    --sidebar-width: clamp(250px, 24vw, 280px);
  }

  .topbar__metrics {
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr));
  }

  .topbar {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1080px) {
  .app-shell {
    display: grid;
    gap: 1rem;
  }

  .app-sidebar {
    position: static;
    left: auto;
    top: auto;
    width: 100%;
    height: auto;
    overflow: visible;
  }

  .sidebar-brand,
  .sidebar-overview,
  .sidebar-card {
    max-width: 100%;
  }

  .app-main {
    width: 100%;
    max-width: 100%;
    margin-left: 0;
  }
}

@media (max-width: 720px) {
  .app-shell {
    --shell-padding: 0.75rem;
  }

  .app-sidebar {
    padding: 0.85rem;
  }

  .topbar__metrics {
    grid-template-columns: 1fr;
  }

  .sidebar-brand__top {
    align-items: flex-start;
  }
}
</style>
