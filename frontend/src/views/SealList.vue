<template>
  <div class="seal-list">
    <div class="page-header">
      <h2>我的藏书印</h2>
      <span class="count">共 {{ sealStore.seals.length }} 枚</span>
    </div>

    <el-skeleton :loading="sealStore.loading" animated :count="3">
      <template #template>
        <el-row :gutter="20">
          <el-col v-for="n in 3" :key="n" :xs="24" :sm="12" :md="8">
            <el-skeleton-item variant="image" style="height: 200px; margin-bottom: 12px" />
            <el-skeleton-item variant="h3" style="width: 60%" />
            <el-skeleton-item variant="text" style="margin-top: 8px" />
          </el-col>
        </el-row>
      </template>

      <template #default>
        <el-empty v-if="sealStore.seals.length === 0" description="暂无藏书印" />

        <el-row v-else :gutter="20">
          <el-col
            v-for="seal in sealStore.seals"
            :key="seal.id"
            :xs="24"
            :sm="12"
            :md="8"
            class="card-col"
          >
            <el-card shadow="hover" class="seal-card" @click="goDetail(seal.id)">
              <div class="card-image">
                <el-image
                  v-if="seal.image_url"
                  :src="seal.image_url"
                  fit="cover"
                  class="seal-image"
                >
                  <template #error>
                    <div class="image-placeholder">印</div>
                  </template>
                </el-image>
                <div v-else class="image-placeholder">印</div>
              </div>
              <div class="card-body">
                <h3 class="inscription">{{ seal.inscription }}</h3>
                <p class="meta">
                  <el-tag size="small" type="info">{{ seal.material }}</el-tag>
                  <span class="size">{{ seal.size }}</span>
                </p>
                <p class="purpose">{{ seal.purpose }}</p>
                <p class="date">刻制：{{ seal.carved_date }}</p>
              </div>
              <div class="card-actions" @click.stop>
                <el-button size="small" @click="goDetail(seal.id)">详情</el-button>
                <el-button size="small" type="primary" @click="goEdit(seal.id)">编辑</el-button>
                <el-button size="small" type="danger" @click="handleDelete(seal)">删除</el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </template>
    </el-skeleton>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useSealStore } from '../stores/seals';

const router = useRouter();
const sealStore = useSealStore();

onMounted(() => {
  sealStore.loadSeals();
});

/**
 * 跳转详情页
 * @param {number} id
 */
function goDetail(id) {
  router.push(`/seals/${id}`);
}

/**
 * 跳转编辑页
 * @param {number} id
 */
function goEdit(id) {
  router.push(`/seals/${id}/edit`);
}

/**
 * 删除印章
 * @param {object} seal
 */
async function handleDelete(seal) {
  try {
    await ElMessageBox.confirm(
      `确定删除「${seal.inscription}」吗？此操作不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' }
    );
    await sealStore.removeSeal(seal.id);
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

.card-col {
  margin-bottom: 20px;
}

.seal-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.seal-card:hover {
  transform: translateY(-2px);
}

.card-image {
  height: 180px;
  overflow: hidden;
  border-radius: 4px;
  margin-bottom: 12px;
  background: #f0f2f5;
}

.seal-image {
  width: 100%;
  height: 100%;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: bold;
  color: #c45656;
  background: linear-gradient(135deg, #fef0f0 0%, #fde2e2 100%);
}

.inscription {
  font-size: 20px;
  color: #303133;
  margin-bottom: 8px;
}

.meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.size {
  font-size: 13px;
  color: #909399;
}

.purpose {
  font-size: 14px;
  color: #606266;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.date {
  font-size: 13px;
  color: #909399;
}

.card-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}
</style>
