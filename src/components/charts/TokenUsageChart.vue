<template>
  <div class="chart-card surface-card">
    <div class="chart-card__head">
      <div>
        <span class="section-caption">Usage Mix</span>
        <h3 class="section-title">Token 构成</h3>
      </div>
      <div class="chart-card__meta">
        <span>总量</span>
        <strong>{{ totalTokens }}</strong>
      </div>
    </div>
    <VChart :option="option" autoresize theme="light" class="chart" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart } from 'echarts/charts';
import { LegendComponent, TooltipComponent } from 'echarts/components';

use([CanvasRenderer, PieChart, TooltipComponent, LegendComponent]);

const props = defineProps<{
  promptTokens: number;
  completionTokens: number;
}>();

const totalTokens = computed(() => props.promptTokens + props.completionTokens);

const option = computed(() => ({
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(28, 42, 35, 0.92)',
    borderWidth: 0,
    textStyle: {
      color: '#f7f4ee'
    }
  },
  legend: {
    bottom: 4,
    icon: 'circle',
    textStyle: {
      color: '#5b695f'
    }
  },
  series: [
    {
      type: 'pie',
      radius: ['54%', '76%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 16,
        borderColor: '#f8f4ec',
        borderWidth: 4
      },
      label: {
        show: true,
        color: '#2e4b3a',
        fontWeight: 700,
        formatter: '{b}\n{d}%'
      },
      labelLine: {
        lineStyle: {
          color: 'rgba(72, 110, 89, 0.4)'
        }
      },
      data: [
        {
          value: props.promptTokens,
          name: '提示词',
          itemStyle: {
            color: '#456d56'
          }
        },
        {
          value: props.completionTokens,
          name: '生成',
          itemStyle: {
            color: '#c5663d'
          }
        }
      ]
    }
  ]
}));
</script>

<style scoped lang="scss">
.chart-card {
  padding: 1.05rem 1.1rem;
  min-width: 0;
}

.chart-card__head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 0.4rem;
}

.chart-card__meta {
  display: grid;
  gap: 0.2rem;
  min-width: 84px;
  padding: 0.7rem 0.85rem;
  border-radius: 16px;
  border: 1px solid rgba(72, 110, 89, 0.08);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.84), rgba(249, 245, 238, 0.84));
}

.chart-card__meta span {
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.chart-card__meta strong {
  font-size: 1.25rem;
  line-height: 1;
}

.chart {
  height: 300px;
}

@media (max-width: 720px) {
  .chart-card__head {
    flex-direction: column;
  }
}
</style>
