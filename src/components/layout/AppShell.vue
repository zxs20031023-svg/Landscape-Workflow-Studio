<template>
  <div class="app-shell">
    <aside class="app-sidebar surface-card">
      <div class="sidebar-brand">
        <span class="kicker">Landscape Studio</span>
        <h1>景观前期智能工作台</h1>
        <p>围绕知识库、任务书、场地分析与项目资产，提供更适合真实业务推进的工作流界面。</p>
      </div>

      <div class="sidebar-overview">
        <div class="sidebar-pill">
          <span>当前项目</span>
          <strong>{{ store.settings.projectName }}</strong>
        </div>
        <div class="sidebar-pill">
          <span>运行模式</span>
          <strong>{{ store.settings.runMode === 'remote' ? '智能联网' : '演示模式' }}</strong>
        </div>
      </div>

      <el-menu
        :default-active="route.path"
        class="nav-menu"
        @select="handleSelect"
      >
        <el-menu-item
          v-for="item in navItems"
          :key="item.path"
          :index="item.path"
        >
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
          <span>知识库状态</span>
          <b>{{ store.knowledgeBase.ready ? '已就绪' : '待导入' }}</b>
        </div>
        <div class="sidebar-card__meta">
          <span>知识文件</span>
          <b>{{ store.knowledgeBase.documentCount }}</b>
        </div>
        <div class="sidebar-card__meta">
          <span>项目资产</span>
          <b>{{ store.historyRecords.length }}</b>
        </div>
      </div>
    </aside>

    <div class="app-main">
      <header class="topbar surface-card">
        <div class="topbar__copy">
          <p class="topbar__label">Landscape Workflow Dashboard</p>
          <h2>{{ routeMetaTitle }}</h2>
          <p>{{ routeMetaDescription }}</p>
        </div>
        <div class="topbar__metrics">
          <div>
            <span>累计 Token</span>
            <strong>{{ store.tokenUsage.totalTokens }}</strong>
          </div>
          <div>
            <span>参考案例</span>
            <strong>{{ store.referenceLibrary.length }}</strong>
          </div>
          <div>
            <span>历史记录</span>
            <strong>{{ store.historyRecords.length }}</strong>
          </div>
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
    title: '工作台总览',
    description: '查看项目进度、Token 消耗、知识库状态和最近产出，保持整体推进节奏。'
  },
  '/knowledge-base': {
    title: '规范知识库管理',
    description: '导入、预检、删除和预览规范文件，为任务书与场地分析提供可追溯依据。'
  },
  '/design-brief': {
    title: '数字化任务书生成',
    description: '基于规范命中、规则提醒与参考案例，生成更贴近真实业务讨论的结构化任务书。'
  },
  '/site-analysis': {
    title: '场地分析与案例推荐',
    description: '输出结构化场地判断，联动相似项目推荐，支撑方案启动会和前期评审。'
  },
  '/project-assets': {
    title: '项目历史与资产中心',
    description: '统一查看各次分析、任务书产出和结构化结果快照，便于回看与下载。'
  },
  '/settings': {
    title: '项目参数与运行模式',
    description: '配置项目名称、模型参数、检索策略和演示模式，保持工作流上下文一致。'
  }
};

const routeMetaTitle = computed(
  () => pageMeta[route.path]?.title || '景观前期智能工作台'
);
const routeMetaDescription = computed(
  () => pageMeta[route.path]?.description || '浏览器端交互式工作流体验。'
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
  min-height: 100vh;
  display: grid;
  grid-template-columns: 332px minmax(0, 1fr);
  gap: 1.1rem;
  padding: 1rem;
}

.app-sidebar {
  position: sticky;
  top: 1rem;
  height: calc(100vh - 2rem);
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
  padding: 1.35rem;
  background:
    radial-gradient(circle at top left, rgba(213, 137, 86, 0.2), transparent 32%),
    linear-gradient(180deg, rgba(255, 251, 245, 0.96), rgba(246, 240, 229, 0.96));
}

.sidebar-brand {
  display: grid;
  gap: 0.75rem;
}

.sidebar-brand h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 2.1rem;
  line-height: 1.08;
}

.sidebar-brand p {
  margin: 0;
  color: var(--text-secondary);
}

.sidebar-overview {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.7rem;
}

.sidebar-pill {
  display: grid;
  gap: 0.2rem;
  padding: 0.85rem 0.95rem;
  border: 1px solid rgba(52, 74, 63, 0.08);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.68);
}

.sidebar-pill span,
.sidebar-card__head span,
.sidebar-card__meta span,
.topbar__label,
.topbar__metrics span {
  color: var(--text-secondary);
}

.nav-menu {
  border: none;
  background: transparent;
}

.nav-menu :deep(.el-menu-item) {
  margin-bottom: 0.4rem;
  border-radius: 16px;
  height: 52px;
  padding-inline: 1rem;
}

.nav-menu :deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, rgba(61, 92, 76, 0.18), rgba(192, 136, 92, 0.16));
  color: var(--brand-deep);
}

.sidebar-card {
  margin-top: auto;
  padding: 1rem 1.1rem;
  border: 1px solid var(--line-soft);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.76);
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
  padding: 0.5rem 0;
  border-top: 1px dashed var(--line-soft);
}

.app-main {
  min-width: 0;
  display: grid;
  gap: 1rem;
}

.topbar {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: stretch;
  padding: 1.25rem 1.4rem;
  background:
    radial-gradient(circle at top right, rgba(201, 123, 80, 0.18), transparent 30%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.92), rgba(247, 243, 235, 0.88));
}

.topbar__copy {
  display: grid;
  gap: 0.35rem;
}

.topbar h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 2.8vw, 2.5rem);
}

.topbar p {
  margin: 0;
  color: var(--text-secondary);
}

.topbar__metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(110px, 1fr));
  gap: 0.85rem;
  min-width: min(460px, 100%);
}

.topbar__metrics > div {
  padding: 0.95rem 1rem;
  border-radius: 20px;
  border: 1px solid rgba(52, 74, 63, 0.08);
  background: rgba(255, 255, 255, 0.72);
}

.topbar__metrics strong {
  display: block;
  margin-top: 0.3rem;
  font-size: 1.55rem;
  line-height: 1;
}

.page-slot {
  min-width: 0;
}

@media (max-width: 1180px) {
  .app-shell {
    grid-template-columns: 1fr;
  }

  .app-sidebar {
    position: static;
    height: auto;
  }

  .topbar {
    flex-direction: column;
  }

  .topbar__metrics {
    width: 100%;
    min-width: 0;
  }
}

@media (max-width: 720px) {
  .topbar__metrics {
    grid-template-columns: 1fr;
  }
}
</style>
