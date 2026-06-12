import axios from 'axios';

const http = axios.create({
  baseURL: '/api',
  timeout: 10000
});

/**
 * 获取全部印章
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export function fetchSeals() {
  return http.get('/seals');
}

/**
 * 获取单条印章
 * @param {number} id
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export function fetchSeal(id) {
  return http.get(`/seals/${id}`);
}

/**
 * 新增印章
 * @param {object} data
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export function createSeal(data) {
  return http.post('/seals', data);
}

/**
 * 更新印章
 * @param {number} id
 * @param {object} data
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export function updateSeal(id, data) {
  return http.put(`/seals/${id}`, data);
}

/**
 * 删除印章
 * @param {number} id
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export function deleteSeal(id) {
  return http.delete(`/seals/${id}`);
}
