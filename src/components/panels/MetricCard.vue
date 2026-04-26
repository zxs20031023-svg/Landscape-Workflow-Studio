<template>
  <div class="metric-card surface-card">
    <span class="metric-card__label">{{ label }}</span>
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
  gap: 0.42rem;
  min-width: 0;
  padding: 1rem 1.1rem;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.58), rgba(242, 240, 233, 0.45)),
    rgba(255, 252, 246, 0.44);
}

.metric-card__label,
.metric-card small {
  color: var(--text-secondary);
}

.metric-card__label {
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.metric-card strong {
  min-width: 0;
  font-size: clamp(1.6rem, 2.2vw, 2.2rem);
  line-height: 1;
  font-family: var(--font-display);
  word-break: break-word;
}
</style>
