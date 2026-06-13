<template>
  <div class="material-detail" v-loading="pageLoading">
    <div class="page-header">
      <el-button :icon="ArrowLeft" @click="goBack">返回</el-button>
      <h2>印材详情</h2>
    </div>

    <el-card v-if="record" class="detail-card">
      <div class="detail-header">
        <div class="detail-image">
          <img :src="record.image_url" :alt="record.name" />
        </div>
        <div class="detail-info">
          <h1 class="material-name">{{ record.name }}</h1>
          <div class="material-tags">
            <el-tag type="primary" size="large">
              <el-icon><Location /></el-icon>
              {{ record.origin }}
            </el-tag>
            <el-tag type="success" size="large">
              <el-icon><TrendCharts /></el-icon>
              {{ record.hardness.split('，')[0] }}
            </el-tag>
          </div>
          <div class="color-preview">
            <span class="color-label">参考颜色：</span>
            <span class="color-text">{{ record.color }}</span>
          </div>
        </div>
      </div>

      <el-descriptions :column="2" border class="detail-desc">
        <el-descriptions-item label="印材编号" label-align="right">{{ record.id }}</el-descriptions-item>
        <el-descriptions-item label="硬度描述" label-align="right">{{ record.hardness }}</el-descriptions-item>
        <el-descriptions-item label="创建时间" label-align="right">{{ record.created_at }}</el-descriptions-item>
        <el-descriptions-item label="更新时间" label-align="right">{{ record.updated_at }}</el-descriptions-item>
        <el-descriptions-item label="简介文字" :span="2" label-align="right">
          <p class="description-text">{{ record.description }}</p>
        </el-descriptions-item>
      </el-descriptions>

      <div class="action-bar">
        <el-button type="primary" @click="goEdit">编辑</el-button>
        <el-button type="danger" @click="handleDelete">删除</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeft, Location, TrendCharts } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRecordStore } from '../stores/records';

const props = defineProps({
  id: {
    type: Number,
    required: true
  }
});

const router = useRouter();
const recordStore = useRecordStore();

const pageLoading = ref(false);
const record = ref(null);

onMounted(async () => {
  pageLoading.value = true;
  try {
    record.value = await recordStore.getRecord(props.id);
  } catch {
    ElMessage.error('加载失败，印材可能不存在');
    router.push('/');
  } finally {
    pageLoading.value = false;
  }
});

function goBack() {
  router.push('/');
}

function goEdit() {
  router.push(`/records/${props.id}/edit`);
}

async function handleDelete() {
  try {
    await ElMessageBox.confirm(
      `确定删除「${record.value.name}」吗？`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' }
    );
    await recordStore.removeRecord(props.id);
    ElMessage.success('删除成功');
    router.push('/');
  } catch {
    /* 用户取消 */
  }
}
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 20px;
  color: #303133;
}

.detail-card {
  padding: 8px;
}

.detail-header {
  display: flex;
  gap: 32px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.detail-image {
  width: 320px;
  height: 320px;
  border-radius: 12px;
  overflow: hidden;
  background: #f5f7fa;
  flex-shrink: 0;
}

.detail-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-info {
  flex: 1;
  min-width: 280px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.material-name {
  font-size: 32px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 20px 0;
}

.material-tags {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.material-tags .el-tag {
  display: flex;
  align-items: center;
  gap: 4px;
}

.color-preview {
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-label {
  font-weight: 600;
  color: #606266;
}

.color-text {
  color: #303133;
}

.detail-desc {
  margin-top: 24px;
}

.description-text {
  line-height: 1.8;
  color: #303133;
  margin: 0;
  white-space: pre-wrap;
}

.action-bar {
  margin-top: 24px;
  display: flex;
  gap: 12px;
}
</style>
