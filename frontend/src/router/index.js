import { createRouter, createWebHistory } from 'vue-router';
import SealList from '../views/SealList.vue';
import SealDetail from '../views/SealDetail.vue';

const routes = [
  {
    path: '/',
    name: 'SealList',
    component: SealList
  },
  {
    path: '/seals/new',
    name: 'SealCreate',
    component: SealDetail,
    props: { mode: 'create' }
  },
  {
    path: '/seals/:id',
    name: 'SealDetail',
    component: SealDetail,
    props: (route) => ({ mode: 'view', id: Number(route.params.id) })
  },
  {
    path: '/seals/:id/edit',
    name: 'SealEdit',
    component: SealDetail,
    props: (route) => ({ mode: 'edit', id: Number(route.params.id) })
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
