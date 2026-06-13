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

export function fetchStamps() {
  return http.get('/stamps');
}

export function fetchStamp(id) {
  return http.get(`/stamps/${id}`);
}

export function createStamp(data) {
  return http.post('/stamps', data);
}

export function updateStamp(id, data) {
  return http.put(`/stamps/${id}`, data);
}

export function deleteStamp(id) {
  return http.delete(`/stamps/${id}`);
}

export function fetchStatistics() {
  return http.get('/statistics');
}
