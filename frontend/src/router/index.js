import { createRouter, createWebHistory } from 'vue-router';
import RecordList from '../views/RecordList.vue';
import RecordForm from '../views/RecordForm.vue';
import Statistics from '../views/Statistics.vue';

const routes = [
  {
    path: '/',
    name: 'RecordList',
    component: RecordList,
    meta: { title: '印章列表', activeTab: 'list' }
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: Statistics,
    meta: { title: '藏书印统计看板', activeTab: 'statistics' }
  },
  {
    path: '/stamps/new',
    name: 'StampCreate',
    component: RecordForm,
    props: { mode: 'create' },
    meta: { title: '新增印章', activeTab: 'list' }
  },
  {
    path: '/stamps/:id/edit',
    name: 'StampEdit',
    component: RecordForm,
    props: (route) => ({ mode: 'edit', id: Number(route.params.id) }),
    meta: { title: '编辑印章', activeTab: 'list' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, _from, next) => {
  if (to.meta?.title) {
    document.title = `${to.meta.title} - 藏书印管理系统`;
  }
  next();
});

export default router;
