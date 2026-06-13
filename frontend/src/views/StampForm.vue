<template>
  <div class="stamp-form">
    <div class="page-header">
      <el-button :icon="ArrowLeft" @click="goBack">返回</el-button>
      <h2>{{ isCreate ? '新增印章' : '编辑印章' }}</h2>
    </div>

    <el-card class="form-card" v-loading="formLoading">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        style="max-width: 560px"
      >
        <el-form-item label="印文" prop="inscription">
          <el-input
            v-model="form.inscription"
            placeholder="请输入印文，如：书香门第"
            maxlength="32"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="材质" prop="material">
          <el-select v-model="form.material" placeholder="请选择材质" style="width: 100%">
            <el-option
              v-for="item in materialOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="刻制日期" prop="carve_date">
          <el-date-picker
            v-model="form.carve_date"
            type="date"
            placeholder="请选择刻制日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
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
const formLoading = ref(false);
const formRef = ref(null);

const materialOptions = [
  { label: '寿山石', value: '寿山石' },
  { label: '青田石', value: '青田石' },
  { label: '昌化石', value: '昌化石' },
  { label: '巴林石', value: '巴林石' },
  { label: '和田玉', value: '和田玉' }
];

const form = ref({
  inscription: '',
  material: '',
  carve_date: ''
});

const rules = {
  inscription: [{ required: true, message: '请输入印文', trigger: 'blur' }],
  material: [{ required: true, message: '请选择材质', trigger: 'change' }],
  carve_date: [{ required: true, message: '请选择刻制日期', trigger: 'change' }]
};

const isCreate = computed(() => props.mode === 'create');

onMounted(async () => {
  if (props.mode === 'create') return;

  formLoading.value = true;
  try {
    const data = await recordStore.getStamp(props.id);
    form.value = {
      inscription: data.inscription,
      material: data.material,
      carve_date: data.carve_date
    };
  } catch {
    ElMessage.error('加载失败，印章可能不存在');
    router.push('/');
  } finally {
    formLoading.value = false;
  }
});

function goBack() {
  if (isCreate.value) {
    router.push('/');
  } else {
    router.push(`/stamps/${props.id}`);
  }
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  submitting.value = true;
  try {
    if (isCreate.value) {
      const created = await recordStore.addStamp(form.value);
      ElMessage.success('创建成功');
      router.push(`/stamps/${created.id}`);
    } else {
      await recordStore.editStamp(props.id, form.value);
      ElMessage.success('保存成功');
      router.push(`/stamps/${props.id}`);
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
  margin: 0;
}

.form-card {
  padding: 8px;
}
</style>
