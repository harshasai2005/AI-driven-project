const BASE_URL = 'http://localhost:3001/api';

function getToken() {
    return localStorage.getItem('lendai_token');
}

async function request(path, options = {}) {
    const token = getToken();
    const res = await fetch(`${BASE_URL}${path}`, {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        ...options,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
}

export const api = {
    auth: {
        login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
        register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    },
    loans: {
        getAll: () => request('/loans'),
        submit: (body) => request('/loans', { method: 'POST', body: JSON.stringify(body) }),
        updateStatus: (id, body) => request(`/loans/${id}/status`, { method: 'PATCH', body: JSON.stringify(body) }),
    },
    admin: {
        stats: () => request('/admin/stats'),
        customers: () => request('/admin/customers'),
    },
    notifications: {
        getAll: () => request('/notifications'),
        markRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
        markAllRead: () => request('/notifications/read-all/mark', { method: 'PATCH' }),
        approveCustomer: (userId, notifId) => request('/notifications/approve-customer', { method: 'POST', body: JSON.stringify({ userId, notifId }) }),
    },
};
