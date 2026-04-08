<template>
  <section class="hero surface-card">
    <div class="hero-copy">
      <span class="kicker">{{ kicker }}</span>
      <h1 class="page-title">{{ title }}</h1>
      <p class="page-subtitle">{{ description }}</p>
      <div v-if="$slots.actions" class="hero-actions">
        <slot name="actions" />
      </div>
    </div>
    <div v-if="$slots.aside" class="hero-aside">
      <slot name="aside" />
    </div>
    <div v-else class="hero-glow" aria-hidden="true">
      <div class="hero-glow__card">
        <span>Workflow Focus</span>
        <strong>Clear inputs, structured outputs, reusable assets.</strong>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  kicker: string;
  title: string;
  description: string;
}>();
</script>

<style scoped lang="scss">
.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(240px, 0.8fr);
  gap: 1rem;
  padding: 1.55rem;
  background:
    radial-gradient(circle at top right, rgba(200, 116, 72, 0.16), transparent 30%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.92), rgba(248, 244, 236, 0.88));
}

.hero-copy {
  display: grid;
  gap: 0.9rem;
  align-content: start;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.hero-aside {
  display: grid;
  gap: 0.8rem;
  align-content: center;
}

.hero-glow {
  display: grid;
  align-content: center;
}

.hero-glow__card {
  display: grid;
  gap: 0.55rem;
  min-height: 100%;
  padding: 1.2rem;
  border: 1px solid rgba(72, 110, 89, 0.1);
  border-radius: 22px;
  background:
    radial-gradient(circle at top right, rgba(72, 110, 89, 0.16), transparent 38%),
    rgba(255, 255, 255, 0.68);
}

.hero-glow__card span {
  color: var(--text-secondary);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.hero-glow__card strong {
  max-width: 16ch;
  font-family: var(--font-display);
  font-size: 1.32rem;
  line-height: 1.35;
}

@media (max-width: 960px) {
  .hero {
    grid-template-columns: 1fr;
  }
}
</style>
