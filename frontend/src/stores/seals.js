import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  fetchSeals,
  fetchSeal,
  createSeal,
  updateSeal,
  deleteSeal
} from '../api/seals';

export const useSealStore = defineStore('seals', () => {
  const seals = ref([]);
  const loading = ref(false);

  /**
   * 加载印章列表
   */
  async function loadSeals() {
    loading.value = true;
    try {
      const res = await fetchSeals();
      seals.value = res.data.data;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 获取单条印章
   * @param {number} id
   */
  async function getSeal(id) {
    const res = await fetchSeal(id);
    return res.data.data;
  }

  /**
   * 新增印章
   * @param {object} data
   */
  async function addSeal(data) {
    const res = await createSeal(data);
    return res.data.data;
  }

  /**
   * 更新印章
   * @param {number} id
   * @param {object} data
   */
  async function editSeal(id, data) {
    const res = await updateSeal(id, data);
    return res.data.data;
  }

  /**
   * 删除印章
   * @param {number} id
   */
  async function removeSeal(id) {
    await deleteSeal(id);
    seals.value = seals.value.filter((s) => s.id !== id);
  }

  return {
    seals,
    loading,
    loadSeals,
    getSeal,
    addSeal,
    editSeal,
    removeSeal
  };
});
