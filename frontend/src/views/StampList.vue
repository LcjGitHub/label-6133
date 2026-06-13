<template>
  <div class="stamp-list">
    <div class="page-header">
      <h2>藏书印列表</h2>
      <span class="count">共 {{ recordStore.stamps.length }} 方印章</span>
    </div>

    <div v-loading="recordStore.stampsLoading" class="table-wrapper">
      <el-table :data="recordStore.stamps" stripe style="width: 100%" empty-text="暂无印章数据">
        <el-table-column prop="id" label="编号" width="80" />
        <el-table-column prop="inscription" label="印文" min-width="140">
          <template #default="{ row }">
            <span class="inscription-text">{{ row.inscription }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="material" label="材质" width="120">
          <template #default="{ row }">
            <el-tag :type="getMaterialTagType(row.material)" effect="light">
              {{ row.material }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="carve_date" label="刻制日期" width="140" />
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="goDetail(row.id)">查看</el-button>
            <el-button size="small" @click="goEdit(row.id)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty
        v-if="!recordStore.stampsLoading && recordStore.stamps.length === 0"
        description="暂无印章数据，点击右上角「新增印章」开始添加"
      />
    </div>
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
  recordStore.loadStamps();
});

const materialColorMap = {
  寿山石: 'danger',
  青田石: 'success',
  昌化石: 'warning',
  巴林石: 'info',
  和田玉: 'primary'
};

function getMaterialTagType(material) {
  return materialColorMap[material] || '';
}

function goDetail(id) {
  router.push(`/stamps/${id}`);
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
    await recordStore.removeStamp(row.id);
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
  margin: 0;
}

.count {
  color: #909399;
  font-size: 14px;
}

.table-wrapper {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.inscription-text {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  letter-spacing: 2px;
}
</style>
