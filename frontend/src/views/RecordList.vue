<template>
  <div class="record-list">
    <div class="page-header">
      <h2>钤印日志</h2>
      <span class="count">共 {{ recordStore.records.length }} 条记录</span>
    </div>

    <el-table
      v-loading="recordStore.loading"
      :data="recordStore.records"
      stripe
      style="width: 100%"
      empty-text="暂无钤印记录"
    >
      <el-table-column prop="id" label="编号" width="70" align="center" />
      <el-table-column prop="seal_id" label="印章编号" width="120">
        <template #default="{ row }">
          <el-tag size="small" type="primary">{{ row.seal_id }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="book_title" label="书名" min-width="160" />
      <el-table-column prop="author" label="作者" width="140" />
      <el-table-column prop="page_number" label="页码" width="90" align="center" />
      <el-table-column prop="stamp_date" label="钤印日期" width="130" align="center" />
      <el-table-column prop="remark" label="备注" min-width="180" show-overflow-tooltip />
      <el-table-column label="操作" width="220" fixed="right" align="center">
        <template #default="{ row }">
          <el-button size="small" @click="goDetail(row.id)">详情</el-button>
          <el-button size="small" type="primary" @click="goEdit(row.id)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
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
      `确定删除《${row.book_title}》的钤印记录吗？此操作不可恢复。`,
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
  margin-bottom: 20px;
}

.page-header h2 {
  font-size: 22px;
  color: #303133;
}

.count {
  color: #909399;
  font-size: 14px;
}
</style>
