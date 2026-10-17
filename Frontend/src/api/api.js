
const API_BASE_URL = 'http://127.0.0.1:8000/api';
const AUTH_STORAGE_KEY = 'workbridge_user';

export const API_ENDPOINTS = {
  // REAL DJANGO AUTH APIs
  login: '/auth/login/',
  signup: '/auth/register/',
  profile: '/auth/profile/',
  refresh: '/auth/refresh/',
  logout: '/auth/logout/',
  forgotPassword: '/auth/forgot-password/',
  workerProfile: '/auth/worker/profile/',
  services: '/auth/services/',
  workers: '/auth/workers/',
  reviews: '/auth/workers/',
  bookings: '/bookings/',
  bookingStatus: '/bookings/',
  conversations: '/conversations/',
  messages: '/messages/',

  // ADMIN
  adminWorkers: '/admin/workers/',
  adminWorkerDetail: '/admin/workers/',
  adminBookings: '/admin/bookings/',
  adminBookingDetail: '/admin/bookings/',
  adminCustomers: '/admin/customers/',
  adminCustomerDetail: '/admin/customers/',
  adminVerification: '/admin/verification/',
  adminVerificationDetail: '/admin/verification/',
  adminReviews: '/admin/reviews/',
  adminReviewDetail: '/admin/reviews/',
  adminCommunity: '/admin/community/',
  adminCommunityDetail: '/admin/community/',

  // NOT CONNECTED YET
  otpSend: null,
  otpVerify: null,
  otpLogin: null,
  googleLogin: null,
  resetPassword: null,

  customerProfile: null,
  notifications: null,
  adminStats: '/admin/stats/',
  adminUsers: '/admin/users/',
  adminUserDetail: '/admin/users/',
  verificationRequests: null,
};


function getToken() {
  return localStorage.getItem('workbridge_access_token');
}


function endpointTodo(name) {
  throw new Error(
    `TODO: confirm the Django endpoint for ${name} in API_ENDPOINTS.`
  );
}


// =========================================================
// MAIN API REQUEST
// =========================================================

export async function apiRequest(path, options = {}) {

  if (!path) {
    endpointTodo(options.endpointName || 'this request');
  }

  const {
    body,
    endpointName,
    pathSuffix = '',
    skipAuth = false,
    ...requestOptions
  } = options;

  const headers = new Headers(
    requestOptions.headers || {}
  );

  headers.set(
    'Accept',
    'application/json'
  );

  /*
   * IMPORTANT:
   *
   * If body is FormData:
   * - Do NOT set Content-Type manually.
   * - Do NOT JSON.stringify().
   *
   * The browser automatically creates:
   * multipart/form-data; boundary=...
   *
   * This is required for image uploads.
   */
  const isFormData =
    body instanceof FormData;

  if (
    body !== undefined &&
    !isFormData
  ) {
    headers.set(
      'Content-Type',
      'application/json'
    );
  }

  const token = getToken();

  if (
    token &&
    !skipAuth
  ) {
    headers.set(
      'Authorization',
      `Bearer ${token}`
    );
  }

  const response = await fetch(
    `${API_BASE_URL}${path}${pathSuffix}`,
    {
      ...requestOptions,
      headers,

      body:
        body === undefined
          ? undefined
          : isFormData
            ? body
            : JSON.stringify(body),
    }
  );

  const contentType =
    response.headers.get(
      'content-type'
    ) || '';

  const data =
    contentType.includes(
      'application/json'
    )
      ? await response.json()
      : await response.text();


  // =======================================================
  // ERROR HANDLING
  // =======================================================

  if (!response.ok) {

    let message =
      `API request failed (${response.status}).`;

    if (
      typeof data === 'object' &&
      data
    ) {

      if (data.detail) {
        message = data.detail;

      } else if (data.error) {
        message = data.error;

      } else if (
        data.non_field_errors?.length
      ) {
        message =
          data.non_field_errors[0];

      } else if (
        data.email?.length
      ) {
        message =
          data.email[0];

      } else if (
        data.profile_image?.length
      ) {
        message =
          data.profile_image[0];
      }
    }

    throw new Error(message);
  }

  return data;
}


// =========================================================
// REQUEST HELPER
// =========================================================

function request(
  name,
  options = {}
) {
  return apiRequest(
    API_ENDPOINTS[name],
    {
      ...options,
      endpointName: name,
    }
  );
}


// =========================================================
// QUERY STRING
// =========================================================

function queryString(filters) {

  const params =
    new URLSearchParams();

  Object.entries(
    filters || {}
  ).forEach(
    ([key, value]) => {

      if (
        value !== undefined &&
        value !== '' &&
        value !== false &&
        value !== null
      ) {
        params.set(
          key,
          value
        );
      }
    }
  );

  return params.toString()
    ? `?${params.toString()}`
    : '';
}


// =========================================================
// AUTH
// =========================================================

export const login = (
  payload
) =>
  request('login', {
    method: 'POST',
    body: payload,
    skipAuth: true,
  });


export const signup = (
  payload
) =>
  request('signup', {
    method: 'POST',
    body: payload,
    skipAuth: true,
  });


export const sendOTP = (
  payload
) =>
  request('otpSend', {
    method: 'POST',
    body: payload,
  });


export const verifyOTP = (
  payload
) =>
  request('otpVerify', {
    method: 'POST',
    body: payload,
  });


export const loginWithOTP = (
  payload
) =>
  request('otpLogin', {
    method: 'POST',
    body: payload,
  });


export const loginWithGoogle = (
  payload
) =>
  request('googleLogin', {
    method: 'POST',
    body: payload,
  });


export const loginAdmin = (
  payload
) =>
  request('login', {
    method: 'POST',
    body: {
      ...payload,
      role: 'admin',
    },
  });


export const forgotPassword = (
  payload
) =>
  request('forgotPassword', {
    method: 'POST',
    body: payload,
    skipAuth: true,
  });


export const resetPassword = (
  payload
) =>
  request('resetPassword', {
    method: 'POST',
    body: payload,
  });


// =========================================================
// WORKER PROFILE
// =========================================================

/*
 * Get logged-in worker profile
 */
export const getWorkerProfile = () =>
  request('workerProfile', {
    method: 'GET',
  });


/*
 * Create worker profile.
 *
 * `formData` can contain:
 * - title
 * - category
 * - experience_years
 * - about
 * - city
 * - area
 * - latitude
 * - longitude
 * - languages
 * - skills
 * - gender
 * - starting_price
 * - hourly_rate
 * - emergency_charge
 * - emergency_available
 * - working_days
 * - working_hours
 * - profile_image
 */
export const createWorkerProfile = (
  formData
) =>
  request('workerProfile', {
    method: 'POST',
    body: formData,
  });


/*
 * Update logged-in worker profile.
 *
 * Use FormData when uploading/changing image.
 */
export const updateWorkerProfile = (
  formData
) =>
  request('workerProfile', {
    method: 'PATCH',
    body: formData,
  });


/*
 * Delete worker profile image only.
 *
 * This sends a normal JSON PATCH request.
 */
export const removeWorkerProfileImage = () =>
  request('workerProfile', {
    method: 'PATCH',
    body: {
      profile_image: null,
    },
  });


// =========================================================
// WORKERS
// =========================================================

export const listWorkers = (
  filters = {}
) =>
  request('workers', {
    method: 'GET',
    pathSuffix:
      queryString(filters),
  });


export const getWorker = (
  id
) =>
  request('workers', {
    method: 'GET',
    pathSuffix:
      `${id}/`,
  });


export const getFeatured = () =>
  request('workers', {
    method: 'GET',
    pathSuffix:
      '?featured=true',
  });


export const getSimilarWorkers = (
  worker
) =>
  request('workers', {
    method: 'GET',
    pathSuffix:
      `?category=${encodeURIComponent(
        worker.category
      )}&exclude=${worker.id}`,
  });


export const getWorkersByCategory = (
  category
) =>
  listWorkers({
    category,
  });


// =========================================================
// SERVICES
// =========================================================

export const listServices = () =>
  request('services', {
    method: 'GET',
  });


export const createService = (
  payload
) =>
  request('services', {
    method: 'POST',
    body: payload,
  });


export const getService = (
  id
) =>
  request('services', {
    method: 'GET',
    pathSuffix:
      `${id}/`,
  });


export const updateService = (
  id,
  payload
) =>
  request('services', {
    method: 'PATCH',
    pathSuffix:
      `${id}/`,
    body: payload,
  });


export const deleteService = (
  id
) =>
  request('services', {
    method: 'DELETE',
    pathSuffix:
      `${id}/`,
  });


// =========================================================
// CUSTOMER
// =========================================================

export const getCustomerProfile = (
  id
) =>
  request('customerProfile', {
    method: 'GET',
    pathSuffix:
      id ? `/${id}` : '',
  });


export const getSavedWorkerIds = () =>
  request('customerProfile', {
    method: 'GET',
    pathSuffix:
      '/saved-workers',
  });


export const toggleSavedWorker = (
  id
) =>
  request('customerProfile', {
    method: 'POST',
    pathSuffix:
      '/saved-workers',
    body: {
      workerId: id,
    },
  });


export const getRecentSearches = () =>
  request('customerProfile', {
    method: 'GET',
    pathSuffix:
      '/recent-searches',
  });


// =========================================================
// BOOKINGS
// =========================================================

export const listBookings = (
  status
) =>
  request('bookings', {
    method: 'GET',
    pathSuffix:
      queryString({
        status,
      }),
  });


export const createBooking = (
  payload
) =>
  request('bookings', {
    method: 'POST',
    body: {
      ...payload,
      status: 'pending',
    },
  });


export const updateBookingStatus = (
  id,
  status
) =>
  request('bookingStatus', {
    method: 'PATCH',
    pathSuffix:
      `${id}/`,
    body: {
      status,
    },
  });


// =========================================================
// REVIEWS
// =========================================================

export const listReviews = (
  workerId
) =>
  request('reviews', {
    method: 'GET',
    pathSuffix:
      `${workerId}/reviews/`,
  });


export const createReview = (
  workerId,
  payload
) =>
  request('reviews', {
    method: 'POST',
    pathSuffix:
      `${workerId}/reviews/`,
    body: payload,
  });


// =========================================================
// COMMUNICATION
// =========================================================

export const listConversations = () =>
  request('conversations', {
    method: 'GET',
  });


export const listMessages = (
  conversationId
) =>
  request('messages', {
    method: 'GET',
    pathSuffix:
      `?conversation=${conversationId}`,
  });


export const sendMessage = (
  conversationId,
  text
) =>
  request('messages', {
    method: 'POST',
    body: {
      conversation: conversationId,
      text,
    },
  });


export const endConversation = (
  conversationId
) =>
  request('conversations', {
    method: 'PATCH',
    pathSuffix:
      `${conversationId}/`,
    body: {
      status: 'ended',
    },
  });


export const listNotifications = () =>
  request('notifications', {
    method: 'GET',
  });


// =========================================================
// ADMIN - COMMUNITY MANAGEMENT
// =========================================================

export const listAdminCommunity = (
  params = {}
) =>
  request('adminCommunity', {
    method: 'GET',
    pathSuffix:
      queryString(params),
  });


export const getAdminCommunity = (
  conversationId
) =>
  request('adminCommunityDetail', {
    method: 'GET',
    pathSuffix:
      `${conversationId}/`,
  });


export const updateAdminCommunity = (
  conversationId,
  payload
) =>
  request('adminCommunityDetail', {
    method: 'PATCH',
    pathSuffix:
      `${conversationId}/`,
    body: payload,
  });


// =========================================================
// ADMIN - REVIEWS
// =========================================================

export const listAdminReviews = (
  params = {}
) =>
  request('adminReviews', {
    method: 'GET',
    pathSuffix:
      queryString(params),
  });


export const getAdminReview = (
  reviewId
) =>
  request('adminReviewDetail', {
    method: 'GET',
    pathSuffix:
      `${reviewId}/`,
  });


export const deleteAdminReview = (
  reviewId
) =>
  request('adminReviewDetail', {
    method: 'DELETE',
    pathSuffix:
      `${reviewId}/`,
  });


// =========================================================
// ADMIN - BOOKINGS
// =========================================================

export const listAdminBookings = (
  params = {}
) => {

  const query =
    new URLSearchParams();

  if (params.search) {
    query.append(
      'search',
      params.search
    );
  }

  if (params.status) {
    query.append(
      'status',
      params.status
    );
  }

  if (params.date) {
    query.append(
      'date',
      params.date
    );
  }

  const suffix =
    query.toString()
      ? `?${query.toString()}`
      : '';

  return request(
    'adminBookings',
    {
      method: 'GET',
      pathSuffix: suffix,
    }
  );
};


// =========================================================
// ADMIN - CUSTOMERS
// =========================================================

export const listAdminCustomers = (
  params = {}
) => {

  const suffix =
    queryString(params);

  return request(
    'adminCustomers',
    {
      method: 'GET',
      pathSuffix: suffix,
    }
  );
};


export const getAdminCustomer = (
  customerId
) =>
  request('adminCustomerDetail', {
    method: 'GET',
    pathSuffix:
      `${customerId}/`,
  });


export const updateAdminCustomer = (
  customerId,
  payload
) =>
  request('adminCustomerDetail', {
    method: 'PATCH',
    pathSuffix:
      `${customerId}/`,
    body: payload,
  });


export const deleteAdminCustomer = (
  customerId
) =>
  request('adminCustomerDetail', {
    method: 'DELETE',
    pathSuffix:
      `${customerId}/`,
  });


// =========================================================
// ADMIN - BOOKING DETAIL
// =========================================================

export const getAdminBooking = (
  bookingId
) =>
  request('adminBookingDetail', {
    method: 'GET',
    pathSuffix:
      `${bookingId}/`,
  });


export const updateAdminBooking = (
  bookingId,
  payload
) =>
  request('adminBookingDetail', {
    method: 'PATCH',
    pathSuffix:
      `${bookingId}/`,
    body: payload,
  });


// =========================================================
// ADMIN - STATS
// =========================================================

export const getAdminStats = () =>
  request('adminStats', {
    method: 'GET',
  });


// =========================================================
// ADMIN - USERS
// =========================================================

export const listAdminUsers = (
  params = {}
) => {

  const query =
    new URLSearchParams();

  if (params.search) {
    query.append(
      'search',
      params.search
    );
  }

  if (params.role) {
    query.append(
      'role',
      params.role
    );
  }

  if (params.active) {
    query.append(
      'active',
      params.active
    );
  }

  const suffix =
    query.toString()
      ? `?${query.toString()}`
      : '';

  return request(
    'adminUsers',
    {
      method: 'GET',
      pathSuffix: suffix,
    }
  );
};


export const getAdminUser = (
  userId
) =>
  request('adminUserDetail', {
    method: 'GET',
    pathSuffix:
      `${userId}/`,
  });


export const updateAdminUser = (
  userId,
  payload
) =>
  request('adminUserDetail', {
    method: 'PATCH',
    pathSuffix:
      `${userId}/`,
    body: payload,
  });


export const deleteAdminUser = (
  userId
) =>
  request('adminUserDetail', {
    method: 'DELETE',
    pathSuffix:
      `${userId}/`,
  });


// =========================================================
// ADMIN - VERIFICATION
// =========================================================

export const listVerificationRequests = (
  params = {}
) =>
  request('adminVerification', {
    method: 'GET',
    pathSuffix:
      queryString(params),
  });


export const getVerificationWorker = (
  workerId
) =>
  request('adminVerificationDetail', {
    method: 'GET',
    pathSuffix:
      `${workerId}/`,
  });


export const updateVerification = (
  workerId,
  payload
) =>
  request('adminVerificationDetail', {
    method: 'PATCH',
    pathSuffix:
      `${workerId}/`,
    body: payload,
  });


// =========================================================
// ADMIN - WORKERS
// =========================================================

export const listAdminWorkers = (
  params = {}
) => {

  const query =
    new URLSearchParams();

  if (params.search) {
    query.append(
      'search',
      params.search
    );
  }

  if (params.category) {
    query.append(
      'category',
      params.category
    );
  }

  if (params.city) {
    query.append(
      'city',
      params.city
    );
  }

  if (params.active) {
    query.append(
      'active',
      params.active
    );
  }

  if (params.verification) {
    query.append(
      'verification',
      params.verification
    );
  }

  const suffix =
    query.toString()
      ? `?${query.toString()}`
      : '';

  return request(
    'adminWorkers',
    {
      method: 'GET',
      pathSuffix: suffix,
    }
  );
};


export const getAdminWorker = (
  workerId
) =>
  request('adminWorkerDetail', {
    method: 'GET',
    pathSuffix:
      `${workerId}/`,
  });


export const updateAdminWorker = (
  workerId,
  payload
) =>
  request('adminWorkerDetail', {
    method: 'PATCH',
    pathSuffix:
      `${workerId}/`,
    body: payload,
  });


// =========================================================
// CURRENT USER
// =========================================================

export function getCurrentUser() {

  try {

    const stored =
      localStorage.getItem(
        AUTH_STORAGE_KEY
      );

    return stored
      ? JSON.parse(stored)
      : null;

  } catch {
    return null;
  }
}


// =========================================================
// LOCAL LOGOUT HELPER
// =========================================================

export function logout() {

  localStorage.removeItem(
    AUTH_STORAGE_KEY
  );

  localStorage.removeItem(
    'workbridge_access_token'
  );

  localStorage.removeItem(
    'workbridge_refresh_token'
  );

  return Promise.resolve({
    success: true,
  });
}

