import { useEffect, useState } from 'react';
import {
  Search,
  RefreshCw,
  Trash2,
  Star,
  Loader2,
} from 'lucide-react';

import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useApp } from '../../context/AppContext';
import * as adminService from '../../services/adminService';

export default function Reviews() {
  useDocumentTitle('Reviews');

  const { showToast } = useApp();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const loadReviews = async () => {
    try {
      setLoading(true);

      const data = await adminService.listAdminReviews({
        search,
      });

      setReviews(data.results || []);
    } catch (error) {
      showToast?.(
        error.message || 'Failed to load reviews',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [search]);

  const deleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review?')) {
      return;
    }

    try {
      setActionLoading(reviewId);

      await adminService.deleteAdminReview(reviewId);

      showToast?.(
        'Review deleted successfully',
        'success'
      );

      await loadReviews();
    } catch (error) {
      showToast?.(
        error.message || 'Failed to delete review',
        'error'
      );
    } finally {
      setActionLoading(null);
    }
  };

  const RatingStars = ({ rating }) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={15}
            className={
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }
          />
        ))}

        <span className="ml-1 font-semibold text-gray-900">
          {rating}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Review Management
        </h1>

        <p className="text-sm text-gray-600">
          Monitor and manage customer reviews
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-xl border bg-white p-4 md:flex-row">

        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-3 text-gray-500"
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search customer, worker or review..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-gray-900 outline-none placeholder:text-gray-500 focus:ring-2"
          />
        </div>

        <button
          onClick={loadReviews}
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-50"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {/* Reviews Table */}
      <div className="overflow-x-auto rounded-xl border bg-white">

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2
              size={28}
              className="animate-spin text-gray-700"
            />
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center text-gray-600">
            No reviews found.
          </div>
        ) : (
          <table className="w-full min-w-[900px]">

            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-gray-800">
                  Customer
                </th>

                <th className="px-4 py-3 text-left text-gray-800">
                  Worker
                </th>

                <th className="px-4 py-3 text-left text-gray-800">
                  Rating
                </th>

                <th className="px-4 py-3 text-left text-gray-800">
                  Review
                </th>

                <th className="px-4 py-3 text-center text-gray-800">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">

              {reviews.map((review) => (
                <tr
                  key={review.id}
                  className="hover:bg-gray-50"
                >

                  {/* Customer */}
                  <td className="px-4 py-4">
                    <div className="font-semibold text-gray-900">
                      {review.customer}
                    </div>
                  </td>

                  {/* Worker */}
                  <td className="px-4 py-4">
                    <div className="font-semibold text-gray-900">
                      {review.worker}
                    </div>
                  </td>

                  {/* Rating */}
                  <td className="px-4 py-4">
                    <RatingStars
                      rating={review.rating}
                    />
                  </td>

                  {/* Review */}
                  <td className="max-w-md px-4 py-4">
                    <p className="text-sm text-gray-700">
                      {review.comment || 'No comment'}
                    </p>
                  </td>

                  {/* Delete */}
                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() =>
                        deleteReview(review.id)
                      }
                      disabled={
                        actionLoading === review.id
                      }
                      className="rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200 disabled:opacity-50"
                      title="Delete review"
                    >
                      {actionLoading === review.id ? (
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                      ) : (
                        <Trash2 size={17} />
                      )}
                    </button>
                  </td>

                </tr>
              ))}

            </tbody>
          </table>
        )}

      </div>
    </div>
  );
}