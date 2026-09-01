import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import {
  MapPin,
  Star,
  Briefcase,
  MessageCircle,
  Phone,
  Heart,
  Share2,
  Download,
  FileCheck2,
  Users as UsersIcon,
  Calendar,
  Clock,
} from 'lucide-react';

import * as api from '../../api/api';
import * as workerService from '../../services/workerService';
import * as serviceService from '../../services/serviceService';

import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useApp } from '../../context/AppContext';

import {
  TrustScore,
  VerificationBadge,
  SkillBadge,
  AchievementBadge,
} from '../../components/common/Badges';

import { ReviewCard } from '../../components/workers/ReviewCard';
import WorkerCard from '../../components/workers/WorkerCard';

import { Tabs } from '../../components/common/Controls';

import {
  EmptyState,
  ListSkeleton,
  ErrorState,
} from '../../components/common/States';

import {
  formatINR,
  formatDistance,
} from '../../utils/format';


const trustBreakdown = (worker) => [
  {
    label: 'Identity',
    value: worker.verified.identity ? 95 : 40,
  },
  {
    label: 'Experience',
    value: Math.min(
      worker.experienceYears * 9,
      100
    ),
  },
  {
    label: 'Reviews',
    value: Math.round(
      worker.rating * 20
    ),
  },
  {
    label: 'Verification',
    value:
      (
        Object.values(
          worker.verified
        ).filter(Boolean).length / 4
      ) * 100,
  },
  {
    label: 'Reliability',
    value: worker.trustScore,
  },
];


export default function WorkerProfile() {
  const { id } = useParams();

  const { showToast } = useApp();

  const [worker, setWorker] =
    useState(null);

  const [similar, setSimilar] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(false);

  const [
    portfolioTab,
    setPortfolioTab,
  ] = useState('all');

  const [saved, setSaved] =
    useState(false);

  const [services, setServices] =
    useState([]);


  // =====================================================
  // REVIEW STATE
  // =====================================================

  const [
    reviewRating,
    setReviewRating,
  ] = useState(5);

  const [
    reviewComment,
    setReviewComment,
  ] = useState('');

  const [
    reviewSubmitting,
    setReviewSubmitting,
  ] = useState(false);

  const [
    reviewError,
    setReviewError,
  ] = useState('');


  // =====================================================
  // CURRENT USER
  // =====================================================

  let currentUser = null;

  try {
    currentUser = JSON.parse(
      localStorage.getItem(
        'workbridge_user'
      ) || 'null'
    );
  } catch {
    currentUser = null;
  }

  const currentRole =
    String(
      currentUser?.role || ''
    ).toLowerCase();

  const isCustomer =
    currentRole === 'customer';

  const isProvider =
    currentRole === 'provider';


  useDocumentTitle(
    worker?.name
  );


  // =====================================================
  // LOAD PROFILE
  // =====================================================

  useEffect(() => {
    setLoading(true);
    setError(false);

    async function loadProfile() {
      try {
        // ==============================================
        // PROVIDER → MY PROFILE
        // ==============================================

        if (isProvider) {
          const [
            workerData,
            servicesData,
          ] = await Promise.all([
            workerService.getWorkerProfile(),
            serviceService.listServices(),
          ]);

          setWorker(
            workerData
          );

          setServices(
            Array.isArray(
              servicesData
            )
              ? servicesData
              : []
          );
        }

        // ==============================================
        // CUSTOMER → PUBLIC WORKER PROFILE
        // ==============================================

        else {
          if (!id) {
            throw new Error(
              'Worker ID is missing.'
            );
          }

          const workerData =
            await workerService.getWorker(
              id
            );

          setWorker(
            workerData
          );

          setServices(
            Array.isArray(
              workerData.services
            )
              ? workerData.services
              : []
          );
        }

        // Still not connected
        setSimilar([]);
        setSaved(false);

      } catch (err) {
        console.error(err);

        setError(true);

      } finally {
        setLoading(false);
      }
    }

    loadProfile();

  }, [id, isProvider]);


  // =====================================================
  // SAVE WORKER
  // =====================================================

  const toggleSave = () => {
    showToast(
      'Saving workers is not connected yet.'
    );
  };


  // =====================================================
  // SUBMIT REVIEW
  // =====================================================

  const submitReview = async (e) => {
    e.preventDefault();

    if (!id) {
      setReviewError(
        'Worker ID is missing.'
      );

      return;
    }

    if (!reviewComment.trim()) {
      setReviewError(
        'Please write a review.'
      );

      return;
    }

    setReviewSubmitting(true);
    setReviewError('');

    try {
      await api.createReview(
        id,
        {
          rating: reviewRating,
          comment:
            reviewComment.trim(),
        }
      );

      showToast(
        'Review submitted successfully.'
      );

      setReviewComment('');
      setReviewRating(5);

      // Reload worker so rating,
      // review count and review list update.
      const updatedWorker =
        await workerService.getWorker(
          id
        );

      setWorker(
        updatedWorker
      );

      setServices(
        Array.isArray(
          updatedWorker.services
        )
          ? updatedWorker.services
          : []
      );

    } catch (err) {
      setReviewError(
        err.message
      );

    } finally {
      setReviewSubmitting(false);
    }
  };


  // =====================================================
  // LOADING / ERROR
  // =====================================================

  if (loading) {
    return (
      <div className="section py-10">
        <ListSkeleton count={4} />
      </div>
    );
  }

  if (error || !worker) {
    return (
      <div className="section py-10">
        <ErrorState
          message="Couldn't load this profile."
        />
      </div>
    );
  }


  // =====================================================
  // UI
  // =====================================================

  return (
    <div>

      {/* COVER */}
      <div
        className={`h-48 sm:h-56 bg-gradient-to-br ${worker.coverColor} relative`}
      >
        <div className="absolute inset-0 bg-navy-950/10" />
      </div>


      <div className="section -mt-16 relative">

        {/* =================================================
            PROFILE HEADER
        ================================================= */}

        <div className="card p-6">

          <div className="flex flex-col sm:flex-row gap-5">

            <div className="h-24 w-24 rounded-2xl bg-white dark:bg-navy-900 shadow-card flex items-center justify-center text-2xl font-extrabold text-navy-700 dark:text-white ring-4 ring-white dark:ring-navy-950 -mt-14 sm:mt-0 shrink-0">
              {worker.avatar}
            </div>


            <div className="flex-1 min-w-0">

              <div className="flex flex-wrap items-start justify-between gap-3">

                <div>

                  <div className="flex items-center gap-2 flex-wrap">

                    <h1 className="text-xl font-extrabold text-navy-900 dark:text-white">
                      {worker.name}
                    </h1>

                    {worker.verified.identity && (
                      <VerificationBadge
                        label="Verified"
                      />
                    )}

                    {worker.premium && (
                      <span className="badge bg-accent-50 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300 text-[11px]">
                        Premium
                      </span>
                    )}

                  </div>


                  <p className="text-navy-500 dark:text-navy-400 mt-1">
                    {worker.title}
                  </p>


                  <div className="flex flex-wrap items-center gap-4 mt-2.5 text-sm text-navy-500 dark:text-navy-400">

                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />

                      {worker.area},
                      {' '}
                      {worker.city}
                      {' · '}
                      {formatDistance(
                        worker.distanceKm
                      )}
                    </span>


                    <span className="flex items-center gap-1">

                      <Star className="h-4 w-4 fill-accent-500 text-accent-500" />

                      {worker.rating}
                      {' '}
                      ({worker.reviewsCount} reviews)

                    </span>


                    <span className="flex items-center gap-1">

                      <Briefcase className="h-4 w-4" />

                      {worker.experienceYears}
                      {' '}
                      yrs experience

                    </span>

                  </div>

                </div>


                <TrustScore
                  score={
                    worker.trustScore
                  }
                />

              </div>


              {/* ACTION BUTTONS */}
<div className="flex flex-wrap gap-2.5 mt-5">

  {isCustomer && (
    <Link
      to={`/bookings/create/${worker.id}`}
      className="btn-primary px-4 py-2 text-sm"
    >
      <Calendar className="h-4 w-4" />
      Book Now
    </Link>
  )}

  <Link
    to="/messages"
    className="btn-primary px-4 py-2 text-sm"
  >
    <MessageCircle className="h-4 w-4" />
    Chat
  </Link>


                <a
                  href="tel:+919876543210"
                  className="btn-secondary px-4 py-2 text-sm"
                >
                  <Phone className="h-4 w-4" />
                  Call
                </a>


                <button
                  type="button"
                  onClick={toggleSave}
                  className="btn-outline px-4 py-2 text-sm bg-white dark:bg-navy-900"
                >
                  <Heart
                    className={
                      saved
                        ? 'h-4 w-4 fill-red-500 text-red-500'
                        : 'h-4 w-4'
                    }
                  />

                  {saved
                    ? 'Saved'
                    : 'Save'}
                </button>


                <button
                  type="button"
                  onClick={() =>
                    showToast(
                      'Profile link copied'
                    )
                  }
                  className="btn-outline px-4 py-2 text-sm bg-white dark:bg-navy-900"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>


                <button
                  type="button"
                  onClick={() =>
                    showToast(
                      'Resume download started'
                    )
                  }
                  className="btn-outline px-4 py-2 text-sm bg-white dark:bg-navy-900"
                >
                  <Download className="h-4 w-4" />
                  Resume
                </button>

              </div>

            </div>

          </div>

        </div>


        {/* =================================================
            MAIN CONTENT GRID
        ================================================= */}

        <div className="grid lg:grid-cols-3 gap-6 mt-6">


          {/* ===============================================
              LEFT COLUMN
          =============================================== */}

          <div className="lg:col-span-2 space-y-6">


            {/* ABOUT */}
            <div className="card p-6">

              <h2 className="font-semibold text-navy-900 dark:text-white mb-3">
                About
              </h2>

              <p className="text-sm text-navy-600 dark:text-navy-300 leading-relaxed">
                {worker.about}
              </p>


              {worker.badges.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">

                  {worker.badges.map(
                    (badge) => (
                      <AchievementBadge
                        key={badge}
                        label={badge}
                      />
                    )
                  )}

                </div>
              )}

            </div>


            {/* SKILLS */}
            <div className="card p-6">

              <h2 className="font-semibold text-navy-900 dark:text-white mb-3">
                Skills
              </h2>


              {worker.skills.length === 0 ? (

                <EmptyState
                  title="No skills added"
                />

              ) : (

                <div className="flex flex-wrap gap-2">

                  {worker.skills.map(
                    (skill) => (
                      <SkillBadge
                        key={skill}
                      >
                        {skill}
                      </SkillBadge>
                    )
                  )}

                </div>

              )}

            </div>


            {/* SERVICES */}
            <div className="card p-6">

              <h2 className="font-semibold text-navy-900 dark:text-white mb-4">
                Services
              </h2>


              {services.length === 0 ? (

                <EmptyState
                  title="No services added"
                  message="This professional hasn't added any services yet."
                />

              ) : (

                <div className="space-y-3">

                  {services.map(
                    (service) => (

                      <div
                        key={service.id}
                        className="rounded-xl border border-navy-100 dark:border-navy-800 p-4"
                      >

                        <div className="flex items-start justify-between gap-4">

                          <div className="min-w-0">

                            <h3 className="text-sm font-semibold text-navy-900 dark:text-white">
                              {service.name}
                            </h3>


                            {service.description && (
                              <p className="text-sm text-navy-500 dark:text-navy-400 mt-1">
                                {service.description}
                              </p>
                            )}


                            <div className="flex flex-wrap gap-3 mt-3 text-xs text-navy-500 dark:text-navy-400">

                              {service.duration_minutes && (
                                <span className="flex items-center gap-1">

                                  <Clock className="h-3.5 w-3.5" />

                                  {service.duration_minutes}
                                  {' '}
                                  minutes

                                </span>
                              )}


                              {service.is_emergency_available && (
                                <span className="font-medium text-secondary-600">
                                  ⚡ Emergency available
                                </span>
                              )}

                            </div>

                          </div>


                          <div className="text-right shrink-0">

                            <p className="font-bold text-navy-900 dark:text-white">
                              {formatINR(
                                Number(
                                  service.price
                                )
                              )}
                            </p>


                            {!service.is_active && (
                              <span className="text-xs text-navy-400">
                                Inactive
                              </span>
                            )}

                          </div>

                        </div>

                      </div>

                    )
                  )}

                </div>

              )}

            </div>


            {/* EXPERIENCE */}
            <div className="card p-6">

              <h2 className="font-semibold text-navy-900 dark:text-white mb-4">
                Experience
              </h2>


              <div className="relative pl-6 border-l-2 border-navy-100 dark:border-navy-800 space-y-6">

                <div className="relative">

                  <span className="absolute -left-[1.65rem] top-1 h-3 w-3 rounded-full bg-primary-600" />

                  <p className="text-sm font-semibold text-navy-900 dark:text-white">
                    {worker.title}
                  </p>

                  <p className="text-xs text-navy-400">
                    Independent
                    {' · '}
                    {worker.city}
                    {' · '}
                    {worker.experienceYears}
                    {' '}
                    years
                  </p>

                  <p className="text-sm text-navy-500 dark:text-navy-400 mt-1.5">
                    Serving
                    {' '}
                    {worker.area}
                    {' '}
                    and surrounding neighborhoods.
                  </p>

                </div>


                <div className="relative">

                  <span className="absolute -left-[1.65rem] top-1 h-3 w-3 rounded-full bg-navy-300 dark:bg-navy-600" />

                  <p className="text-sm font-semibold text-navy-900 dark:text-white">
                    Apprenticeship & Training
                  </p>

                  <p className="text-xs text-navy-400">
                    Early career
                  </p>

                </div>

              </div>

            </div>


            {/* CERTIFICATES */}
            <div className="card p-6">

              <div className="flex items-center justify-between mb-4">

                <h2 className="font-semibold text-navy-900 dark:text-white">
                  Certificates
                </h2>

                {worker.verified.certificate && (
                  <VerificationBadge
                    label="Certificate Verified"
                  />
                )}

              </div>


              {worker.verified.certificate ? (

                <div className="grid sm:grid-cols-2 gap-3">

                  {[1, 2].map(
                    (number) => (

                      <div
                        key={number}
                        className="rounded-xl border border-navy-100 dark:border-navy-800 p-4 flex items-center gap-3"
                      >

                        <div className="h-10 w-10 rounded-lg bg-secondary-50 dark:bg-secondary-900/30 flex items-center justify-center text-secondary-600">

                          <FileCheck2 className="h-5 w-5" />

                        </div>


                        <div>

                          <p className="text-sm font-medium text-navy-800 dark:text-navy-100">
                            Trade Certification
                            {' '}
                            {number}
                          </p>

                          <p className="text-xs text-navy-400">
                            Verified by WorkBridge
                          </p>

                        </div>

                      </div>

                    )
                  )}

                </div>

              ) : (

                <EmptyState
                  title="No certificates uploaded"
                  message="This professional hasn't added certificates yet."
                />

              )}

            </div>


            {/* PORTFOLIO */}
            <div className="card p-6">

              <h2 className="font-semibold text-navy-900 dark:text-white mb-4">
                Portfolio
              </h2>


              <Tabs
                tabs={[
                  {
                    value: 'all',
                    label: 'All',
                  },
                  {
                    value: 'images',
                    label: 'Images',
                  },
                  {
                    value: 'before-after',
                    label:
                      'Before & After',
                  },
                  {
                    value: 'videos',
                    label: 'Videos',
                  },
                ]}
                active={
                  portfolioTab
                }
                onChange={
                  setPortfolioTab
                }
              />


              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">

                {Array.from({
                  length: 6,
                }).map(
                  (_, index) => (

                    <div
                      key={index}
                      className={`aspect-square rounded-xl bg-gradient-to-br ${worker.coverColor} opacity-70 hover:opacity-100 transition-opacity cursor-pointer`}
                    />

                  )
                )}

              </div>


              <Link
                to={`/portfolio/${worker.id}`}
                className="btn-outline w-full mt-4 py-2 text-sm"
              >
                View Full Portfolio
              </Link>

            </div>


            {/* =================================================
                REVIEWS
            ================================================= */}

            <div className="card p-6">

              {/* HEADER */}
              <div className="flex items-center justify-between mb-4">

                <h2 className="font-semibold text-navy-900 dark:text-white">
                  Reviews
                  {' '}
                  ({worker.reviews.length})
                </h2>


                <span className="flex items-center gap-1 text-sm font-semibold text-navy-700 dark:text-navy-200">

                  <Star className="h-4 w-4 fill-accent-500 text-accent-500" />

                  {worker.rating}

                </span>

              </div>


              {/* WRITE REVIEW - CUSTOMER ONLY */}
              {isCustomer && id && (

                <form
                  onSubmit={
                    submitReview
                  }
                  className="mb-6 rounded-xl border border-navy-100 dark:border-navy-800 p-4"
                >

                  <h3 className="text-sm font-semibold text-navy-900 dark:text-white">
                    Write a Review
                  </h3>


                  <p className="text-xs text-navy-400 mt-1">
                    Share your experience with this professional.
                  </p>


                  {/* STAR RATING */}
                  <div className="flex items-center gap-1 mt-4">

                    {[1, 2, 3, 4, 5].map(
                      (star) => (

                        <button
                          key={star}
                          type="button"
                          onClick={() => {
                            setReviewRating(
                              star
                            );

                            setReviewError(
                              ''
                            );
                          }}
                          className="transition-transform hover:scale-110"
                          aria-label={`${star} star`}
                        >

                          <Star
                            className={`h-6 w-6 ${
                              star <= reviewRating
                                ? 'fill-accent-500 text-accent-500'
                                : 'text-navy-300 dark:text-navy-700'
                            }`}
                          />

                        </button>

                      )
                    )}


                    <span className="ml-2 text-xs text-navy-400">
                      {reviewRating}/5
                    </span>

                  </div>


                  {/* COMMENT */}
                  <textarea
                    rows={4}
                    className="input mt-4 w-full resize-none"
                    placeholder="Write your review..."
                    value={
                      reviewComment
                    }
                    onChange={(e) => {
                      setReviewComment(
                        e.target.value
                      );

                      setReviewError(
                        ''
                      );
                    }}
                  />


                  {/* ERROR */}
                  {reviewError && (
                    <p className="text-sm text-red-500 mt-2">
                      {reviewError}
                    </p>
                  )}


                  {/* SUBMIT */}
                  <div className="flex justify-end mt-3">

                    <button
                      type="submit"
                      disabled={
                        reviewSubmitting
                      }
                      className="btn-primary px-5 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {reviewSubmitting
                        ? 'Submitting...'
                        : 'Submit Review'}
                    </button>

                  </div>

                </form>

              )}


              {/* EXISTING REVIEWS */}
              {worker.reviews.length === 0 ? (

                <EmptyState
                  title="No reviews yet"
                  message="Be the first customer to review this professional."
                />

              ) : (

                <div className="space-y-3">

                  {worker.reviews.map(
                    (review) => (

                      <ReviewCard
                        key={review.id}
                        review={review}
                      />

                    )
                  )}

                </div>

              )}

            </div>

          </div>


          {/* ===============================================
              RIGHT COLUMN
          =============================================== */}

          <div className="space-y-6">


            {/* TRUST SCORE */}
            <div className="card p-6">

              <h3 className="font-semibold text-navy-900 dark:text-white mb-4">
                Trust Score Breakdown
              </h3>


              <div className="space-y-3">

                {trustBreakdown(
                  worker
                ).map(
                  (item) => (

                    <div
                      key={
                        item.label
                      }
                    >

                      <div className="flex justify-between text-xs mb-1">

                        <span className="text-navy-500 dark:text-navy-400">
                          {item.label}
                        </span>

                        <span className="font-semibold text-navy-700 dark:text-navy-200">
                          {Math.round(
                            item.value
                          )}
                        </span>

                      </div>


                      <div className="h-1.5 rounded-full bg-navy-100 dark:bg-navy-800 overflow-hidden">

                        <div
                          className="h-full bg-primary-500 rounded-full"
                          style={{
                            width: `${item.value}%`,
                          }}
                        />

                      </div>

                    </div>

                  )
                )}

              </div>

            </div>


            {/* CHARGES */}
            <div className="card p-6">

              <h3 className="font-semibold text-navy-900 dark:text-white mb-4">
                Charges
              </h3>


              <div className="space-y-2.5 text-sm">

                <div className="flex justify-between">

                  <span className="text-navy-500 dark:text-navy-400">
                    Starting price
                  </span>

                  <span className="font-semibold text-navy-900 dark:text-white">
                    {formatINR(
                      worker.startingPrice
                    )}
                  </span>

                </div>


                {worker.hourlyRate && (
                  <div className="flex justify-between">

                    <span className="text-navy-500 dark:text-navy-400">
                      Hourly rate
                    </span>

                    <span className="font-semibold text-navy-900 dark:text-white">
                      {formatINR(
                        worker.hourlyRate
                      )}
                      /hr
                    </span>

                  </div>
                )}


                {worker.emergencyCharge && (
                  <div className="flex justify-between">

                    <span className="text-navy-500 dark:text-navy-400">
                      Emergency charge
                    </span>

                    <span className="font-semibold text-navy-900 dark:text-white">
                      {formatINR(
                        worker.emergencyCharge
                      )}
                    </span>

                  </div>
                )}

              </div>

            </div>


            {/* AVAILABILITY */}
            <div className="card p-6">

              <h3 className="font-semibold text-navy-900 dark:text-white mb-4 flex items-center gap-1.5">

                <Calendar className="h-4 w-4" />

                Availability

              </h3>


              <div className="flex flex-wrap gap-1.5 mb-3">

                {[
                  'Mon',
                  'Tue',
                  'Wed',
                  'Thu',
                  'Fri',
                  'Sat',
                  'Sun',
                ].map(
                  (day) => (

                    <span
                      key={day}
                      className={`h-8 w-8 rounded-lg flex items-center justify-center text-[11px] font-semibold ${
                        worker.workingDays.includes(
                          day
                        )
                          ? 'bg-primary-600 text-white'
                          : 'bg-navy-100 dark:bg-navy-800 text-navy-400'
                      }`}
                    >
                      {day[0]}
                    </span>

                  )
                )}

              </div>


              <p className="text-sm text-navy-500 dark:text-navy-400 flex items-center gap-1.5">

                <Clock className="h-4 w-4" />

                {worker.workingHours}

              </p>


              {worker.emergencyAvailable && (
                <p className="text-xs text-secondary-600 font-medium mt-2">
                  ⚡ Emergency service available
                </p>
              )}

            </div>


            {/* LANGUAGES */}
            <div className="card p-6">

              <h3 className="font-semibold text-navy-900 dark:text-white mb-4">
                Languages
              </h3>


              <div className="flex flex-wrap gap-2">

                {worker.languages.map(
                  (language) => (

                    <span
                      key={language}
                      className="badge bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300 text-xs"
                    >
                      {language}
                    </span>

                  )
                )}

              </div>

            </div>

          </div>

        </div>


        {/* =================================================
            SIMILAR PROFESSIONALS
        ================================================= */}

        {similar.length > 0 && (

          <div className="mt-10 mb-14">

            <h2 className="text-xl font-bold text-navy-900 dark:text-white mb-4 flex items-center gap-2">

              <UsersIcon className="h-5 w-5" />

              Similar Professionals

            </h2>


            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

              {similar.map(
                (similarWorker) => (

                  <WorkerCard
                    key={
                      similarWorker.id
                    }
                    worker={
                      similarWorker
                    }
                  />

                )
              )}

            </div>

          </div>

        )}

      </div>

    </div>
  );
}