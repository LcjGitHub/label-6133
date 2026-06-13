import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  fetchStamps,
  fetchStamp,
  createStamp,
  updateStamp,
  deleteStamp,
  fetchStatistics
} from '../api/stamps';

export const useStampStore = defineStore('stamps', () => {
  const stamps = ref([]);
  const loading = ref(false);
  const statistics = ref(null);
  const statisticsLoading = ref(false);

  async function loadStamps() {
    loading.value = true;
    try {
      const res = await fetchStamps();
      stamps.value = res.data.data;
    } finally {
      loading.value = false;
    }
  }

  async function loadStatistics() {
    statisticsLoading.value = true;
    try {
      const res = await fetchStatistics();
      statistics.value = res.data.data;
      return statistics.value;
    } catch (err) {
      statistics.value = null;
      throw err;
    } finally {
      statisticsLoading.value = false;
    }
  }

  async function getStamp(id) {
    const res = await fetchStamp(id);
    return res.data.data;
  }

  async function addStamp(data) {
    const res = await createStamp(data);
    const stamp = res.data.data;
    stamps.value.unshift(stamp);
    return stamp;
  }

  async function editStamp(id, data) {
    const res = await updateStamp(id, data);
    const stamp = res.data.data;
    const index = stamps.value.findIndex((r) => r.id === id);
    if (index !== -1) {
      stamps.value.splice(index, 1, stamp);
    }
    return stamp;
  }

  async function removeStamp(id) {
    await deleteStamp(id);
    stamps.value = stamps.value.filter((r) => r.id !== id);
  }

  return {
    stamps,
    loading,
    statistics,
    statisticsLoading,
    loadStamps,
    loadStatistics,
    getStamp,
    addStamp,
    editStamp,
    removeStamp
  };
});
