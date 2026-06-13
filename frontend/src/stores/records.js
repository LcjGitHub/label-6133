import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  fetchRecords,
  fetchRecord,
  createRecord,
  updateRecord,
  deleteRecord,
  fetchStatistics
} from '../api/records';

export const useRecordStore = defineStore('records', () => {
  const records = ref([]);
  const loading = ref(false);
  const statistics = ref(null);
  const statisticsLoading = ref(false);

  async function loadRecords() {
    loading.value = true;
    try {
      const res = await fetchRecords();
      records.value = res.data.data;
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

  async function getRecord(id) {
    const res = await fetchRecord(id);
    return res.data.data;
  }

  async function addRecord(data) {
    const res = await createRecord(data);
    const record = res.data.data;
    records.value.unshift(record);
    return record;
  }

  async function editRecord(id, data) {
    const res = await updateRecord(id, data);
    const record = res.data.data;
    const index = records.value.findIndex((r) => r.id === id);
    if (index !== -1) {
      records.value.splice(index, 1, record);
    }
    return record;
  }

  async function removeRecord(id) {
    await deleteRecord(id);
    records.value = records.value.filter((r) => r.id !== id);
  }

  return {
    records,
    loading,
    statistics,
    statisticsLoading,
    loadRecords,
    loadStatistics,
    getRecord,
    addRecord,
    editRecord,
    removeRecord
  };
});
