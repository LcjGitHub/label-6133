<template>
  <el-container class="app-container">
    <el-header class="app-header">
      <div class="header-content">
        <h1 class="title" @click="goHome">藏书印管理系统</h1>
        <div class="nav-right">
          <el-radio-group v-model="activeTab" size="default" @change="handleTabChange">
            <el-radio-button value="list">
              <el-icon><List /></el-icon>
              <span>印章列表</span>
            </el-radio-button>
            <el-radio-button value="statistics">
              <el-icon><DataAnalysis /></el-icon>
              <span>统计看板</span>
            </el-radio-button>
          </el-radio-group>
          <el-button type="primary" @click="goCreate">
            <el-icon><Plus /></el-icon>
            <span>新增印章</span>
          </el-button>
        </div>
      </div>
    </el-header>
    <el-main>
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { List, DataAnalysis, Plus } from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();

const activeTab = ref('list');

watch(
  () => route.path,
  (path) => {
    activeTab.value = path === '/statistics' ? 'statistics' : 'list';
  },
  { immediate: true }
);

function handleTabChange(value) {
  if (value === 'statistics') {
    router.push('/statistics');
  } else {
    router.push('/');
  }
}

function goHome() {
  router.push('/');
}

function goCreate() {
  router.push('/stamps/new');
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', Arial, sans-serif;
  background: #f5f7fa;
}

.app-container {
  min-height: 100vh;
}

.app-header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.header-content {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  cursor: pointer;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-right .el-radio-button {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-right .el-button {
  display: flex;
  align-items: center;
  gap: 4px;
}

.el-main {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 24px 20px;
}
</style>
