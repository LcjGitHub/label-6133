import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  fetchRecords,
  fetchRecord,
  createRecord,
  updateRecord,
  deleteRecord
} from '../api/records';

export const useRecordStore = defineStore('records', () => {
  const records = ref([]);
  const loading = ref(false);

  async function loadRecords() {
    loading.value = true;
    try {
      const res = await fetchRecords();
      records.value = res.data.data;
    } finally {
      loading.value = false;
    }
  }

  async function getRecord(id) {
    const res = await fetchRecord(id);
    return res.data.data;
  }

  async function addRecord(data) {
    const res = await createRecord(data);
    return res.data.data;
  }

  async function editRecord(id, data) {
    const res = await updateRecord(id, data);
    return res.data.data;
  }

  async function removeRecord(id) {
    await deleteRecord(id);
    records.value = records.value.filter((r) => r.id !== id);
  }

  return {
    records,
    loading,
    loadRecords,
    getRecord,
    addRecord,
    editRecord,
    removeRecord
  };
});
