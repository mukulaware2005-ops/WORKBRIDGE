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
  workers:'/auth/workers/',
  reviews: '/auth/workers/',


  // NOT CONNECTED YET
  otpSend: null,
  otpVerify: null,
  otpLogin: null,
  googleLogin: null,
  resetPassword: null,

  customerProfile: null,
  bookings: '/bookings/',
  bookingStatus: '/bookings/',
  conversations: '/conversations/',
  messages: '/messages/',
  notifications: null,
  adminStats: null,
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

  headers.set('Accept', 'application/json');

  if (body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getToken();

  if (token && !skipAuth) {
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
          : JSON.stringify(body),
    }
  );

  const contentType =
    response.headers.get('content-type') || '';

  const data = contentType.includes(
    'application/json'
  )
    ? await response.json()
    : await response.text();

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
        message = data.email[0];
      }
    }

    throw new Error(message);
  }

  return data;
}

function request(name, options = {}) {
  return apiRequest(
    API_ENDPOINTS[name],
    {
      ...options,
      endpointName: name,
    }
  );
}

function queryString(filters) {
  const params = new URLSearchParams();

  Object.entries(
    filters || {}
  ).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== '' &&
      value !== false &&
      value !== null
    ) {
      params.set(key, value);
    }
  });

  return params.toString()
    ? `?${params.toString()}`
    : '';
}


// AUTH

export const login = (payload) =>
  request('login', {
    method: 'POST',
    body: payload,
    skipAuth: true,
  });

export const signup = (payload) =>
  request('signup', {
    method: 'POST',
    body: payload,
    skipAuth: true,
  });

export const sendOTP = (payload) =>
  request('otpSend', {
    method: 'POST',
    body: payload,
  });

export const verifyOTP = (payload) =>
  request('otpVerify', {
    method: 'POST',
    body: payload,
  });

export const loginWithOTP = (payload) =>
  request('otpLogin', {
    method: 'POST',
    body: payload,
  });

export const loginWithGoogle = (payload) =>
  request('googleLogin', {
    method: 'POST',
    body: payload,
  });

export const loginAdmin = (payload) =>
  request('login', {
    method: 'POST',
    body: {
      ...payload,
      role: 'admin',
    },
  });

export const forgotPassword = (payload) =>
  request('forgotPassword', {
    method: 'POST',
    body: payload,
    skipAuth: true,
  });

export const resetPassword = (payload) =>
  request('resetPassword', {
    method: 'POST',
    body: payload,
  });


// WORKERS

export const listWorkers = (
  filters = {}
) =>
  request('workers', {
    method: 'GET',
    pathSuffix:
      queryString(filters),
  });

export const getWorker = (id) =>
  request('workers', {
    method: 'GET',
    pathSuffix: `${id}/`,
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






// SERVICES

export const listServices = () =>
  request('services', {
    method: 'GET',
  });

export const createService = (payload) =>
  request('services', {
    method: 'POST',
    body: payload,
  });

export const getService = (id) =>
  request('services', {
    method: 'GET',
    pathSuffix: `${id}/`,
  });

export const updateService = (
  id,
  payload
) =>
  request('services', {
    method: 'PATCH',
    pathSuffix: `${id}/`,
    body: payload,
  });

export const deleteService = (id) =>
  request('services', {
    method: 'DELETE',
    pathSuffix: `${id}/`,
  });




// CUSTOMER

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



// BOOKINGS

export const listBookings = (status) =>
  request('bookings', {
    method: 'GET',
    pathSuffix: queryString({
      status,
    }),
  });


export const createBooking = (payload) =>
  request('bookings', {
    method: 'POST',
    body: {
      ...payload,
      status: 'pending',
    },
  });


export const updateBookingStatus = (id, status) =>
  request('bookingStatus', {
    method: 'PATCH',
    pathSuffix: `${id}/`,
    body: {
      status,
    },
  });




// REVIEWS

export const listReviews = (workerId) =>
  request('reviews', {
    method: 'GET',
    pathSuffix: `${workerId}/reviews/`,
  });

export const createReview = (
  workerId,
  payload
) =>
  request('reviews', {
    method: 'POST',
    pathSuffix: `${workerId}/reviews/`,
    body: payload,
  });



// COMMUNICATION

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
    pathSuffix: `${conversationId}/`,
    body: {
      status: 'ended',
    },
  });


export const listNotifications = () =>
  request('notifications', {
    method: 'GET',
  });



// ADMIN

export const getAdminStats = () =>
  request('adminStats', {
    method: 'GET',
  });

export const listVerificationRequests =
  () =>
    request(
      'verificationRequests',
      {
        method: 'GET',
      }
    );


// CURRENT USER

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


// LOCAL LOGOUT HELPER

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