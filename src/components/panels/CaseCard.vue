<template>
  <article class="case-card surface-card">
    <div class="case-card__score">
      <span>匹配度</span>
      <strong>{{ project.similarityScore.toFixed(1) }}</strong>
    </div>
    <div class="case-card__body">
      <div class="case-card__title">
        <h3>{{ project.name }}</h3>
        <el-tag effect="plain">{{ project.city }}</el-tag>
      </div>
      <p class="case-card__meta">{{ project.projectType }} · {{ project.scene }}</p>
      <p class="case-card__summary">{{ project.summary }}</p>
      <div v-if="project.matchingPoints.length" class="case-card__chips">
        <span
          v-for="point in project.matchingPoints"
          :key="point"
          class="data-chip"
        >
          {{ point }}
        </span>
      </div>
      <p class="case-card__reason">推荐理由：{{ project.recommendationReason }}</p>
      <p v-if="project.highlights.length" class="case-card__highlights">
        可借鉴亮点：{{ project.highlights.join('、') }}
      </p>
      <a
        v-if="project.sourceUrl"
        :href="project.sourceUrl"
        target="_blank"
        rel="noreferrer"
        class="case-card__link"
      >
        查看来源
      </a>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { ReferenceProject } from '@/types/workflow';

defineProps<{
  project: ReferenceProject;
}>();
</script>

<style scoped lang="scss">
.case-card {
  display: grid;
  grid-template-columns: minmax(108px, 132px) minmax(0, 1fr);
  gap: 1rem;
  padding: 1rem;
}

.case-card__score {
  display: grid;
  align-content: start;
  gap: 0.35rem;
  padding: 0.9rem;
  border-radius: var(--radius-md);
  background: rgba(69, 109, 86, 0.1);
}

.case-card__body {
  min-width: 0;
  display: grid;
  gap: 0.55rem;
}

.case-card__score span,
.case-card__meta,
.case-card__reason,
.case-card__highlights {
  color: var(--text-secondary);
}

.case-card__score strong {
  font-size: 2rem;
}

.case-card__title {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.75rem;
  align-items: center;
}

.case-card__title h3 {
  margin: 0;
  font-size: 1.2rem;
  min-width: 0;
  line-height: 1.4;
  word-break: break-word;
}

.case-card__summary {
  margin: 0;
}

.case-card__link {
  color: var(--brand);
  font-weight: 700;
}

@media (max-width: 720px) {
  .case-card {
    grid-template-columns: 1fr;
  }

  .case-card__title {
    grid-template-columns: 1fr;
  }
}
</style>
