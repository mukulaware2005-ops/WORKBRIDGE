import * as api from '../api/api';


// ======================================================
// DASHBOARD
// ======================================================

export async function getAdminStats() {
  return await api.getAdminStats();
}


// ======================================================
// USER MANAGEMENT
// ======================================================

export async function listAdminUsers(params = {}) {
  return await api.listAdminUsers(params);
}


export async function getAdminUser(userId) {
  return await api.getAdminUser(userId);
}


export async function updateAdminUser(userId, payload) {
  return await api.updateAdminUser(
    userId,
    payload
  );
}

// COMMUNITY MANAGEMENT

export async function listAdminCommunity(params = {}) {
  return await api.listAdminCommunity(params);
}

export async function getAdminCommunity(conversationId) {
  return await api.getAdminCommunity(conversationId);
}

export async function updateAdminCommunity(
  conversationId,
  payload
) {
  return await api.updateAdminCommunity(
    conversationId,
    payload
  );
}

// REVIEW MANAGEMENT

export async function listAdminReviews(params = {}) {
  return await api.listAdminReviews(params);
}

export async function getAdminReview(reviewId) {
  return await api.getAdminReview(reviewId);
}

export async function deleteAdminReview(reviewId) {
  return await api.deleteAdminReview(reviewId);
}

export async function deleteAdminUser(userId) {
  return await api.deleteAdminUser(userId);
}

export const listAdminWorkers = async (params = {}) => {
  return api.listAdminWorkers(params);
};

export const getAdminWorker = async (workerId) => {
  return api.getAdminWorker(workerId);
};

export const updateAdminWorker = async (workerId, payload) => {
  return api.updateAdminWorker(workerId, payload);
};
// VERIFICATION

export async function listVerificationRequests(params = {}) {
  return await api.listVerificationRequests(params);
}

export async function getVerificationWorker(workerId) {
  return await api.getVerificationWorker(workerId);
}

export async function updateVerification(workerId, payload) {
  return await api.updateVerification(workerId, payload);
}


export const listAdminBookings = async (params = {}) => {
  return api.listAdminBookings(params);
};


export const getAdminBooking = async (bookingId) => {
  return api.getAdminBooking(bookingId);
};


export const updateAdminBooking = async (bookingId, payload) => {
  return api.updateAdminBooking(bookingId, payload);
};

// CUSTOMER MANAGEMENT

export async function listAdminCustomers(params = {}) {
  return await api.listAdminCustomers(params);
}

export async function getAdminCustomer(customerId) {
  return await api.getAdminCustomer(customerId);
}

export async function updateAdminCustomer(customerId, payload) {
  return await api.updateAdminCustomer(customerId, payload);
}

export async function deleteAdminCustomer(customerId) {
  return await api.deleteAdminCustomer(customerId);
}