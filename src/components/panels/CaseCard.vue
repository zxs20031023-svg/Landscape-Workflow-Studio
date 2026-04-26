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
        <span v-for="point in project.matchingPoints" :key="point" class="data-chip">
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
  grid-template-columns: minmax(104px, 128px) minmax(0, 1fr);
  gap: 0.85rem;
  padding: 0.95rem;
  min-width: 0;
  background:
    radial-gradient(circle at top right, rgba(223, 210, 172, 0.18), transparent 28%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.58), rgba(243, 241, 233, 0.46));
}

.case-card__score {
  display: grid;
  align-content: start;
  gap: 0.32rem;
  padding: 0.85rem;
  border-radius: var(--radius-md);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.62), rgba(231, 234, 224, 0.45)),
    rgba(247, 244, 236, 0.6);
  border: 1px solid rgba(113, 132, 109, 0.08);
}

.case-card__body {
  min-width: 0;
  display: grid;
  gap: 0.5rem;
}

.case-card__score span,
.case-card__meta,
.case-card__reason,
.case-card__highlights {
  color: var(--text-secondary);
}

.case-card__score strong {
  font-size: 1.8rem;
  line-height: 1;
  font-family: var(--font-display);
  font-variant-numeric: tabular-nums;
}

.case-card__title {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.75rem;
  align-items: center;
}

.case-card__title h3 {
  margin: 0;
  font-size: 1.1rem;
  min-width: 0;
  line-height: 1.3;
  word-break: break-word;
}

.case-card__summary {
  margin: 0;
  color: var(--ink-soft);
  line-height: 1.62;
  word-break: break-word;
}

.case-card__chips {
  display: flex;
  flex-wrap: wrap;
}

.case-card__link {
  color: var(--brand-deep);
  font-weight: 700;
  width: fit-content;
  min-height: 34px;
  display: inline-flex;
  align-items: center;
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
