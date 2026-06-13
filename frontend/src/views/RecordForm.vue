<template>
  <div class="material-form">
    <div class="page-header">
      <el-button :icon="ArrowLeft" @click="goBack">返回</el-button>
      <h2>{{ isCreate ? '新增印材' : '编辑印材' }}</h2>
    </div>

    <el-card class="form-card" v-loading="formLoading">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        style="max-width: 720px"
      >
        <el-form-item label="印材名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入印材名称，如：寿山石" maxlength="64" />
        </el-form-item>
        <el-form-item label="产地" prop="origin">
          <el-input v-model="form.origin" placeholder="请输入产地，如：福建省福州市寿山乡" maxlength="128" />
        </el-form-item>
        <el-form-item label="硬度描述" prop="hardness">
          <el-input
            v-model="form.hardness"
            type="textarea"
            :rows="2"
            placeholder="请输入硬度描述，如：摩氏硬度2-3，质地温润细腻"
            maxlength="256"
          />
        </el-form-item>
        <el-form-item label="参考颜色" prop="color">
          <el-input
            v-model="form.color"
            type="textarea"
            :rows="2"
            placeholder="请输入参考颜色描述，如：色彩丰富，有红、黄、白、黑、灰、绿等色"
            maxlength="256"
          />
        </el-form-item>
        <el-form-item label="简介文字" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="5"
            placeholder="请输入印材的详细介绍文字"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="示意图片链接" prop="image_url">
          <el-input v-model="form.image_url" placeholder="请输入图片URL链接" maxlength="500" />
        </el-form-item>
        <el-form-item v-if="form.image_url" label="图片预览">
          <div class="image-preview">
            <img :src="form.image_url" alt="预览图" @error="imageError = true" />
          </div>
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
const imageError = ref(false);

const form = ref({
  name: '',
  origin: '',
  hardness: '',
  color: '',
  description: '',
  image_url: ''
});

const rules = {
  name: [{ required: true, message: '请输入印材名称', trigger: 'blur' }],
  origin: [{ required: true, message: '请输入产地', trigger: 'blur' }],
  hardness: [{ required: true, message: '请输入硬度描述', trigger: 'blur' }],
  color: [{ required: true, message: '请输入参考颜色', trigger: 'blur' }],
  description: [{ required: true, message: '请输入简介文字', trigger: 'blur' }],
  image_url: [{ required: true, message: '请输入示意图片链接', trigger: 'blur' }]
};

const isCreate = computed(() => props.mode === 'create');

onMounted(async () => {
  if (props.mode === 'create') return;

  formLoading.value = true;
  try {
    const data = await recordStore.getRecord(props.id);
    form.value = {
      name: data.name,
      origin: data.origin,
      hardness: data.hardness,
      color: data.color,
      description: data.description,
      image_url: data.image_url
    };
  } catch {
    ElMessage.error('加载失败，印材可能不存在');
    router.push('/');
  } finally {
    formLoading.value = false;
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

.image-preview {
  width: 200px;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e4e7ed;
  background: #f5f7fa;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
