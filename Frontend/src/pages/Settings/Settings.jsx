
import { useState } from 'react';
import {
  User,
  Palette,
  Globe,
  Lock,
  Bell,
  Shield,
  MapPin,
  Loader2,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import * as api from '../../api/api';
import LocationMap from '../../components/common/LocationMap';

export default function Settings() {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    email: user?.email || '',
    language: user?.language || 'English',
    theme: user?.theme || 'light',
  });

  const [locationLoading, setLocationLoading] = useState(false);

  const [savedLatitude, setSavedLatitude] = useState(
    user?.latitude ?? null
  );

  const [savedLongitude, setSavedLongitude] = useState(
    user?.longitude ?? null
  );

  const [savedAddress, setSavedAddress] = useState(
    user?.address || ''
  );

  const [locationEnabled, setLocationEnabled] = useState(
    user?.latitude !== null &&
      user?.latitude !== undefined &&
      user?.longitude !== null &&
      user?.longitude !== undefined
  );

  const [notifications, setNotifications] = useState({
    bookingUpdates: true,
    messages: true,
    promotions: false,
  });

  const [showToast, setShowToast] = useState('');

  // -----------------------------------------
  // Toast
  // -----------------------------------------

  const displayToast = (message) => {
    setShowToast(message);

    setTimeout(() => {
      setShowToast('');
    }, 3000);
  };

  // -----------------------------------------
  // Form Change
  // -----------------------------------------

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // -----------------------------------------
  // Save Account Settings
  // -----------------------------------------

  const save = async () => {
    try {
      const response = await api.apiRequest(
        api.API_ENDPOINTS.profile,
        {
          method: 'PATCH',
          body: {
            email: formData.email,
          },
        }
      );

      console.log('Settings saved:', response);

      displayToast('Settings saved successfully.');
    } catch (error) {
      console.error('Settings save failed:', error);

      displayToast(
        error?.message || 'Failed to save settings.'
      );
    }
  };

  // -----------------------------------------
  // Reverse Geocoding
  // Coordinates -> Address
  // -----------------------------------------

  const getAddressFromCoordinates = async (
    latitude,
    longitude
  ) => {
    try {
      const url =
        'https://nominatim.openstreetmap.org/reverse' +
        `?format=jsonv2` +
        `&lat=${latitude}` +
        `&lon=${longitude}` +
        `&zoom=18` +
        `&addressdetails=1`;

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(
          'Failed to get address from location.'
        );
      }

      const data = await response.json();

      return data.display_name || '';
    } catch (error) {
      console.error(
        'Reverse geocoding failed:',
        error
      );

      return '';
    }
  };

  // -----------------------------------------
  // Get Current Location
  // -----------------------------------------

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      displayToast(
        'Geolocation is not supported by your browser.'
      );
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;

        try {
          // Get readable address
          const address =
            await getAddressFromCoordinates(
              latitude,
              longitude
            );

          const role = String(
            user?.role || ''
          ).toUpperCase();

          // -----------------------------------------
          // Worker
          // -----------------------------------------

          if (role === 'WORKER') {
            await api.apiRequest(
              api.API_ENDPOINTS.workerProfile,
              {
                method: 'PATCH',
                body: {
                  latitude,
                  longitude,
                },
              }
            );
          }

          // -----------------------------------------
          // Customer
          // -----------------------------------------

          else {
            await api.apiRequest(
              api.API_ENDPOINTS.profile,
              {
                method: 'PATCH',
                body: {
                  latitude,
                  longitude,
                  ...(address
                    ? { address }
                    : {}),
                },
              }
            );
          }

          // Update UI
          setSavedLatitude(latitude);
          setSavedLongitude(longitude);

          if (address) {
            setSavedAddress(address);
          }

          setLocationEnabled(true);

          displayToast(
            'Location saved successfully.'
          );
        } catch (error) {
          console.error(
            'Location update failed:',
            error
          );

          displayToast(
            error?.message ||
              'Failed to save your location.'
          );
        } finally {
          setLocationLoading(false);
        }
      },

      // -----------------------------------------
      // Geolocation Error
      // -----------------------------------------

      (error) => {
        console.error(
          'Geolocation error:',
          error
        );

        setLocationLoading(false);

        if (error.code === 1) {
          displayToast(
            'Location permission was denied.'
          );
        } else if (error.code === 2) {
          displayToast(
            'Your location could not be determined.'
          );
        } else if (error.code === 3) {
          displayToast(
            'Location request timed out.'
          );
        } else {
          displayToast(
            'Unable to get your current location.'
          );
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="space-y-6">

      {/* Toast */}
      {showToast && (
        <div className="fixed right-5 top-5 z-[9999] rounded-lg bg-navy-900 px-5 py-3 text-sm font-medium text-white shadow-lg">
          {showToast}
        </div>
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white">
          Settings
        </h1>

        <p className="mt-1 text-sm text-navy-500 dark:text-navy-300">
          Manage your account and preferences
        </p>
      </div>

      {/* =========================================
          ACCOUNT
      ========================================= */}

      <section className="rounded-xl border border-navy-200 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-900">

        <div className="mb-5 flex items-center gap-3">

          <div className="rounded-lg bg-navy-100 p-2 dark:bg-navy-800">
            <User className="h-5 w-5 text-navy-700 dark:text-white" />
          </div>

          <div>
            <h2 className="font-semibold text-navy-900 dark:text-white">
              Account
            </h2>

            <p className="text-sm text-navy-500 dark:text-navy-400">
              Manage your account information
            </p>
          </div>

        </div>

        <div className="grid gap-5 md:grid-cols-2">

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-medium text-navy-700 dark:text-navy-300">
              Email
            </label>

            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                handleChange(
                  'email',
                  e.target.value
                )
              }
              className="input w-full"
            />
          </div>

          {/* Role */}
          <div>
            <label className="mb-2 block text-sm font-medium text-navy-700 dark:text-navy-300">
              Role
            </label>

            <input
              type="text"
              value={user?.role || ''}
              disabled
              className="input w-full opacity-70"
            />
          </div>

        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={save}
            className="btn-primary px-5 py-2.5 text-sm"
          >
            Save Changes
          </button>
        </div>

      </section>

      {/* =========================================
          APPEARANCE
      ========================================= */}

      <section className="rounded-xl border border-navy-200 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-900">

        <div className="mb-5 flex items-center gap-3">

          <div className="rounded-lg bg-navy-100 p-2 dark:bg-navy-800">
            <Palette className="h-5 w-5 text-navy-700 dark:text-white" />
          </div>

          <div>
            <h2 className="font-semibold text-navy-900 dark:text-white">
              Appearance
            </h2>

            <p className="text-sm text-navy-500 dark:text-navy-400">
              Customize how WorkBridge looks
            </p>
          </div>

        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-navy-700 dark:text-navy-300">
            Theme
          </label>

          <select
            value={formData.theme}
            onChange={(e) =>
              handleChange(
                'theme',
                e.target.value
              )
            }
            className="input w-full md:w-72"
          >
            <option value="light">
              Light
            </option>

            <option value="dark">
              Dark
            </option>

            <option value="system">
              System Default
            </option>
          </select>
        </div>

      </section>

      {/* =========================================
          LANGUAGE
      ========================================= */}

      <section className="rounded-xl border border-navy-200 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-900">

        <div className="mb-5 flex items-center gap-3">

          <div className="rounded-lg bg-navy-100 p-2 dark:bg-navy-800">
            <Globe className="h-5 w-5 text-navy-700 dark:text-white" />
          </div>

          <div>
            <h2 className="font-semibold text-navy-900 dark:text-white">
              Language
            </h2>

            <p className="text-sm text-navy-500 dark:text-navy-400">
              Choose your preferred language
            </p>
          </div>

        </div>

        <select
          value={formData.language}
          onChange={(e) =>
            handleChange(
              'language',
              e.target.value
            )
          }
          className="input w-full md:w-72"
        >
          <option value="English">
            English
          </option>

          <option value="Hindi">
            Hindi
          </option>

          <option value="Marathi">
            Marathi
          </option>
        </select>

      </section>

      {/* =========================================
          PRIVACY & LOCATION
      ========================================= */}

      <section className="rounded-xl border border-navy-200 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-900">

        <div className="mb-5 flex items-center gap-3">

          <div className="rounded-lg bg-navy-100 p-2 dark:bg-navy-800">
            <Shield className="h-5 w-5 text-navy-700 dark:text-white" />
          </div>

          <div>
            <h2 className="font-semibold text-navy-900 dark:text-white">
              Privacy & Location
            </h2>

            <p className="text-sm text-navy-500 dark:text-navy-400">
              Manage your location and privacy settings
            </p>
          </div>

        </div>

        <div className="rounded-lg border border-navy-200 p-4 dark:border-navy-700">

          <div className="flex items-start gap-3">

            <MapPin className="mt-1 h-5 w-5 text-navy-600 dark:text-navy-300" />

            <div className="flex-1">

              <h3 className="font-medium text-navy-900 dark:text-white">
                Current Location
              </h3>

              <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">
                Use your device location to help WorkBridge find nearby services and workers.
              </p>

              {/* Location Button */}
              <button
                type="button"
                onClick={useCurrentLocation}
                disabled={locationLoading}
                className="btn-outline mt-3 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                {locationLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Getting Location...
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4" />
                    Use Current Location
                  </>
                )}
              </button>

              {/* Saved Location */}
              {locationEnabled &&
                !locationLoading && (
                  <div className="mt-4">

                    <p className="text-xs font-medium text-secondary-600 dark:text-secondary-400">
                      ✓ Location is saved
                    </p>

                    {/* Address */}
                    {savedAddress && (
                      <div className="mt-2 rounded-lg bg-navy-50 p-3 text-sm text-navy-700 dark:bg-navy-800 dark:text-navy-300">

                        <strong>
                          Address:
                        </strong>{' '}

                        {savedAddress}

                      </div>
                    )}

                    {/* Map */}
                    <div className="mt-4">

                      <LocationMap
                        latitude={
                          savedLatitude
                        }
                        longitude={
                          savedLongitude
                        }
                        address={
                          savedAddress
                        }
                        height="350px"
                      />

                    </div>

                  </div>
                )}

            </div>

          </div>

        </div>

      </section>

      {/* =========================================
          NOTIFICATIONS
      ========================================= */}

      <section className="rounded-xl border border-navy-200 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-900">

        <div className="mb-5 flex items-center gap-3">

          <div className="rounded-lg bg-navy-100 p-2 dark:bg-navy-800">
            <Bell className="h-5 w-5 text-navy-700 dark:text-white" />
          </div>

          <div>
            <h2 className="font-semibold text-navy-900 dark:text-white">
              Notifications
            </h2>

            <p className="text-sm text-navy-500 dark:text-navy-400">
              Choose which notifications you receive
            </p>
          </div>

        </div>

        <div className="space-y-4">

          {/* Booking Updates */}
          <label className="flex items-center justify-between gap-4">

            <div>
              <p className="font-medium text-navy-900 dark:text-white">
                Booking Updates
              </p>

              <p className="text-sm text-navy-500 dark:text-navy-400">
                Receive updates about your bookings
              </p>
            </div>

            <input
              type="checkbox"
              checked={
                notifications.bookingUpdates
              }
              onChange={(e) =>
                setNotifications((prev) => ({
                  ...prev,
                  bookingUpdates:
                    e.target.checked,
                }))
              }
              className="h-4 w-4"
            />

          </label>

          {/* Messages */}
          <label className="flex items-center justify-between gap-4">

            <div>
              <p className="font-medium text-navy-900 dark:text-white">
                Messages
              </p>

              <p className="text-sm text-navy-500 dark:text-navy-400">
                Receive notifications for new messages
              </p>
            </div>

            <input
              type="checkbox"
              checked={
                notifications.messages
              }
              onChange={(e) =>
                setNotifications((prev) => ({
                  ...prev,
                  messages:
                    e.target.checked,
                }))
              }
              className="h-4 w-4"
            />

          </label>

          {/* Promotions */}
          <label className="flex items-center justify-between gap-4">

            <div>
              <p className="font-medium text-navy-900 dark:text-white">
                Promotions
              </p>

              <p className="text-sm text-navy-500 dark:text-navy-400">
                Receive promotional notifications
              </p>
            </div>

            <input
              type="checkbox"
              checked={
                notifications.promotions
              }
              onChange={(e) =>
                setNotifications((prev) => ({
                  ...prev,
                  promotions:
                    e.target.checked,
                }))
              }
              className="h-4 w-4"
            />

          </label>

        </div>

      </section>

      {/* =========================================
          SECURITY
      ========================================= */}

      <section className="rounded-xl border border-navy-200 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-900">

        <div className="mb-5 flex items-center gap-3">

          <div className="rounded-lg bg-navy-100 p-2 dark:bg-navy-800">
            <Lock className="h-5 w-5 text-navy-700 dark:text-white" />
          </div>

          <div>
            <h2 className="font-semibold text-navy-900 dark:text-white">
              Security
            </h2>

            <p className="text-sm text-navy-500 dark:text-navy-400">
              Manage your account security
            </p>
          </div>

        </div>

        <button
          type="button"
          className="btn-outline px-4 py-2 text-sm"
        >
          Change Password
        </button>

      </section>

    </div>
  );
}
