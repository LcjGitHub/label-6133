<template>
  <div class="note-list">
    <div class="page-header">
      <h2>鉴赏笔记</h2>
      <span class="count">共 {{ noteStore.notes.length }} 条笔记</span>
    </div>

    <div v-loading="noteStore.loading" class="note-list-container">
      <el-table
        :data="noteStore.notes"
        style="width: 100%"
        :empty-text="'暂无笔记数据'"
      >
        <el-table-column prop="title" label="笔记标题" min-width="240">
          <template #default="{ row }">
            <span class="title-link" @click="goDetail(row.id)">{{ row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stamp_inscription" label="关联印章" width="140">
          <template #default="{ row }">
            <span class="stamp-inscription">{{ row.stamp_inscription }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stamp_material" label="材质" width="100" />
        <el-table-column prop="write_date" label="撰写日期" width="120" />
        <el-table-column prop="mood_tag" label="心情标签" width="100">
          <template #default="{ row }">
            <el-tag :type="getMoodTagType(row.mood_tag)" size="small">
              {{ row.mood_tag }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="goEdit(row.id)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!noteStore.loading && noteStore.notes.length === 0" description="暂无笔记">
        <template #description>
          <p>暂无鉴赏笔记</p>
          <el-button type="primary" @click="goCreate" style="margin-top: 12px;">新建笔记</el-button>
        </template>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useNoteStore } from '../stores/notes';

const router = useRouter();
const noteStore = useNoteStore();

onMounted(() => {
  noteStore.loadNotes();
});

function getMoodTagType(tag) {
  const typeMap = {
    '精赏': 'success',
    '常用': 'primary',
    '闲置': 'info'
  };
  return typeMap[tag] || 'info';
}

function goCreate() {
  router.push('/notes/new');
}

function goDetail(id) {
  router.push(`/notes/${id}`);
}

function goEdit(id) {
  router.push(`/notes/${id}/edit`);
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(
      `确定删除「${row.title}」吗？此操作不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' }
    );
    await noteStore.removeNote(row.id);
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

.note-list-container {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.title-link {
  color: #409eff;
  cursor: pointer;
  font-weight: 500;
}

.title-link:hover {
  color: #66b1ff;
  text-decoration: underline;
}

.stamp-inscription {
  font-family: 'STKaiti', 'KaiTi', serif;
  font-weight: 600;
  color: #303133;
}
</style>
