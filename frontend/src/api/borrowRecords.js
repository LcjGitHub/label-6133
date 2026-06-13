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

export function fetchBorrowRecords(status) {
  const params = status ? { status } : {};
  return http.get('/borrow-records', { params });
}

export function fetchBorrowRecord(id) {
  return http.get(`/borrow-records/${id}`);
}

export function createBorrowRecord(data) {
  return http.post('/borrow-records', data);
}

export function updateBorrowRecord(id, data) {
  return http.put(`/borrow-records/${id}`, data);
}

export function deleteBorrowRecord(id) {
  return http.delete(`/borrow-records/${id}`);
}

export function returnBorrowRecord(id, actualReturnDate) {
  const data = actualReturnDate ? { actual_return_date: actualReturnDate } : {};
  return http.put(`/borrow-records/${id}/return`, data);
}

export function fetchStamps() {
  return http.get('/stamps');
}
