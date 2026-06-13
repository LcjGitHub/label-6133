import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  fetchBorrowRecords,
  fetchBorrowRecord,
  createBorrowRecord,
  updateBorrowRecord,
  deleteBorrowRecord,
  returnBorrowRecord,
  fetchStamps
} from '../api/borrowRecords';

export const useBorrowRecordStore = defineStore('borrowRecords', () => {
  const borrowRecords = ref([]);
  const loading = ref(false);
  const stamps = ref([]);
  const stampsLoading = ref(false);

  async function loadBorrowRecords(status) {
    loading.value = true;
    try {
      const res = await fetchBorrowRecords(status);
      borrowRecords.value = res.data.data;
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

  async function getBorrowRecord(id) {
    const res = await fetchBorrowRecord(id);
    return res.data.data;
  }

  async function addBorrowRecord(data) {
    const res = await createBorrowRecord(data);
    const record = res.data.data;
    borrowRecords.value.unshift(record);
    return record;
  }

  async function editBorrowRecord(id, data) {
    const res = await updateBorrowRecord(id, data);
    const record = res.data.data;
    const index = borrowRecords.value.findIndex((r) => r.id === id);
    if (index !== -1) {
      borrowRecords.value.splice(index, 1, record);
    }
    return record;
  }

  async function removeBorrowRecord(id) {
    await deleteBorrowRecord(id);
    borrowRecords.value = borrowRecords.value.filter((r) => r.id !== id);
  }

  async function returnRecord(id, actualReturnDate) {
    const res = await returnBorrowRecord(id, actualReturnDate);
    const record = res.data.data;
    const index = borrowRecords.value.findIndex((r) => r.id === id);
    if (index !== -1) {
      borrowRecords.value.splice(index, 1, record);
    }
    return record;
  }

  return {
    borrowRecords,
    loading,
    stamps,
    stampsLoading,
    loadBorrowRecords,
    loadStamps,
    getBorrowRecord,
    addBorrowRecord,
    editBorrowRecord,
    removeBorrowRecord,
    returnRecord
  };
});
