import * as api from '../api/api';

const STORAGE_KEY = 'workbridge_user';

function readStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStoredUser(user) {
  if (user) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(user)
    );
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function frontendRoleFromBackend(role) {
  if (role === 'WORKER') {
    return 'provider';
  }

  if (role === 'CUSTOMER') {
    return 'customer';
  }

  return role?.toLowerCase() || null;
}

function backendRoleFromFrontend(role) {
  if (role === 'provider') {
    return 'WORKER';
  }

  if (role === 'customer') {
    return 'CUSTOMER';
  }

  return role;
}


// ======================================================
// REAL DJANGO LOGIN
// ======================================================

export async function login({
  identifier,
  password,
  role,
}) {
  if (!identifier || !password) {
    throw new Error(
      'Enter your email and password.'
    );
  }

  const data = await api.login({
    email: identifier,
    password,
  });

  localStorage.setItem(
    'workbridge_access_token',
    data.access
  );

  localStorage.setItem(
    'workbridge_refresh_token',
    data.refresh
  );

  const userData = await api.apiRequest(
    '/auth/profile/',
    {
      method: 'GET',
    }
  );

  const user = {
    id: userData.id,
    email: userData.email,
    role: frontendRoleFromBackend(
      userData.role
    ),
  };

  // Prevent provider/customer login mix-up
  if (role && user.role !== role) {
    localStorage.removeItem(
      'workbridge_access_token'
    );

    localStorage.removeItem(
      'workbridge_refresh_token'
    );

    throw new Error(
      `This account is registered as a ${user.role}.`
    );
  }

  writeStoredUser(user);

  return user;
}


// ======================================================
// REAL DJANGO SIGNUP
// ======================================================

export async function signup({
  role,
  name,
  email,
  phone,
  password,
}) {
  if (!email || !password) {
    throw new Error(
      'Email and password are required.'
    );
  }

  const backendRole =
    backendRoleFromFrontend(role);

  const data = await api.signup({
    email,
    password,
    role: backendRole,
  });

  return {
    ...data,
    name,
    phone,
    role,
    requiresEmailVerification: true,
  };
}


// ======================================================
// FORGOT PASSWORD
// ======================================================

export async function forgotPassword({
  identifier,
}) {
  if (!identifier) {
    throw new Error(
      'Enter your registered email.'
    );
  }

  return api.forgotPassword({
    email: identifier,
  });
}


// ======================================================
// TEMPORARY MOCK FEATURES
// Backend not ready for these yet
// ======================================================

export async function sendOTP({ phone }) {
  if (!phone || phone.length < 10) {
    throw new Error(
      'Enter a valid 10-digit phone number.'
    );
  }

  return {
    success: true,
    demoOtp: '123456',
  };
}


export async function verifyOTP({
  phone,
  otp,
}) {
  if (otp !== '123456') {
    throw new Error(
      'Invalid OTP. Please try again.'
    );
  }

  return {
    success: true,
  };
}


export async function loginWithOTP({
  phone,
  role,
}) {
  throw new Error(
    'OTP login is not connected to the backend yet.'
  );
}


export async function loginWithGoogle({
  role,
}) {
  throw new Error(
    'Google login is not connected to the backend yet.'
  );
}


export async function loginAdmin({
  identifier,
  password,
}) {
  throw new Error(
    'Admin frontend login is not connected yet.'
  );
}


// ======================================================
// LOGOUT
// ======================================================

export async function logout() {
  const refreshToken =
    localStorage.getItem(
      'workbridge_refresh_token'
    );

  try {
    if (refreshToken) {
      await api.apiRequest(
        '/auth/logout/',
        {
          method: 'POST',
          body: {
            refresh: refreshToken,
          },
        }
      );
    }
  } finally {
    localStorage.removeItem(
      'workbridge_access_token'
    );

    localStorage.removeItem(
      'workbridge_refresh_token'
    );

    writeStoredUser(null);
  }

  return {
    success: true,
  };
}


// ======================================================
// CURRENT USER
// ======================================================

export function getCurrentUser() {
  return readStoredUser();
}