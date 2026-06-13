<template>
  <div class="record-form">
    <div class="page-header">
      <el-button :icon="ArrowLeft" @click="goBack">返回</el-button>
      <h2>{{ isCreate ? '新增钤印记录' : '编辑钤印记录' }}</h2>
    </div>

    <el-card class="form-card">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        style="max-width: 640px"
      >
        <el-form-item label="印章编号" prop="seal_id">
          <el-input v-model="form.seal_id" placeholder="如：SEAL-001" maxlength="32" />
        </el-form-item>
        <el-form-item label="书名" prop="book_title">
          <el-input v-model="form.book_title" placeholder="请输入书名" maxlength="128" />
        </el-form-item>
        <el-form-item label="作者" prop="author">
          <el-input v-model="form.author" placeholder="请输入作者" maxlength="64" />
        </el-form-item>
        <el-form-item label="钤印页码" prop="page_number">
          <el-input-number
            v-model="form.page_number"
            :min="1"
            :max="9999"
            :step="1"
            :precision="0"
            controls-position="right"
            placeholder="请输入页码"
          />
        </el-form-item>
        <el-form-item label="钤印日期" prop="stamp_date">
          <el-date-picker
            v-model="form.stamp_date"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
            placeholder="简短备注（选填）"
            maxlength="256"
            show-word-limit
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
import { ArrowLeft } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useRecordStore } from '../stores/records';

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
const recordStore = useRecordStore();

const submitting = ref(false);
const formRef = ref(null);

const form = ref({
  seal_id: '',
  book_title: '',
  author: '',
  page_number: 1,
  stamp_date: '',
  remark: ''
});

const rules = {
  seal_id: [{ required: true, message: '请输入印章编号', trigger: 'blur' }],
  book_title: [{ required: true, message: '请输入书名', trigger: 'blur' }],
  author: [{ required: true, message: '请输入作者', trigger: 'blur' }],
  page_number: [
    { required: true, message: '请输入页码', trigger: 'blur' },
    { type: 'number', min: 1, message: '页码必须大于 0', trigger: 'blur' }
  ],
  stamp_date: [{ required: true, message: '请选择钤印日期', trigger: 'change' }]
};

const isCreate = computed(() => props.mode === 'create');

onMounted(async () => {
  if (props.mode === 'create') return;

  try {
    const data = await recordStore.getRecord(props.id);
    form.value = {
      seal_id: data.seal_id,
      book_title: data.book_title,
      author: data.author,
      page_number: data.page_number,
      stamp_date: data.stamp_date,
      remark: data.remark || ''
    };
  } catch {
    ElMessage.error('加载失败，记录可能不存在');
    router.push('/');
  }
});

function goBack() {
  if (isCreate.value) {
    router.push('/');
  } else {
    router.push(`/records/${props.id}`);
  }
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  submitting.value = true;
  try {
    if (isCreate.value) {
      const created = await recordStore.addRecord(form.value);
      ElMessage.success('创建成功');
      router.push(`/records/${created.id}`);
    } else {
      await recordStore.editRecord(props.id, form.value);
      ElMessage.success('保存成功');
      router.push(`/records/${props.id}`);
    }
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
</style>
