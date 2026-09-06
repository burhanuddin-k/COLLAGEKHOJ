import client from './client';

export const authApi = {
  register: (data) => client.post('/auth/register', data),
  login: (data) => client.post('/auth/login', data),
  me: () => client.get('/auth/me'),
};

export const collegeApi = {
  search: (params) => client.get('/colleges', { params }),
  getBySlug: (slug) => client.get(`/colleges/${slug}`),
  compare: (ids) => client.get('/colleges/compare', { params: { ids: ids.join(',') } }),
};

export const courseApi = {
  list: (params) => client.get('/courses', { params }),
  getBySlug: (slug) => client.get(`/courses/${slug}`),
};

export const reviewApi = {
  listForCollege: (collegeId, params) => client.get(`/reviews/college/${collegeId}`, { params }),
  create: (data) => client.post('/reviews', data),
  report: (id, reason) => client.post(`/reviews/${id}/report`, { reason }),
};

export const userApi = {
  me: () => client.get('/users/me'),
  updateMe: (data) => client.put('/users/me', data),
  dashboard: () => client.get('/users/dashboard'),
  savedColleges: () => client.get('/users/saved-colleges'),
  saveCollege: (collegeId) => client.post('/users/saved-colleges', { collegeId }),
  unsaveCollege: (collegeId) => client.delete(`/users/saved-colleges/${collegeId}`),
  checklist: () => client.get('/users/checklist'),
  addChecklistItem: (data) => client.post('/users/checklist', data),
  toggleChecklistItem: (id, isDone) => client.patch(`/users/checklist/${id}`, { isDone }),
};

export const admissionApi = {
  list: (params) => client.get('/admissions', { params }),
  trackDeadline: (admissionId, remindAt) => client.post('/admissions/deadlines', { admissionId, remindAt }),
};

export const adminApi = {
  dashboard: () => client.get('/admin/dashboard'),
  listColleges: (params) => client.get('/admin/colleges', { params }),
  verifyCollege: (id, data) => client.put(`/admin/colleges/${id}/verify`, data),
  pendingReviews: (params) => client.get('/admin/reviews/pending', { params }),
  moderateReview: (id, data) => client.put(`/admin/reviews/${id}/moderate`, data),
  pendingUpdateRequests: (params) => client.get('/admin/update-requests', { params }),
  resolveUpdateRequest: (id, data) => client.put(`/admin/update-requests/${id}/resolve`, data),
  auditLogs: (params) => client.get('/admin/audit-logs', { params }),
};

export const portalApi = {
  myCollege: () => client.get('/portal/my-college'),
  claim: (data) => client.post('/portal/claims', data),
  myClaims: () => client.get('/portal/claims'),
  submitUpdate: (data) => client.post('/portal/update-requests', data),
  myUpdateRequests: () => client.get('/portal/update-requests'),
};
