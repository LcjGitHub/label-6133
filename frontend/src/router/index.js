import { createRouter, createWebHistory } from 'vue-router';
import RecordList from '../views/RecordList.vue';
import RecordForm from '../views/RecordForm.vue';
import Statistics from '../views/Statistics.vue';
import BorrowList from '../views/BorrowList.vue';
import BorrowForm from '../views/BorrowForm.vue';

const routes = [
  {
    path: '/',
    redirect: '/borrow-records'
  },
  {
    path: '/stamps',
    name: 'RecordList',
    component: RecordList,
    meta: { title: '印章列表', activeTab: 'stamps' }
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: Statistics,
    meta: { title: '统计看板', activeTab: 'statistics' }
  },
  {
    path: '/stamps/new',
    name: 'StampCreate',
    component: RecordForm,
    props: { mode: 'create' },
    meta: { title: '新增印章', activeTab: 'stamps' }
  },
  {
    path: '/stamps/:id/edit',
    name: 'StampEdit',
    component: RecordForm,
    props: (route) => ({ mode: 'edit', id: Number(route.params.id) }),
    meta: { title: '编辑印章', activeTab: 'stamps' }
  },
  {
    path: '/borrow-records',
    name: 'BorrowList',
    component: BorrowList,
    meta: { title: '印章外借登记', activeTab: 'borrow' }
  },
  {
    path: '/borrow-records/new',
    name: 'BorrowCreate',
    component: BorrowForm,
    props: { mode: 'create' },
    meta: { title: '登记外借', activeTab: 'borrow' }
  },
  {
    path: '/borrow-records/:id/edit',
    name: 'BorrowEdit',
    component: BorrowForm,
    props: (route) => ({ mode: 'edit', id: Number(route.params.id) }),
    meta: { title: '编辑外借记录', activeTab: 'borrow' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, _from, next) => {
  if (to.meta?.title) {
    document.title = `${to.meta.title} - 印章外借登记系统`;
  }
  next();
});

export default router;
