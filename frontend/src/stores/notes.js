import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  fetchNotes,
  fetchNotesByStamp,
  fetchNote,
  createNote,
  updateNote,
  deleteNote
} from '../api/notes';

export const useNoteStore = defineStore('notes', () => {
  const notes = ref([]);
  const loading = ref(false);

  async function loadNotes() {
    loading.value = true;
    try {
      const res = await fetchNotes();
      notes.value = res.data.data;
    } finally {
      loading.value = false;
    }
  }

  async function loadNotesByStamp(stampId) {
    loading.value = true;
    try {
      const res = await fetchNotesByStamp(stampId);
      notes.value = res.data.data;
      return notes.value;
    } finally {
      loading.value = false;
    }
  }

  async function getNote(id) {
    const res = await fetchNote(id);
    return res.data.data;
  }

  async function addNote(data) {
    const res = await createNote(data);
    const note = res.data.data;
    notes.value.unshift(note);
    return note;
  }

  async function editNote(id, data) {
    const res = await updateNote(id, data);
    const note = res.data.data;
    const index = notes.value.findIndex((n) => n.id === id);
    if (index !== -1) {
      notes.value.splice(index, 1, note);
    }
    return note;
  }

  async function removeNote(id) {
    await deleteNote(id);
    notes.value = notes.value.filter((n) => n.id !== id);
  }

  return {
    notes,
    loading,
    loadNotes,
    loadNotesByStamp,
    getNote,
    addNote,
    editNote,
    removeNote
  };
});
