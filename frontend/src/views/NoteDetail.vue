<template>
  <div class="note-detail" v-loading="pageLoading">
    <div class="page-header">
      <el-button :icon="ArrowLeft" @click="goBack">返回</el-button>
      <h2>笔记详情</h2>
    </div>

    <el-card v-if="note" class="detail-card">
      <div class="stamp-summary">
        <div class="stamp-icon">
          <el-icon :size="36"><Stamp /></el-icon>
        </div>
        <div class="stamp-info">
          <div class="stamp-label">关联印章</div>
          <div class="stamp-inscription">{{ note.stamp_inscription }}</div>
          <div class="stamp-material">
            <el-tag type="primary" size="small">
              <el-icon><Box /></el-icon>
              {{ note.stamp_material }}
            </el-tag>
          </div>
        </div>
      </div>

      <div class="note-header">
        <h1 class="note-title">{{ note.title }}</h1>
        <div class="note-meta">
          <span class="meta-item">
            <el-icon><Calendar /></el-icon>
            {{ note.write_date }}
          </span>
          <el-tag :type="getMoodTagType(note.mood_tag)" size="small">
            {{ note.mood_tag }}
          </el-tag>
        </div>
      </div>

      <div class="note-content">
        <p class="content-text">{{ note.content }}</p>
      </div>

      <el-divider />

      <div class="note-footer">
        <div class="time-info">
          <span>创建时间：{{ note.created_at }}</span>
          <span>更新时间：{{ note.updated_at }}</span>
        </div>
      </div>

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
import { ArrowLeft, Calendar, Box, Stamp } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useNoteStore } from '../stores/notes';

const props = defineProps({
  id: {
    type: Number,
    required: true
  }
});

const router = useRouter();
const noteStore = useNoteStore();

const pageLoading = ref(false);
const note = ref(null);

onMounted(async () => {
  pageLoading.value = true;
  try {
    note.value = await noteStore.getNote(props.id);
  } catch {
    ElMessage.error('加载失败，笔记可能不存在');
    router.push('/notes');
  } finally {
    pageLoading.value = false;
  }
});

function getMoodTagType(tag) {
  const typeMap = {
    '精赏': 'success',
    '常用': 'primary',
    '闲置': 'info'
  };
  return typeMap[tag] || 'info';
}

function goBack() {
  router.push('/notes');
}

function goEdit() {
  router.push(`/notes/${props.id}/edit`);
}

async function handleDelete() {
  try {
    await ElMessageBox.confirm(
      `确定删除「${note.value.title}」吗？`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' }
    );
    await noteStore.removeNote(props.id);
    ElMessage.success('删除成功');
    router.push('/notes');
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

.stamp-summary {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
  border-radius: 8px;
  margin-bottom: 24px;
}

.stamp-icon {
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 8px;
  color: #e6a23c;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stamp-info {
  flex: 1;
}

.stamp-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 6px;
}

.stamp-inscription {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  font-family: 'STKaiti', 'KaiTi', serif;
  margin-bottom: 10px;
}

.stamp-material .el-tag {
  display: flex;
  align-items: center;
  gap: 4px;
}

.note-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #ebeef5;
}

.note-title {
  font-size: 26px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.note-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #606266;
}

.meta-item .el-icon {
  color: #409eff;
}

.note-content {
  min-height: 200px;
  padding: 8px 0;
}

.content-text {
  font-size: 15px;
  line-height: 2;
  color: #303133;
  text-indent: 2em;
  margin: 0;
  white-space: pre-wrap;
}

.note-footer {
  padding-top: 8px;
}

.time-info {
  display: flex;
  gap: 24px;
  font-size: 13px;
  color: #909399;
}

.action-bar {
  margin-top: 24px;
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}
</style>
