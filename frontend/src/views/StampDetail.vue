<template>
  <div class="stamp-detail" v-loading="pageLoading">
    <div class="page-header">
      <el-button :icon="ArrowLeft" @click="goBack">返回</el-button>
      <h2>印章详情</h2>
    </div>

    <el-card v-if="stamp" class="detail-card">
      <div class="detail-header">
        <div class="stamp-inscription-block">
          <div class="inscription-display">
            <span class="inscription-label">印文</span>
            <span class="inscription-main">{{ stamp.inscription }}</span>
          </div>
        </div>
        <div class="detail-info">
          <div class="info-row">
            <span class="info-label">材质</span>
            <el-tag :type="getMaterialTagType(stamp.material)" size="large" effect="light">
              {{ stamp.material }}
            </el-tag>
          </div>
          <div class="info-row">
            <span class="info-label">刻制日期</span>
            <span class="info-value">{{ stamp.carve_date }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">刻制年份</span>
            <span class="info-value">{{ getYear(stamp.carve_date) }}年</span>
          </div>
        </div>
      </div>

      <el-descriptions :column="2" border class="detail-desc">
        <el-descriptions-item label="印章编号" label-align="right">{{ stamp.id }}</el-descriptions-item>
        <el-descriptions-item label="刻制日期" label-align="right">{{ stamp.carve_date }}</el-descriptions-item>
        <el-descriptions-item label="创建时间" label-align="right">{{ stamp.created_at }}</el-descriptions-item>
        <el-descriptions-item label="更新时间" label-align="right">{{ stamp.updated_at }}</el-descriptions-item>
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
import { ArrowLeft } from '@element-plus/icons-vue';
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
const stamp = ref(null);

const materialColorMap = {
  寿山石: 'danger',
  青田石: 'success',
  昌化石: 'warning',
  巴林石: 'info',
  和田玉: 'primary'
};

onMounted(async () => {
  pageLoading.value = true;
  try {
    stamp.value = await recordStore.getStamp(props.id);
  } catch {
    ElMessage.error('加载失败，印章可能不存在');
    router.push('/');
  } finally {
    pageLoading.value = false;
  }
});

function getMaterialTagType(material) {
  return materialColorMap[material] || '';
}

function getYear(dateStr) {
  if (!dateStr) return '';
  return dateStr.substring(0, 4);
}

function goBack() {
  router.push('/');
}

function goEdit() {
  router.push(`/stamps/${props.id}/edit`);
}

async function handleDelete() {
  try {
    await ElMessageBox.confirm(
      `确定删除「${stamp.value.inscription}」吗？此操作不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' }
    );
    await recordStore.removeStamp(props.id);
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
  margin: 0;
}

.detail-card {
  padding: 8px;
}

.detail-header {
  display: flex;
  gap: 40px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  align-items: flex-start;
}

.stamp-inscription-block {
  flex-shrink: 0;
}

.inscription-display {
  background: linear-gradient(135deg, #c0392b 0%, #922b21 100%);
  color: #fff;
  padding: 48px 56px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 220px;
  box-shadow: 0 4px 12px rgba(192, 57, 43, 0.25);
}

.inscription-label {
  font-size: 13px;
  opacity: 0.8;
  margin-bottom: 12px;
}

.inscription-main {
  font-size: 44px;
  font-weight: 700;
  letter-spacing: 8px;
  writing-mode: vertical-rl;
  line-height: 1.2;
}

.detail-info {
  flex: 1;
  min-width: 280px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  justify-content: center;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
}

.info-label {
  font-weight: 600;
  color: #909399;
  min-width: 80px;
}

.info-value {
  color: #303133;
}

.detail-desc {
  margin-top: 24px;
}

.action-bar {
  margin-top: 24px;
  display: flex;
  gap: 12px;
}
</style>
