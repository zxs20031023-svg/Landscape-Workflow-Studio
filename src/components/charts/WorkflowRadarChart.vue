<template>
  <div class="chart-card surface-card">
    <div class="chart-card__head">
      <div>
        <span class="section-caption">Workflow Status</span>
        <h3 class="section-title">工作流成熟度</h3>
      </div>
      <div class="chart-card__meta">
        <span>综合成熟度</span>
        <strong>{{ maturityScore }}</strong>
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
import { RadarChart } from 'echarts/charts';
import { RadarComponent, TooltipComponent } from 'echarts/components';

use([CanvasRenderer, RadarChart, RadarComponent, TooltipComponent]);

const props = defineProps<{
  knowledgeReady: boolean;
  hasBrief: boolean;
  hasSiteAnalysis: boolean;
  historyCount: number;
}>();

const radarValues = computed(() => [
  props.knowledgeReady ? 100 : 24,
  props.hasBrief ? 88 : 20,
  props.hasSiteAnalysis ? 92 : 20,
  Math.min(100, props.historyCount * 16 + 20),
  props.hasSiteAnalysis ? 86 : 32
]);

const maturityScore = computed(() =>
  Math.round(radarValues.value.reduce((sum, value) => sum + value, 0) / radarValues.value.length)
);

const option = computed(() => ({
  tooltip: {},
  radar: {
    radius: '62%',
    splitNumber: 4,
    axisName: {
      color: '#49594a',
      fontWeight: 700
    },
    splitArea: {
      areaStyle: {
        color: [
          'rgba(72, 110, 89, 0.05)',
          'rgba(72, 110, 89, 0.035)',
          'rgba(72, 110, 89, 0.02)',
          'rgba(72, 110, 89, 0.01)'
        ]
      }
    },
    splitLine: {
      lineStyle: {
        color: 'rgba(72, 110, 89, 0.16)'
      }
    },
    axisLine: {
      lineStyle: {
        color: 'rgba(72, 110, 89, 0.16)'
      }
    },
    indicator: [
      { name: '知识库', max: 100 },
      { name: '任务书', max: 100 },
      { name: '场地分析', max: 100 },
      { name: '历史资产', max: 100 },
      { name: '案例推荐', max: 100 }
    ]
  },
  series: [
    {
      type: 'radar',
      data: [
        {
          value: radarValues.value,
          symbol: 'circle',
          symbolSize: 8,
          areaStyle: {
            color: 'rgba(69, 109, 86, 0.28)'
          },
          lineStyle: {
            color: '#456d56',
            width: 2
          },
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
  min-width: 104px;
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
