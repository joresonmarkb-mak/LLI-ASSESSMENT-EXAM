import api from './axios';

export const getOrders = () => api.get('/orders');
export const createOrder = (data) => api.post('/orders', data);
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status });
export const cancelOrder = (id) => api.put(`/orders/${id}/cancel`);