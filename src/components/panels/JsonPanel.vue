<template>
  <section class="surface-card panel">
    <div class="panel-head">
      <div>
        <h3 class="section-title">{{ title }}</h3>
        <p v-if="description" class="muted">{{ description }}</p>
      </div>
      <slot name="actions" />
    </div>
    <pre class="json-block">{{ serialized }}</pre>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  title: string;
  payload: unknown;
  description?: string;
}>();

const serialized = computed(() => JSON.stringify(props.payload, null, 2));
</script>

<style scoped lang="scss">
.panel {
  padding: 1rem;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 0.8rem;
}

.panel-head p {
  margin: 0;
}
</style>
