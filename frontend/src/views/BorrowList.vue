<template>
  <div class="borrow-list">
    <div class="page-header">
      <h2>印章外借登记</h2>
      <el-button type="primary" @click="goCreate">
        <el-icon><Plus /></el-icon>
        <span>登记外借</span>
      </el-button>
    </div>

    <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="borrow-tabs">
      <el-tab-pane label="借出中" name="borrowed">
        <span class="tab-count">（{{ borrowedCount }}）</span>
      </el-tab-pane>
      <el-tab-pane label="已归还" name="returned">
        <span class="tab-count">（{{ returnedCount }}）</span>
      </el-tab-pane>
      <el-tab-pane label="全部记录" name="all">
        <span class="tab-count">（{{ borrowStore.borrowRecords.length }}）</span>
      </el-tab-pane>
    </el-tabs>

    <el-card v-loading="borrowStore.loading" class="table-card">
      <el-table :data="borrowStore.borrowRecords" stripe style="width: 100%">
        <el-table-column prop="id" label="记录编号" width="100" />
        <el-table-column prop="stamp_id" label="印章编号" width="100" />
        <el-table-column prop="inscription" label="印文" width="160">
          <template #default="{ row }">
            <span class="inscription-text">{{ row.inscription }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="material" label="材质" width="100" />
        <el-table-column prop="borrower_name" label="借用人" width="120" />
        <el-table-column prop="borrow_date" label="借出日期" width="120" />
        <el-table-column prop="expected_return_date" label="预计归还日期" width="140" />
        <el-table-column prop="actual_return_date" label="实际归还日期" width="140">
          <template #default="{ row }">
            <span>{{ row.actual_return_date || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'borrowed' ? 'warning' : 'success'" size="small">
              {{ row.status === 'borrowed' ? '借出中' : '已归还' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'borrowed'"
              type="primary"
              size="small"
              @click="handleReturn(row)"
            >
              归还
            </el-button>
            <el-button size="small" @click="goEdit(row.id)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty
        v-if="!borrowStore.loading && borrowStore.borrowRecords.length === 0"
        description="暂无记录"
        style="margin-top: 40px;"
      >
        <template #description>
          <p>暂无外借记录</p>
          <el-button type="primary" @click="goCreate" style="margin-top: 12px;">
            登记外借
          </el-button>
        </template>
      </el-empty>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { useBorrowRecordStore } from '../stores/borrowRecords';

const router = useRouter();
const borrowStore = useBorrowRecordStore();

const activeTab = ref('borrowed');

const borrowedCount = computed(() =>
  borrowStore.borrowRecords.filter((r) => r.status === 'borrowed').length
);

const returnedCount = computed(() =>
  borrowStore.borrowRecords.filter((r) => r.status === 'returned').length
);

onMounted(() => {
  loadData();
});

async function loadData() {
  await borrowStore.loadBorrowRecords(activeTab.value);
}

function handleTabChange(tabName) {
  borrowStore.loadBorrowRecords(tabName);
}

function goCreate() {
  router.push('/borrow-records/new');
}

function goEdit(id) {
  router.push(`/borrow-records/${id}/edit`);
}

async function handleReturn(row) {
  try {
    await ElMessageBox.confirm(
      `确定「${row.inscription}」已归还吗？`,
      '归还确认',
      { type: 'info', confirmButtonText: '确认归还', cancelButtonText: '取消' }
    );
    await borrowStore.returnRecord(row.id);
    ElMessage.success('归还成功');
    loadData();
  } catch {
    /* 用户取消 */
  }
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(
      `确定删除这条外借记录吗？此操作不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' }
    );
    await borrowStore.removeBorrowRecord(row.id);
    ElMessage.success('删除成功');
  } catch {
    /* 用户取消 */
  }
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  font-size: 22px;
  color: #303133;
  margin: 0;
}

.borrow-tabs {
  margin-bottom: 16px;
}

.tab-count {
  color: #909399;
  font-size: 13px;
}

.table-card {
  padding: 0;
}

.inscription-text {
  font-family: 'STKaiti', 'KaiTi', serif;
  font-weight: 600;
  color: #303133;
}
</style>
