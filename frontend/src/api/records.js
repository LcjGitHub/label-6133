import axios from 'axios';

const http = axios.create({
  baseURL: '/api',
  timeout: 10000
});

export function fetchRecords() {
  return http.get('/records');
}

export function fetchRecord(id) {
  return http.get(`/records/${id}`);
}

export function createRecord(data) {
  return http.post('/records', data);
}

export function updateRecord(id, data) {
  return http.put(`/records/${id}`, data);
}

export function deleteRecord(id) {
  return http.delete(`/records/${id}`);
}
