<template>
  <div class="material-list">
    <div class="page-header">
      <h2>印材图鉴</h2>
      <span class="count">共 {{ recordStore.records.length }} 种印材</span>
    </div>

    <div v-loading="recordStore.loading" class="card-grid">
      <el-card
        v-for="item in recordStore.records"
        :key="item.id"
        class="material-card"
        shadow="hover"
        @click="goDetail(item.id)"
      >
        <div class="card-image">
          <img :src="item.image_url" :alt="item.name" />
        </div>
        <div class="card-content">
          <h3 class="card-title">{{ item.name }}</h3>
          <div class="card-info">
            <span class="info-item">
              <el-icon><Location /></el-icon>
              {{ item.origin }}
            </span>
            <span class="info-item">
              <el-icon><TrendCharts /></el-icon>
              {{ item.hardness.split('，')[0] }}
            </span>
          </div>
          <p class="card-desc">{{ item.description.slice(0, 60) }}...</p>
          <div class="card-actions" @click.stop>
            <el-button size="small" type="primary" @click="goDetail(item.id)">查看详情</el-button>
            <el-button size="small" @click="goEdit(item.id)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(item)">删除</el-button>
          </div>
        </div>
      </el-card>

      <el-empty v-if="!recordStore.loading && recordStore.records.length === 0" description="暂无印材" />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Location, TrendCharts } from '@element-plus/icons-vue';
import { useRecordStore } from '../stores/records';

const router = useRouter();
const recordStore = useRecordStore();

onMounted(() => {
  recordStore.loadRecords();
});

function goDetail(id) {
  router.push(`/records/${id}`);
}

function goEdit(id) {
  router.push(`/records/${id}/edit`);
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(
      `确定删除「${row.name}」吗？此操作不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' }
    );
    await recordStore.removeRecord(row.id);
    ElMessage.success('删除成功');
  } catch {
    /* 用户取消 */
  }
}
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 22px;
  color: #303133;
}

.count {
  color: #909399;
  font-size: 14px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.material-card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
}

.material-card:hover {
  transform: translateY(-4px);
}

.card-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 12px;
  background: #f5f7fa;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
}

.card-info {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #606266;
}

.info-item .el-icon {
  color: #409eff;
}

.card-desc {
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
  margin: 0 0 16px 0;
  flex: 1;
}

.card-actions {
  display: flex;
  gap: 8px;
}
</style>
