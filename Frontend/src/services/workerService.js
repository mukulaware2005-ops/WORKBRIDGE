import {
  WORKERS,
  getWorkerById as _byId,
  getWorkersByCategory as _byCategory,
  getFeaturedWorkers as _featured
} from '../data/workers';

import { getReviewsByWorker } from '../data/bookings';
import * as api from '../api/api';

const wait = (ms = 400) =>
  new Promise((res) => setTimeout(res, ms));


// ======================================================
// WORKER LIST
// ======================================================

export async function listWorkers(filters = {}) {
  const backendFilters = {};

  // ====================================================
  // EXISTING FILTERS
  // ====================================================

  if (filters.category) {
    backendFilters.category = filters.category;
  }

  if (filters.city) {
    backendFilters.city = filters.city;
  }

  if (filters.query) {
    backendFilters.query = filters.query;
  }

  if (filters.emergency) {
    backendFilters.emergency = 'true';
  }

  if (filters.maxPrice) {
    backendFilters.max_price = filters.maxPrice;
  }

  if (filters.skill) {
    backendFilters.skill = filters.skill;
  }


  // ====================================================
  // LOCATION FILTERS
  // ====================================================

  if (
    filters.latitude !== null &&
    filters.latitude !== undefined
  ) {
    backendFilters.latitude = filters.latitude;
  }

  if (
    filters.longitude !== null &&
    filters.longitude !== undefined
  ) {
    backendFilters.longitude = filters.longitude;
  }

  if (
    filters.radius !== null &&
    filters.radius !== undefined
  ) {
    backendFilters.radius = filters.radius;
  }


  // ====================================================
  // CALL DJANGO API
  // ====================================================

  const profiles =
    await api.listWorkers(backendFilters);


  // ====================================================
  // MAP BACKEND DATA
  // ====================================================

  let results =
    profiles.map(mapBackendWorker);


  // ====================================================
  // FRONTEND GENDER FILTER
  // ====================================================

  if (filters.gender) {
    results = results.filter(
      (w) =>
        w.gender === filters.gender
    );
  }


  // ====================================================
  // FRONTEND RATING FILTER
  // ====================================================

  if (
    filters.minRating &&
    Number(filters.minRating) > 0
  ) {
    results = results.filter(
      (w) =>
        w.rating >=
        Number(filters.minRating)
    );
  }


  // ====================================================
  // VERIFIED FILTER
  // ====================================================

  if (filters.verifiedOnly) {
    results = results.filter(
      (w) =>
        w.verified?.identity ||
        w.verified?.police ||
        w.verified?.certificate ||
        w.verified?.phone
    );
  }


  // ====================================================
  // EXPERIENCE SORT
  // ====================================================

  if (filters.sortBy === 'experience') {
    results.sort(
      (a, b) =>
        b.experienceYears -
        a.experienceYears
    );
  }


  // ====================================================
  // PRICE SORT
  // ====================================================

  else if (filters.sortBy === 'price') {
    results.sort(
      (a, b) =>
        a.startingPrice -
        b.startingPrice
    );
  }


  // ====================================================
  // RATING SORT
  // ====================================================

  else if (filters.sortBy === 'rating') {
    results.sort(
      (a, b) =>
        b.rating - a.rating
    );
  }


  // ====================================================
  // DISTANCE SORT
  // ====================================================

  else if (filters.sortBy === 'distance') {
    results.sort(
      (a, b) =>
        a.distanceKm -
        b.distanceKm
    );
  }


  return results;
}


// ======================================================
// SINGLE WORKER
// ======================================================

export async function getWorker(id) {
  const data =
    await api.getWorker(id);

  const profile =
    data.worker || data;

  const worker =
    mapBackendWorker(profile);

  return {
    ...worker,

    rating:
      Number(data.rating) || 0,

    reviewsCount:
      Number(data.reviews_count) || 0,

    services:
      Array.isArray(data.services)
        ? data.services
        : [],

    reviews:
      Array.isArray(data.reviews)
        ? data.reviews.map(
            (review) => ({
              id: review.id,
              rating: review.rating,
              comment: review.comment,
              customerEmail:
                review.customer_email,
              createdAt:
                review.created_at,
            })
          )
        : [],
  };
}


// ======================================================
// FEATURED / SIMILAR
// ======================================================

export async function getFeatured() {
  const workers =
    await listWorkers();

  return workers
    .filter(
      (worker) =>
        worker.featured
    )
    .slice(0, 6);
}


export async function getSimilarWorkers(
  worker
) {
  await wait(250);

  return WORKERS
    .filter(
      (w) =>
        w.category ===
          worker.category &&
        w.id !== worker.id
    )
    .slice(0, 4);
}


export const getWorkersByCategory =
  _byCategory;


// ======================================================
// MAP DJANGO WORKER PROFILE
// TO FRONTEND FORMAT
// ======================================================

function mapBackendWorker(profile) {
  const emailName =
    profile.email?.split('@')[0] ||
    'Professional';

  const displayName =
    emailName;


  // ====================================================
  // PROFILE IMAGE
  // ====================================================

  let profileImage =
    profile.profile_image || null;

  if (
    profileImage &&
    profileImage.startsWith('/')
  ) {
    profileImage =
      `http://127.0.0.1:8000${profileImage}`;
  }


  // ====================================================
  // VERIFICATION
  // ====================================================

  const verified = {
    identity: Boolean(
      profile.is_identity_verified
    ),

    police: Boolean(
      profile.is_police_verified
    ),

    certificate: Boolean(
      profile.is_certificate_verified
    ),

    phone: Boolean(
      profile.is_phone_verified
    ),
  };


  const verificationCount =
    Object.values(verified)
      .filter(Boolean)
      .length;


  // ====================================================
  // RETURN FRONTEND WORKER
  // ====================================================

  return {
    id: String(profile.id),

    name: displayName,

    avatar: displayName
      .split(' ')
      .map(
        (part) =>
          part[0]
      )
      .slice(0, 2)
      .join('')
      .toUpperCase(),

    profileImage,

    title:
      profile.title || '',

    category:
      profile.category || '',

    city:
      profile.city || '',

    area:
      profile.area || '',


    // ==================================================
    // LOCATION
    // ==================================================

    latitude:
      profile.latitude !== null &&
      profile.latitude !== undefined
        ? Number(profile.latitude)
        : null,

    longitude:
      profile.longitude !== null &&
      profile.longitude !== undefined
        ? Number(profile.longitude)
        : null,

    distanceKm:
      profile.distance_km !== null &&
      profile.distance_km !== undefined
        ? Number(profile.distance_km)
        : null,


    // ==================================================
    // PRICING / RATING
    // ==================================================

    rating:
      Number(profile.rating) || 0,

    reviewsCount:
      Number(
        profile.reviews_count
      ) || 0,

    experienceYears:
      Number(
        profile.experience_years
      ) || 0,

    startingPrice:
      Number(
        profile.starting_price
      ) || 0,

    hourlyRate:
      profile.hourly_rate !== null &&
      profile.hourly_rate !== undefined
        ? Number(
            profile.hourly_rate
          )
        : null,

    emergencyCharge:
      profile.emergency_charge !== null &&
      profile.emergency_charge !== undefined
        ? Number(
            profile.emergency_charge
          )
        : null,

    emergencyAvailable:
      Boolean(
        profile.emergency_available
      ),

    availableToday:
      false,


    // ==================================================
    // VERIFICATION
    // ==================================================

    verified,

    trustScore:
      Math.round(
        (verificationCount / 4) * 100
      ),


    // ==================================================
    // PROFILE
    // ==================================================

    gender:
      profile.gender || '',

    languages:
      Array.isArray(
        profile.languages
      )
        ? profile.languages
        : [],

    about:
      profile.about || '',

    premium:
      Boolean(
        profile.is_premium
      ),

    featured:
      Boolean(
        profile.is_featured
      ),

    recommended:
      Boolean(
        profile.recommended
      ),


    // ==================================================
    // OTHER DATA
    // ==================================================

    skills:
      Array.isArray(
        profile.skills
      )
        ? profile.skills
        : [],

    badges: [],

    reviews: [],

    workingDays:
      Array.isArray(
        profile.working_days
      )
        ? profile.working_days
        : [],

    workingHours:
      profile.working_hours ||
      'Not added yet',

    coverColor:
      'from-primary-500 to-secondary-500',
  };
}


// ======================================================
// LOGGED-IN WORKER PROFILE
// ======================================================

export async function getWorkerProfile() {
  const profile =
    await api.apiRequest(
      api.API_ENDPOINTS.workerProfile,
      {
        method: 'GET',
      }
    );

  return mapBackendWorker(
    profile
  );
}


// ======================================================
// UPDATE WORKER LOCATION
// ======================================================

export async function updateWorkerLocation(
  latitude,
  longitude
) {
  const profile =
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

  return mapBackendWorker(
    profile
  );
}