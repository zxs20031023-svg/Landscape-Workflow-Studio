<template>
  <div class="metric-card surface-card">
    <span>{{ label }}</span>
    <strong>{{ value }}</strong>
    <small v-if="hint">{{ hint }}</small>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  value: string;
  hint?: string;
}>();
</script>

<style scoped lang="scss">
.metric-card {
  display: grid;
  gap: 0.45rem;
  padding: 1rem 1.05rem;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.8), rgba(251, 248, 242, 0.86)),
    rgba(255, 255, 255, 0.65);
}

.metric-card span,
.metric-card small {
  color: var(--text-secondary);
}

.metric-card span {
  font-size: 0.84rem;
  letter-spacing: 0.03em;
}

.metric-card strong {
  font-size: 1.9rem;
  line-height: 1.06;
}
</style>
