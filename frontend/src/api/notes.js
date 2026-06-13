import axios from 'axios';

const http = axios.create({
  baseURL: '/api',
  timeout: 10000
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API请求错误:', error.message);
    return Promise.reject(error);
  }
);

export function fetchNotes() {
  return http.get('/notes');
}

export function fetchNotesByStamp(stampId) {
  return http.get(`/notes/stamp/${stampId}`);
}

export function fetchNote(id) {
  return http.get(`/notes/${id}`);
}

export function createNote(data) {
  return http.post('/notes', data);
}

export function updateNote(id, data) {
  return http.put(`/notes/${id}`, data);
}

export function deleteNote(id) {
  return http.delete(`/notes/${id}`);
}
