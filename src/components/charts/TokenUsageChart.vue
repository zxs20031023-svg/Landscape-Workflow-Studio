<template>
  <div class="chart-card surface-card">
    <h3 class="section-title">Token 构成</h3>
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

const option = computed(() => ({
  tooltip: {
    trigger: 'item'
  },
  legend: {
    bottom: 0
  },
  series: [
    {
      type: 'pie',
      radius: ['52%', '74%'],
      avoidLabelOverlap: false,
      label: {
        show: true,
        formatter: '{b}\n{d}%'
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
  padding: 1rem;
}

.chart {
  height: 300px;
}
</style>
