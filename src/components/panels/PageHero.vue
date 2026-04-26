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

    <div v-else class="hero-pebbles" aria-hidden="true">
      <div class="hero-pebble">
        <span>Workflow Focus</span>
        <strong>清晰输入、柔和层级与结果沉淀，适合项目汇报与前期协作。</strong>
      </div>
      <div class="hero-pebble hero-pebble--small">
        <span>Zen Style</span>
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
  grid-template-columns: minmax(0, 1.55fr) minmax(280px, 0.72fr);
  gap: clamp(1rem, 1.4vw, 1.5rem);
  padding: clamp(1.2rem, 1.8vw, 1.7rem);
  background:
    linear-gradient(rgba(51, 74, 55, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(51, 74, 55, 0.04) 1px, transparent 1px),
    radial-gradient(circle at 8% 30%, rgba(147, 165, 139, 0.16), transparent 30%),
    radial-gradient(circle at 88% 10%, rgba(221, 205, 160, 0.22), transparent 26%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.74), rgba(243, 242, 233, 0.56));
  background-size: 32px 32px, 32px 32px, auto, auto, auto;
}

.hero::after {
  content: '';
  position: absolute;
  right: 1.2rem;
  bottom: 1.2rem;
  width: min(30%, 18rem);
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(98, 122, 93, 0.34));
  pointer-events: none;
}

.hero-copy {
  display: grid;
  gap: 0.9rem;
  align-content: start;
  position: relative;
  z-index: 1;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  margin-top: 0.15rem;
}

.hero-aside,
.hero-pebbles {
  display: grid;
  gap: 0.85rem;
  align-content: center;
  min-width: 0;
  position: relative;
  z-index: 1;
}

.hero-pebble {
  display: grid;
  gap: 0.5rem;
  padding: 1rem 1.1rem;
  border-radius: var(--radius-lg);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.72), rgba(241, 239, 232, 0.52)),
    rgba(255, 252, 247, 0.44);
  border: 1px solid rgba(113, 132, 109, 0.08);
  box-shadow: var(--shadow-soft);
}

.hero-pebble--small {
  width: fit-content;
  padding: 0.75rem 1rem;
  justify-self: end;
}

.hero-pebble span {
  color: var(--text-secondary);
  font-size: 0.76rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-pebble strong {
  max-width: 22ch;
  font-family: var(--font-display);
  font-size: 1.18rem;
  line-height: 1.22;
}

@media (max-width: 1180px) {
  .hero {
    grid-template-columns: minmax(0, 1fr) minmax(240px, 360px);
  }
}

@media (max-width: 900px) {
  .hero {
    grid-template-columns: 1fr;
  }

  .hero-pebble--small {
    justify-self: start;
  }
}

@media (max-width: 560px) {
  .hero-actions :deep(.el-button) {
    width: 100%;
  }
}
</style>
