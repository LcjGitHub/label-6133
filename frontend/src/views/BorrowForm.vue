<template>
  <div class="borrow-form">
    <div class="page-header">
      <el-button :icon="ArrowLeft" @click="goBack">返回</el-button>
      <h2>{{ isCreate ? '登记外借' : '编辑外借记录' }}</h2>
    </div>

    <el-card class="form-card" v-loading="formLoading">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        style="max-width: 560px"
      >
        <el-form-item label="印章" prop="stamp_id">
          <el-select
            v-model="form.stamp_id"
            placeholder="请选择印章"
            filterable
            style="width: 100%"
            :disabled="!isCreate"
          >
            <el-option
              v-for="item in availableStamps"
              :key="item.id"
              :label="`${item.inscription}（${item.material}）`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="借用人姓名" prop="borrower_name">
          <el-input
            v-model="form.borrower_name"
            placeholder="请输入借用人姓名"
            maxlength="32"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="借出日期" prop="borrow_date">
          <el-date-picker
            v-model="form.borrow_date"
            type="date"
            placeholder="选择借出日期"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="预计归还日期" prop="expected_return_date">
          <el-date-picker
            v-model="form.expected_return_date"
            type="date"
            placeholder="选择预计归还日期"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item v-if="!isCreate" label="实际归还日期" prop="actual_return_date">
          <el-date-picker
            v-model="form.actual_return_date"
            type="date"
            placeholder="选择实际归还日期（如已归还）"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item v-if="!isCreate" label="外借状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="借出中" value="borrowed" />
            <el-option label="已归还" value="returned" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            {{ isCreate ? '登记' : '保存' }}
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
import { useBorrowRecordStore } from '../stores/borrowRecords';

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
const borrowStore = useBorrowRecordStore();

const submitting = ref(false);
const formLoading = ref(false);
const formRef = ref(null);

const form = ref({
  stamp_id: null,
  borrower_name: '',
  borrow_date: '',
  expected_return_date: '',
  actual_return_date: '',
  status: 'borrowed'
});

const borrowedStampIds = computed(() => {
  const ids = new Set();
  borrowStore.borrowRecords.forEach((r) => {
    if (r.status === 'borrowed' && r.id !== props.id) {
      ids.add(r.stamp_id);
    }
  });
  return ids;
});

const availableStamps = computed(() => {
  if (props.mode === 'edit') {
    return borrowStore.stamps;
  }
  return borrowStore.stamps.filter((s) => !borrowedStampIds.value.has(s.id));
});

const validateReturnDate = (_rule, value, callback) => {
  if (!value) {
    callback(new Error('请选择预计归还日期'));
    return;
  }
  if (form.value.borrow_date && new Date(value) < new Date(form.value.borrow_date)) {
    callback(new Error('预计归还日期不能早于借出日期'));
    return;
  }
  callback();
};

const rules = {
  stamp_id: [{ required: true, message: '请选择印章', trigger: 'change' }],
  borrower_name: [{ required: true, message: '请输入借用人姓名', trigger: 'blur' }],
  borrow_date: [{ required: true, message: '请选择借出日期', trigger: 'change' }],
  expected_return_date: [
    { required: true, validator: validateReturnDate, trigger: 'change' }
  ]
};

const isCreate = computed(() => props.mode === 'create');

onMounted(async () => {
  await Promise.all([borrowStore.loadStamps(), borrowStore.loadBorrowRecords('borrowed')]);

  if (props.mode === 'create') return;

  formLoading.value = true;
  try {
    const data = await borrowStore.getBorrowRecord(props.id);
    form.value = {
      stamp_id: data.stamp_id,
      borrower_name: data.borrower_name,
      borrow_date: data.borrow_date,
      expected_return_date: data.expected_return_date,
      actual_return_date: data.actual_return_date || '',
      status: data.status
    };
  } catch {
    ElMessage.error('加载失败，记录可能不存在');
    router.push('/borrow-records');
  } finally {
    formLoading.value = false;
  }
});

function goBack() {
  router.push('/borrow-records');
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  submitting.value = true;
  try {
    const submitData = { ...form.value };
    if (!submitData.actual_return_date) {
      submitData.actual_return_date = null;
    }

    if (isCreate.value) {
      await borrowStore.addBorrowRecord(submitData);
      ElMessage.success('登记成功');
    } else {
      await borrowStore.editBorrowRecord(props.id, submitData);
      ElMessage.success('保存成功');
    }
    router.push('/borrow-records');
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
  margin: 0;
}

.form-card {
  padding: 8px;
}
</style>
