import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  fetchRecords,
  fetchRecord,
  createRecord,
  updateRecord,
  deleteRecord,
  fetchStamps,
  fetchStamp,
  createStamp,
  updateStamp,
  deleteStamp,
  fetchStatistics
} from '../api/records';

export const useRecordStore = defineStore('records', () => {
  const records = ref([]);
  const loading = ref(false);
  const stamps = ref([]);
  const stampsLoading = ref(false);
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

  async function loadStamps() {
    stampsLoading.value = true;
    try {
      const res = await fetchStamps();
      stamps.value = res.data.data;
    } finally {
      stampsLoading.value = false;
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

  async function getStamp(id) {
    const res = await fetchStamp(id);
    return res.data.data;
  }

  async function addRecord(data) {
    const res = await createRecord(data);
    const record = res.data.data;
    records.value.unshift(record);
    return record;
  }

  async function addStamp(data) {
    const res = await createStamp(data);
    const stamp = res.data.data;
    stamps.value.unshift(stamp);
    return stamp;
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

  async function editStamp(id, data) {
    const res = await updateStamp(id, data);
    const stamp = res.data.data;
    const index = stamps.value.findIndex((s) => s.id === id);
    if (index !== -1) {
      stamps.value.splice(index, 1, stamp);
    }
    return stamp;
  }

  async function removeRecord(id) {
    await deleteRecord(id);
    records.value = records.value.filter((r) => r.id !== id);
  }

  async function removeStamp(id) {
    await deleteStamp(id);
    stamps.value = stamps.value.filter((s) => s.id !== id);
  }

  return {
    records,
    loading,
    stamps,
    stampsLoading,
    statistics,
    statisticsLoading,
    loadRecords,
    loadStamps,
    loadStatistics,
    getRecord,
    getStamp,
    addRecord,
    addStamp,
    editRecord,
    editStamp,
    removeRecord,
    removeStamp
  };
});
