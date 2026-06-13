<template>
  <div class="stamp-list">
    <div class="page-header">
      <h2>藏书印列表</h2>
      <span class="count">共 {{ stampStore.stamps.length }} 方印章</span>
    </div>

    <div v-loading="stampStore.loading" class="card-grid">
      <el-card
        v-for="item in stampStore.stamps"
        :key="item.id"
        class="stamp-card"
        shadow="hover"
      >
        <div class="card-header">
          <h3 class="card-inscription">{{ item.inscription }}</h3>
          <el-tag class="material-tag" type="primary">{{ item.material }}</el-tag>
        </div>
        <div class="card-info">
          <div class="info-row">
            <span class="info-label">
              <el-icon><Brush /></el-icon>
              印文
            </span>
            <span class="info-value">{{ item.inscription }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">
              <el-icon><Box /></el-icon>
              材质
            </span>
            <span class="info-value">{{ item.material }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">
              <el-icon><Calendar /></el-icon>
              刻制日期
            </span>
            <span class="info-value">{{ item.carve_date }}</span>
          </div>
        </div>
        <div class="card-actions">
          <el-button size="small" type="primary" @click="goEdit(item.id)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(item)">删除</el-button>
        </div>
      </el-card>

      <el-empty v-if="!stampStore.loading && stampStore.stamps.length === 0" description="暂无印章">
        <template #description>
          <p>暂无印章数据</p>
          <el-button type="primary" @click="goCreate" style="margin-top: 12px;">新增印章</el-button>
        </template>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Brush, Box, Calendar } from '@element-plus/icons-vue';
import { useStampStore } from '../stores/stamps';

const router = useRouter();
const stampStore = useStampStore();

onMounted(() => {
  stampStore.loadStamps();
});

function goCreate() {
  router.push('/stamps/new');
}

function goEdit(id) {
  router.push(`/stamps/${id}/edit`);
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(
      `确定删除「${row.inscription}」吗？此操作不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' }
    );
    await stampStore.removeStamp(row.id);
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
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.stamp-card {
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stamp-card:hover {
  transform: translateY(-4px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.card-inscription {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  font-family: 'STKaiti', 'KaiTi', serif;
}

.material-tag {
  font-size: 12px;
}

.card-info {
  flex: 1;
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 10px;
}

.info-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #909399;
  width: 80px;
  flex-shrink: 0;
}

.info-label .el-icon {
  color: #409eff;
  flex-shrink: 0;
}

.info-value {
  flex: 1;
  font-size: 13px;
  color: #303133;
  line-height: 1.5;
}

.card-actions {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}
</style>
