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
// ======================================================

export async function listWorkers(filters = {}) {
  const backendFilters = {};

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

  const profiles = await api.listWorkers(
    backendFilters
  );

  let results = profiles.map(
    mapBackendWorker
  );

  // These filters are still frontend-only for now.
  if (filters.gender) {
    results = results.filter(
      (w) => w.gender === filters.gender
    );
  }

  if (filters.sortBy === 'experience') {
    results.sort(
      (a, b) =>
        b.experienceYears -
        a.experienceYears
    );
  }

  else if (filters.sortBy === 'price') {
    results.sort(
      (a, b) =>
        a.startingPrice -
        b.startingPrice
    );
  }

  return results;
}


export async function getWorker(id) {
  const data = await api.getWorker(id);

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
        ? data.reviews.map((review) => ({
            id: review.id,
            rating: review.rating,
            comment: review.comment,
            customerEmail:
              review.customer_email,
            createdAt:
              review.created_at,
          }))
        : [],
  };
}


export async function getFeatured() {
  await wait(300);

  return _featured();
}


export async function getSimilarWorkers(worker) {
  await wait(250);

  return WORKERS
    .filter(
      (w) =>
        w.category === worker.category &&
        w.id !== worker.id
    )
    .slice(0, 4);
}


export const getWorkersByCategory = _byCategory;


// ======================================================
// REAL DJANGO WORKER PROFILE
// ======================================================

function mapBackendWorker(profile) {
  const emailName =
  profile.email?.split('@')[0] ||
  'Professional';

  const displayName = emailName;


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

  return {
    id: String(profile.id),

    name: displayName,

    avatar: displayName
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase(),

    title:
      profile.title || '',

    category:
      profile.category || '',

    city:
      profile.city || '',

    area:
      profile.area || '',

    distanceKm: 0,

    rating:
      Number(profile.rating
      ) || 0,

    reviewsCount:
      Number(profile.reviews_count
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
        ? Number(profile.hourly_rate)
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

    availableToday: false,

    verified,

    trustScore:
      Math.round(
        (verificationCount / 4) *
          100
      ),

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

    // Not connected to Django yet
    skills:
      Array.isArray(profile.skills)
        ? profile.skills
        : [],
    badges: [],
    reviews: [],

    workingDays:
      Array.isArray(profile.working_days)
        ? profile.working_days
        : [],

    workingHours:
      profile.working_hours ||
      'Not added yet',

    coverColor:
      'from-primary-500 to-secondary-500',
  };
}


// Logged-in provider's real profile
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