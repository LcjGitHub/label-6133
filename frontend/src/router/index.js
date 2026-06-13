import { createRouter, createWebHistory } from 'vue-router';
import RecordList from '../views/RecordList.vue';
import RecordDetail from '../views/RecordDetail.vue';
import RecordForm from '../views/RecordForm.vue';

const routes = [
  {
    path: '/',
    name: 'RecordList',
    component: RecordList
  },
  {
    path: '/records/new',
    name: 'RecordCreate',
    component: RecordForm,
    props: { mode: 'create' }
  },
  {
    path: '/records/:id',
    name: 'RecordDetail',
    component: RecordDetail,
    props: (route) => ({ id: Number(route.params.id) })
  },
  {
    path: '/records/:id/edit',
    name: 'RecordEdit',
    component: RecordForm,
    props: (route) => ({ mode: 'edit', id: Number(route.params.id) })
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
