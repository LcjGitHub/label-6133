<template>
  <div class="note-form">
    <div class="page-header">
      <el-button :icon="ArrowLeft" @click="goBack">返回</el-button>
      <h2>{{ isCreate ? '新建笔记' : '编辑笔记' }}</h2>
    </div>

    <el-card class="form-card" v-loading="formLoading">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        style="max-width: 720px"
      >
        <el-form-item label="关联印章" prop="stamp_id">
          <el-select
            v-model="form.stamp_id"
            placeholder="请选择关联的印章"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="item in stampOptions"
              :key="item.id"
              :label="`${item.inscription}（${item.material}）`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="笔记标题" prop="title">
          <el-input
            v-model="form.title"
            placeholder="请输入笔记标题"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="撰写日期" prop="write_date">
          <el-date-picker
            v-model="form.write_date"
            type="date"
            placeholder="选择撰写日期"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="心情标签" prop="mood_tag">
          <el-radio-group v-model="form.mood_tag">
            <el-radio-button value="精赏">
              <el-icon><Star /></el-icon>
              精赏
            </el-radio-button>
            <el-radio-button value="常用">
              <el-icon><Collection /></el-icon>
              常用
            </el-radio-button>
            <el-radio-button value="闲置">
              <el-icon><Clock /></el-icon>
              闲置
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="鉴赏正文" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="10"
            placeholder="请输入鉴赏正文内容..."
            maxlength="2000"
            show-word-limit
            resize="vertical"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            {{ isCreate ? '创建' : '保存' }}
          </el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeft, Star, Collection, Clock } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useNoteStore } from '../stores/notes';
import { useStampStore } from '../stores/stamps';

const props = defineProps({
  mode: {
    type: String,
    default: 'create'
  },
  id: {
    type: Number,
    default: null
  }
});

const router = useRouter();
const noteStore = useNoteStore();
const stampStore = useStampStore();

const submitting = ref(false);
const formLoading = ref(false);
const formRef = ref(null);
const stampOptions = ref([]);

const form = ref({
  stamp_id: null,
  title: '',
  content: '',
  write_date: '',
  mood_tag: '精赏'
});

const rules = {
  stamp_id: [{ required: true, message: '请选择关联印章', trigger: 'change' }],
  title: [{ required: true, message: '请输入笔记标题', trigger: 'blur' }],
  write_date: [{ required: true, message: '请选择撰写日期', trigger: 'change' }],
  mood_tag: [{ required: true, message: '请选择心情标签', trigger: 'change' }],
  content: [{ required: true, message: '请输入鉴赏正文', trigger: 'blur' }]
};

const isCreate = computed(() => props.mode === 'create');

onMounted(async () => {
  await loadStamps();
  if (props.mode === 'create') return;

  formLoading.value = true;
  try {
    const data = await noteStore.getNote(props.id);
    form.value = {
      stamp_id: data.stamp_id,
      title: data.title,
      content: data.content,
      write_date: data.write_date,
      mood_tag: data.mood_tag
    };
  } catch {
    ElMessage.error('加载失败，笔记可能不存在');
    router.push('/notes');
  } finally {
    formLoading.value = false;
  }
});

async function loadStamps() {
  try {
    await stampStore.loadStamps();
    stampOptions.value = stampStore.stamps;
  } catch {
    ElMessage.error('加载印章列表失败');
  }
}

function goBack() {
  router.push('/notes');
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  submitting.value = true;
  try {
    if (isCreate.value) {
      await noteStore.addNote(form.value);
      ElMessage.success('创建成功');
    } else {
      await noteStore.editNote(props.id, form.value);
      ElMessage.success('保存成功');
    }
    router.push('/notes');
  } catch (err) {
    const msg = err.response?.data?.message || '操作失败';
    ElMessage.error(msg);
  } finally {
    submitting.value = false;
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

.form-card {
  padding: 8px;
}

:deep(.el-radio-button__inner) {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
