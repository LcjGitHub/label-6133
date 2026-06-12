<template>
  <div class="seal-detail" v-loading="pageLoading">
    <div class="page-header">
      <el-button :icon="ArrowLeft" @click="goBack">返回</el-button>
      <h2>{{ pageTitle }}</h2>
    </div>

    <!-- 查看模式 -->
    <el-card v-if="isView && seal" class="detail-card">
      <el-row :gutter="32">
        <el-col :xs="24" :md="10">
          <div class="detail-image">
            <el-image
              v-if="seal.image_url"
              :src="seal.image_url"
              fit="contain"
              class="seal-image"
            >
              <template #error>
                <div class="image-placeholder large">{{ seal.inscription }}</div>
              </template>
            </el-image>
            <div v-else class="image-placeholder large">{{ seal.inscription }}</div>
          </div>
        </el-col>
        <el-col :xs="24" :md="14">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="印文">
              <span class="inscription-text">{{ seal.inscription }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="材质">{{ seal.material }}</el-descriptions-item>
            <el-descriptions-item label="尺寸">{{ seal.size }}</el-descriptions-item>
            <el-descriptions-item label="刻制日期">{{ seal.carved_date }}</el-descriptions-item>
            <el-descriptions-item label="用途">{{ seal.purpose }}</el-descriptions-item>
            <el-descriptions-item label="图片 URL">
              <el-link v-if="seal.image_url" :href="seal.image_url" target="_blank" type="primary">
                {{ seal.image_url }}
              </el-link>
              <span v-else class="empty-text">未设置</span>
            </el-descriptions-item>
          </el-descriptions>
          <div class="action-bar">
            <el-button type="primary" @click="goEdit">编辑</el-button>
            <el-button type="danger" @click="handleDelete">删除</el-button>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 编辑/新增模式 -->
    <el-card v-else-if="isEditing" class="form-card">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        style="max-width: 600px"
      >
        <el-form-item label="印文" prop="inscription">
          <el-input v-model="form.inscription" placeholder="如：藏书、静读" />
        </el-form-item>
        <el-form-item label="材质" prop="material">
          <el-input v-model="form.material" placeholder="如：青田石、寿山石" />
        </el-form-item>
        <el-form-item label="尺寸" prop="size">
          <el-input v-model="form.size" placeholder="如：2.5×2.5 cm" />
        </el-form-item>
        <el-form-item label="刻制日期" prop="carved_date">
          <el-date-picker
            v-model="form.carved_date"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="用途" prop="purpose">
          <el-input
            v-model="form.purpose"
            type="textarea"
            :rows="2"
            placeholder="如：钤于藏书扉页"
          />
        </el-form-item>
        <el-form-item label="图片 URL" prop="image_url">
          <el-input v-model="form.image_url" placeholder="印章图片链接（选填）" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            {{ isCreate ? '创建' : '保存' }}
          </el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>

      <div v-if="form.image_url" class="preview">
        <p class="preview-label">图片预览</p>
        <el-image :src="form.image_url" fit="contain" style="max-height: 200px">
          <template #error>
            <span class="empty-text">图片加载失败</span>
          </template>
        </el-image>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeft } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useSealStore } from '../stores/seals';

const props = defineProps({
  mode: {
    type: String,
    default: 'view'
  },
  id: {
    type: Number,
    default: null
  }
});

const router = useRouter();
const sealStore = useSealStore();

const pageLoading = ref(false);
const submitting = ref(false);
const seal = ref(null);
const formRef = ref(null);

const form = ref({
  inscription: '',
  material: '',
  size: '',
  carved_date: '',
  purpose: '',
  image_url: ''
});

const rules = {
  inscription: [{ required: true, message: '请输入印文', trigger: 'blur' }],
  material: [{ required: true, message: '请输入材质', trigger: 'blur' }],
  size: [{ required: true, message: '请输入尺寸', trigger: 'blur' }],
  carved_date: [{ required: true, message: '请选择刻制日期', trigger: 'change' }],
  purpose: [{ required: true, message: '请输入用途', trigger: 'blur' }]
};

const isView = computed(() => props.mode === 'view');
const isCreate = computed(() => props.mode === 'create');
const isEditing = computed(() => props.mode === 'create' || props.mode === 'edit');

const pageTitle = computed(() => {
  if (isCreate.value) return '新增藏书印';
  if (props.mode === 'edit') return '编辑藏书印';
  return seal.value ? `「${seal.value.inscription}」详情` : '印章详情';
});

onMounted(async () => {
  if (props.mode === 'create') return;

  pageLoading.value = true;
  try {
    const data = await sealStore.getSeal(props.id);
    seal.value = data;

    if (props.mode === 'edit') {
      form.value = {
        inscription: data.inscription,
        material: data.material,
        size: data.size,
        carved_date: data.carved_date,
        purpose: data.purpose,
        image_url: data.image_url || ''
      };
    }
  } catch {
    ElMessage.error('加载失败，印章可能不存在');
    router.push('/');
  } finally {
    pageLoading.value = false;
  }
});

/**
 * 返回上一页
 */
function goBack() {
  if (isCreate.value) {
    router.push('/');
  } else if (props.mode === 'edit') {
    router.push(`/seals/${props.id}`);
  } else {
    router.push('/');
  }
}

/**
 * 跳转编辑页
 */
function goEdit() {
  router.push(`/seals/${props.id}/edit`);
}

/**
 * 提交表单
 */
async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  submitting.value = true;
  try {
    if (isCreate.value) {
      const created = await sealStore.addSeal(form.value);
      ElMessage.success('创建成功');
      router.push(`/seals/${created.id}`);
    } else {
      await sealStore.editSeal(props.id, form.value);
      ElMessage.success('保存成功');
      router.push(`/seals/${props.id}`);
    }
  } catch (err) {
    const msg = err.response?.data?.message || '操作失败';
    ElMessage.error(msg);
  } finally {
    submitting.value = false;
  }
}

/**
 * 删除当前印章
 */
async function handleDelete() {
  try {
    await ElMessageBox.confirm(
      `确定删除「${seal.value.inscription}」吗？`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' }
    );
    await sealStore.removeSeal(props.id);
    ElMessage.success('删除成功');
    router.push('/');
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

.detail-card,
.form-card {
  padding: 8px;
}

.detail-image {
  height: 320px;
  background: #f5f7fa;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
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
  font-size: 64px;
  font-weight: bold;
  color: #c45656;
  background: linear-gradient(135deg, #fef0f0 0%, #fde2e2 100%);
}

.image-placeholder.large {
  min-height: 320px;
}

.inscription-text {
  font-size: 24px;
  font-weight: 600;
  color: #c45656;
}

.action-bar {
  margin-top: 24px;
  display: flex;
  gap: 12px;
}

.preview {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.preview-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.empty-text {
  color: #c0c4cc;
}
</style>
