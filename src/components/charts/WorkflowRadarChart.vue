<template>
  <div class="chart-card surface-card">
    <h3 class="section-title">工作流成熟度</h3>
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

const option = computed(() => ({
  tooltip: {},
  radar: {
    radius: '62%',
    splitNumber: 4,
    axisName: {
      color: '#49594a'
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
          value: [
            props.knowledgeReady ? 100 : 24,
            props.hasBrief ? 88 : 20,
            props.hasSiteAnalysis ? 92 : 20,
            Math.min(100, props.historyCount * 16 + 20),
            props.hasSiteAnalysis ? 86 : 32
          ],
          areaStyle: {
            color: 'rgba(69, 109, 86, 0.28)'
          },
          lineStyle: {
            color: '#456d56'
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
  padding: 1rem;
}

.chart {
  height: 300px;
}
</style>
