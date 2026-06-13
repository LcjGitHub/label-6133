<template>
  <div class="statistics-page">
    <div class="page-header">
      <h2>印章统计看板</h2>
    </div>

    <div v-loading="stampStore.statisticsLoading" class="stats-content">
      <el-empty
        v-if="!stampStore.statisticsLoading && loadError"
        description="数据加载失败"
        :image-size="120"
      >
        <template #description>
          <p>统计数据加载失败，请检查网络连接后重试</p>
          <el-button type="primary" @click="loadData" style="margin-top: 12px;">
            <el-icon><Refresh /></el-icon>
            重新加载
          </el-button>
        </template>
      </el-empty>

      <el-empty
        v-else-if="!stampStore.statisticsLoading && !hasData"
        description="暂无印章数据"
        :image-size="120"
      >
        <template #description>
          <p>暂无印章数据，请先添加印章记录</p>
        </template>
      </el-empty>

      <template v-else>
        <el-row :gutter="20" class="summary-cards">
          <el-col :xs="24" :sm="8">
            <el-card shadow="hover" class="summary-card total-card">
              <div class="card-icon">
                <el-icon :size="40"><Collection /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-label">印章总数</div>
                <div class="card-value">{{ stampStore.statistics?.total || 0 }}</div>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="8">
            <el-card shadow="hover" class="summary-card material-card">
              <div class="card-icon">
                <el-icon :size="40"><Box /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-label">材质种类</div>
                <div class="card-value">{{ stampStore.statistics?.byMaterial?.length || 0 }}</div>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="8">
            <el-card shadow="hover" class="summary-card year-card">
              <div class="card-icon">
                <el-icon :size="40"><Calendar /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-label">年份数量</div>
                <div class="card-value">{{ stampStore.statistics?.byYear?.length || 0 }}</div>
                <div class="card-subtitle">
                  <span v-if="latestYear">最新：{{ latestYear }}年 {{ latestYearCount }} 方</span>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" class="charts-row">
          <el-col :xs="24" :lg="12">
            <el-card shadow="hover" class="chart-card">
              <template #header>
                <div class="card-header">
                  <span>按材质分布</span>
                  <el-tag size="small" type="info">饼图</el-tag>
                </div>
              </template>
              <div class="chart-container">
                <el-empty
                  v-if="!hasMaterialData"
                  description="暂无材质数据"
                  :image-size="60"
                />
                <v-chart
                  v-else
                  class="chart"
                  :option="materialChartOption"
                  autoresize
                />
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :lg="12">
            <el-card shadow="hover" class="chart-card">
              <template #header>
                <div class="card-header">
                  <span>按刻制年份分布</span>
                  <el-tag size="small" type="info">柱状图</el-tag>
                </div>
              </template>
              <div class="chart-container">
                <el-empty
                  v-if="!hasYearData"
                  description="暂无年份数据"
                  :image-size="60"
                />
                <v-chart
                  v-else
                  class="chart"
                  :option="yearChartOption"
                  autoresize
                />
              </div>
            </el-card>
          </el-col>
        </el-row>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart, BarChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components';
import VChart from 'vue-echarts';
import { ElMessage } from 'element-plus';
import { Collection, Box, Calendar, Refresh } from '@element-plus/icons-vue';
import { useStampStore } from '../stores/stamps';

use([
  CanvasRenderer,
  PieChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
]);

const stampStore = useStampStore();
const loadError = ref(false);

const colorPalette = [
  '#409eff',
  '#67c23a',
  '#e6a23c',
  '#f56c6c',
  '#909399',
  '#8e44ad',
  '#16a085',
  '#d35400'
];

const hasData = computed(() => {
  const stats = stampStore.statistics;
  return stats && (stats.total > 0 || stats.byMaterial?.length > 0 || stats.byYear?.length > 0);
});

const hasMaterialData = computed(() => {
  return stampStore.statistics?.byMaterial?.length > 0;
});

const hasYearData = computed(() => {
  return stampStore.statistics?.byYear?.length > 0;
});

const latestYear = computed(() => {
  const data = stampStore.statistics?.byYear || [];
  if (data.length === 0) return null;
  return data[data.length - 1].name;
});

const latestYearCount = computed(() => {
  const data = stampStore.statistics?.byYear || [];
  if (data.length === 0) return 0;
  return data[data.length - 1].value;
});

const materialChartOption = computed(() => {
  const data = stampStore.statistics?.byMaterial || [];
  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} 方 ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'center',
      textStyle: {
        fontSize: 12
      }
    },
    series: [
      {
        name: '材质分布',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['65%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}\n{d}%',
          fontSize: 12
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        data: data.map((item, index) => ({
          value: item.value,
          name: item.name,
          itemStyle: {
            color: colorPalette[index % colorPalette.length]
          }
        }))
      }
    ]
  };
});

const yearChartOption = computed(() => {
  const data = stampStore.statistics?.byYear || [];
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: '{b}年: {c} 方'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map((item) => item.name),
      axisLabel: {
        formatter: '{value}年',
        fontSize: 12
      },
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: {
      type: 'value',
      name: '数量(方)',
      minInterval: 1,
      nameTextStyle: {
        fontSize: 12
      }
    },
    series: [
      {
        name: '刻制数量',
        type: 'bar',
        barWidth: '50%',
        data: data.map((item, index) => ({
          value: item.value,
          itemStyle: {
            color: colorPalette[index % colorPalette.length],
            borderRadius: [6, 6, 0, 0]
          }
        }))
      }
    ]
  };
});

async function loadData() {
  try {
    loadError.value = false;
    await stampStore.loadStatistics();
  } catch (err) {
    loadError.value = true;
    ElMessage.error('统计数据加载失败，请稍后重试');
    console.error('Failed to load statistics:', err);
  }
}

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 22px;
  color: #303133;
  margin: 0;
}

.summary-cards {
  margin-bottom: 24px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px;
}

.card-icon {
  width: 72px;
  height: 72px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.total-card .card-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.material-card .card-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
}

.year-card .card-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: #fff;
}

.card-info {
  flex: 1;
}

.card-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.card-value {
  font-size: 32px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.card-subtitle {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.charts-row {
  margin-bottom: 24px;
}

.chart-card {
  margin-bottom: 20px;
}

.card-header {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  width: 100%;
  height: 400px;
}

.chart {
  width: 100%;
  height: 100%;
}
</style>
