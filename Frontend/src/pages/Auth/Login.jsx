
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import * as api from '../../api/api';

const PROFILE_IMAGE_DB = 'workbridge_profile_images';
const PROFILE_IMAGE_STORE = 'images';
const PROFILE_IMAGE_KEY = 'pending_worker_profile_image';

// ======================================================
// GET PENDING PROFILE IMAGE FROM INDEXED DB
// ======================================================

function openProfileImageDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(
      PROFILE_IMAGE_DB,
      1
    );

    request.onupgradeneeded = () => {
      const db = request.result;

      if (
        !db.objectStoreNames.contains(
          PROFILE_IMAGE_STORE
        )
      ) {
        db.createObjectStore(
          PROFILE_IMAGE_STORE
        );
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(
        request.error ||
          new Error(
            'Unable to open image storage.'
          )
      );
    };
  });
}


async function getPendingProfileImage() {
  try {
    const db =
      await openProfileImageDB();

    return new Promise((resolve) => {
      const transaction =
        db.transaction(
          PROFILE_IMAGE_STORE,
          'readonly'
        );

      const store =
        transaction.objectStore(
          PROFILE_IMAGE_STORE
        );

      const request =
        store.get(
          PROFILE_IMAGE_KEY
        );

      request.onsuccess = () => {
        const file = request.result;

        db.close();

        resolve(file || null);
      };

      request.onerror = () => {
        db.close();
        resolve(null);
      };
    });
  } catch {
    return null;
  }
}


async function removePendingProfileImage() {
  try {
    const db =
      await openProfileImageDB();

    return new Promise((resolve) => {
      const transaction =
        db.transaction(
          PROFILE_IMAGE_STORE,
          'readwrite'
        );

      const store =
        transaction.objectStore(
          PROFILE_IMAGE_STORE
        );

      const request =
        store.delete(
          PROFILE_IMAGE_KEY
        );

      request.onsuccess = () => {
        db.close();
        resolve();
      };

      request.onerror = () => {
        db.close();
        resolve();
      };
    });
  } catch {
    return;
  }
}


// ======================================================
// LOGIN
// ======================================================

export default function Login() {
  const { role } = useParams();

  const isProvider =
    role === 'provider';

  useDocumentTitle(
    isProvider
      ? 'Provider Login'
      : 'Customer Login'
  );

  const { login } = useAuth();

  const { showToast } =
    useApp();

  const navigate =
    useNavigate();

  const [identifier, setIdentifier] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [showPass, setShowPass] =
    useState(false);

  const [error, setError] =
    useState('');

  const [loading, setLoading] =
    useState(false);


  // ======================================================
  // SUBMIT LOGIN
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {

      // --------------------------------------------------
      // LOGIN
      // --------------------------------------------------

      await login({
        identifier,
        password,
        role,
      });


      // --------------------------------------------------
      // CREATE PENDING WORKER PROFILE
      // --------------------------------------------------

      if (isProvider) {

        const pendingRaw =
          localStorage.getItem(
            'workbridge_pending_worker_profile'
          );


        if (pendingRaw) {

          const pendingProfile =
            JSON.parse(
              pendingRaw
            );


          try {

            // --------------------------------------------
            // Get profile image from IndexedDB
            // --------------------------------------------

            const profileImage =
              await getPendingProfileImage();


            // --------------------------------------------
            // Build multipart form data
            // --------------------------------------------

            const formData =
              new FormData();


            // --------------------------------------------
            // Text fields
            // --------------------------------------------

            if (
              pendingProfile.title !==
              undefined
            ) {
              formData.append(
                'title',
                pendingProfile.title
              );
            }


            if (
              pendingProfile.category !==
              undefined
            ) {
              formData.append(
                'category',
                pendingProfile.category
              );
            }


            if (
              pendingProfile.experience_years !==
              undefined
            ) {
              formData.append(
                'experience_years',
                String(
                  pendingProfile.experience_years
                )
              );
            }


            if (
              pendingProfile.about !==
              undefined
            ) {
              formData.append(
                'about',
                pendingProfile.about
              );
            }


            if (
              pendingProfile.city !==
              undefined
            ) {
              formData.append(
                'city',
                pendingProfile.city
              );
            }


            if (
              pendingProfile.area !==
              undefined
            ) {
              formData.append(
                'area',
                pendingProfile.area
              );
            }


            if (
              pendingProfile.starting_price !==
              undefined
            ) {
              formData.append(
                'starting_price',
                String(
                  pendingProfile.starting_price
                )
              );
            }


            if (
              pendingProfile.hourly_rate !==
              undefined &&
              pendingProfile.hourly_rate !==
              null &&
              pendingProfile.hourly_rate !==
              ''
            ) {
              formData.append(
                'hourly_rate',
                String(
                  pendingProfile.hourly_rate
                )
              );
            }


            if (
              pendingProfile.emergency_charge !==
              undefined &&
              pendingProfile.emergency_charge !==
              null &&
              pendingProfile.emergency_charge !==
              ''
            ) {
              formData.append(
                'emergency_charge',
                String(
                  pendingProfile.emergency_charge
                )
              );
            }


            formData.append(
              'emergency_available',
              pendingProfile.emergency_available
                ? 'true'
                : 'false'
            );


            if (
              pendingProfile.working_hours !==
              undefined
            ) {
              formData.append(
                'working_hours',
                pendingProfile.working_hours
              );
            }


            // --------------------------------------------
            // JSON fields
            // --------------------------------------------

            formData.append(
              'languages',
              JSON.stringify(
                Array.isArray(
                  pendingProfile.languages
                )
                  ? pendingProfile.languages
                  : []
              )
            );


            formData.append(
              'working_days',
              JSON.stringify(
                Array.isArray(
                  pendingProfile.working_days
                )
                  ? pendingProfile.working_days
                  : []
              )
            );


            // --------------------------------------------
            // Skills
            // --------------------------------------------

            if (
              Array.isArray(
                pendingProfile.skills
              )
            ) {

              pendingProfile.skills.forEach(
                (skill) => {
                  formData.append(
                    'skills',
                    skill
                  );
                }
              );

            }


            // --------------------------------------------
            // PROFILE IMAGE
            // --------------------------------------------

            if (profileImage) {

              formData.append(
                'profile_image',
                profileImage,
                profileImage.name ||
                  'profile-image.jpg'
              );

            }


            // --------------------------------------------
            // SEND PROFILE TO DJANGO
            // --------------------------------------------

            await api.createWorkerProfile(
              formData
            );


            // --------------------------------------------
            // CLEAN TEMPORARY DATA
            // --------------------------------------------

            localStorage.removeItem(
              'workbridge_pending_worker_profile'
            );

            await removePendingProfileImage();


            showToast(
              'Professional profile created successfully!'
            );

          } catch (profileError) {

            console.error(
              'Worker profile creation failed:',
              profileError
            );


            if (
              profileError.message
                ?.toLowerCase()
                .includes(
                  'already exists'
                )
            ) {

              localStorage.removeItem(
                'workbridge_pending_worker_profile'
              );

              await removePendingProfileImage();

            } else {

              throw new Error(
                `Login successful, but profile creation failed: ${profileError.message}`
              );

            }
          }
        }
      }


      // --------------------------------------------------
      // LOGIN SUCCESS
      // --------------------------------------------------

      showToast(
        'Welcome back!'
      );


      navigate(
        isProvider
          ? '/dashboard/provider'
          : '/dashboard/customer'
      );

    } catch (err) {

      console.error(
        'Login failed:',
        err
      );

      setError(
        err?.message ||
          'Unable to login.'
      );

    } finally {

      setLoading(false);

    }
  };


  return (
    <div>

      <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white">
        {isProvider
          ? 'Welcome Back, Professional'
          : 'Welcome Back'}
      </h1>


      <p className="text-navy-500 dark:text-navy-400 mt-2">
        Log in to continue to WorkBridge.
      </p>


      {error && (
        <div className="mt-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm px-4 py-2.5">
          {error}
        </div>
      )}


      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4"
      >

        <div>

          <label className="label">
            Email
          </label>

          <input
            type="email"
            className="input"
            value={identifier}
            onChange={(e) =>
              setIdentifier(
                e.target.value
              )
            }
            placeholder="you@example.com"
            required
          />

        </div>


        <div>

          <div className="flex items-center justify-between">

            <label className="label">
              Password
            </label>

            <Link
              to={`/forgot-password/${role}`}
              className="text-xs font-medium text-primary-600 hover:text-primary-700 mb-1.5"
            >
              Forgot Password?
            </Link>

          </div>


          <div className="relative">

            <input
              type={
                showPass
                  ? 'text'
                  : 'password'
              }
              className="input pr-10"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              placeholder="••••••••"
              required
            />


            <button
              type="button"
              onClick={() =>
                setShowPass(
                  (s) => !s
                )
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400"
              aria-label="Toggle password visibility"
            >
              {showPass ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>

          </div>

        </div>


        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-2.5"
        >

          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Login'
          )}

        </button>

      </form>


      <p className="text-sm text-navy-500 dark:text-navy-400 text-center mt-6">

        Don't have an account?{' '}

        <Link
          to={`/signup/${role}`}
          className="font-semibold text-primary-600 hover:text-primary-700"
        >
          Create{' '}
          {isProvider
            ? 'Professional'
            : 'Customer'}{' '}
          Account
        </Link>

      </p>


      <Link
        to={`/login/${
          isProvider
            ? 'customer'
            : 'provider'
        }`}
        className="block text-center text-sm font-medium text-navy-500 dark:text-navy-400 hover:text-navy-700 mt-3"
      >
        {isProvider
          ? 'Login as Customer'
          : 'Login as Service Provider'}
      </Link>

    </div>
  );
}
