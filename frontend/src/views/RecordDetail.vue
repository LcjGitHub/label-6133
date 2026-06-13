<template>
  <div class="record-detail" v-loading="pageLoading">
    <div class="page-header">
      <el-button :icon="ArrowLeft" @click="goBack">返回</el-button>
      <h2>钤印记录详情</h2>
    </div>

    <el-card v-if="record" class="detail-card">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="记录编号">{{ record.id }}</el-descriptions-item>
        <el-descriptions-item label="印章编号">
          <el-tag type="primary">{{ record.seal_id }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="书名" :span="2">
          <span class="book-title">{{ record.book_title }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="作者">{{ record.author }}</el-descriptions-item>
        <el-descriptions-item label="钤印页码">第 {{ record.page_number }} 页</el-descriptions-item>
        <el-descriptions-item label="钤印日期">{{ record.stamp_date }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ record.created_at }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ record.updated_at }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">
          <span v-if="record.remark">{{ record.remark }}</span>
          <span v-else class="empty-text">无</span>
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
const record = ref(null);

onMounted(async () => {
  pageLoading.value = true;
  try {
    record.value = await recordStore.getRecord(props.id);
  } catch {
    ElMessage.error('加载失败，记录可能不存在');
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
      `确定删除《${record.value.book_title}》的钤印记录吗？`,
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

.book-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.action-bar {
  margin-top: 24px;
  display: flex;
  gap: 12px;
}

.empty-text {
  color: #c0c4cc;
}
</style>
