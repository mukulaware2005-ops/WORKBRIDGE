
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Calendar, Clock, MapPin, ArrowLeft, Loader2 } from 'lucide-react';

import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useApp } from '../../context/AppContext';

import * as workerService from '../../services/workerService';
import * as serviceService from '../../services/serviceService';
import * as bookingService from '../../services/bookingService';

import { formatINR } from '../../utils/format';
import { ErrorState } from '../../components/common/States';


export default function CreateBooking() {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useApp();

  useDocumentTitle('Book a Professional');

  const [worker, setWorker] = useState(null);
  const [services, setServices] = useState([]);

  const [selectedService, setSelectedService] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);


  // =====================================================
  // LOAD WORKER AND SERVICES
  // =====================================================

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(false);

        if (!workerId) {
          throw new Error('Worker ID is missing.');
        }

        const workerData = await workerService.getWorker(workerId);

        setWorker(workerData);

        /*
         * Services may already be included
         * in the worker profile.
         */
        if (
          Array.isArray(workerData.services) &&
          workerData.services.length > 0
        ) {
          setServices(workerData.services);
        } else {
          /*
           * Fallback:
           * load services from the service API.
           */
          const serviceData = await serviceService.listServices();

          setServices(
            Array.isArray(serviceData)
              ? serviceData
              : []
          );
        }
      } catch (err) {
        console.error('Failed to load booking data:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [workerId]);


  // =====================================================
  // SELECTED SERVICE
  // =====================================================

  const selectedServiceData = services.find(
    (service) => String(service.id) === String(selectedService)
  );


  // =====================================================
  // SUBMIT BOOKING
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedService) {
      showToast('Please select a service');
      return;
    }

    if (!date) {
      showToast('Please select a date');
      return;
    }

    if (!time) {
      showToast('Please select a time');
      return;
    }

    if (!location.trim()) {
      showToast('Please enter the service location');
      return;
    }

    try {
      setSubmitting(true);

      const bookingData = {
        worker: workerId,
        service: selectedService,
        date,
        time,
        location: location.trim(),

        /*
         * Price is taken from the selected service.
         */
        price: Number(
          selectedServiceData?.price ||
          worker?.startingPrice ||
          0
        ),
      };

      await bookingService.createBooking(bookingData);

      showToast('Booking request sent successfully');

      /*
       * Go back to bookings after successful creation.
       */
      navigate('/bookings');
    } catch (err) {
      console.error('Failed to create booking:', err);

      showToast(
        err.message || 'Failed to create booking'
      );
    } finally {
      setSubmitting(false);
    }
  };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="section py-10 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }


  // =====================================================
  // ERROR
  // =====================================================

  if (error || !worker) {
    return (
      <div className="section py-10">
        <ErrorState
          message="Couldn't load this professional."
        />
      </div>
    );
  }


  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="section py-8 max-w-3xl">

      {/* BACK BUTTON */}

      <Link
        to={`/workers/${workerId}`}
        className="inline-flex items-center gap-2 text-sm text-navy-500 dark:text-navy-400 hover:text-primary-600 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Profile
      </Link>


      {/* PAGE HEADER */}

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white">
          Book a Professional
        </h1>

        <p className="text-sm text-navy-500 dark:text-navy-400 mt-1">
          Schedule a service with {worker.name}.
        </p>
      </div>


      {/* WORKER CARD */}

      <div className="card p-5 mb-6">

        <div className="flex items-center gap-4">

          <div className="h-14 w-14 rounded-xl bg-navy-100 dark:bg-navy-800 flex items-center justify-center text-lg font-bold text-navy-700 dark:text-white">
            {worker.avatar}
          </div>

          <div>
            <h2 className="font-semibold text-navy-900 dark:text-white">
              {worker.name}
            </h2>

            <p className="text-sm text-navy-500 dark:text-navy-400">
              {worker.title}
            </p>

            <div className="flex items-center gap-1 text-xs text-navy-400 mt-1">
              <MapPin className="h-3.5 w-3.5" />
              {worker.area}, {worker.city}
            </div>
          </div>

        </div>

      </div>


      {/* BOOKING FORM */}

      <form
        onSubmit={handleSubmit}
        className="card p-6 space-y-6"
      >

        {/* SERVICE */}

        <div>
          <label className="label">
            Select Service
          </label>

          {services.length === 0 ? (
            <p className="text-sm text-navy-500 dark:text-navy-400">
              This professional has no services available.
            </p>
          ) : (
            <select
              className="input"
              value={selectedService}
              onChange={(e) =>
                setSelectedService(e.target.value)
              }
              required
            >
              <option value="">
                Select a service
              </option>

              {services.map((service) => (
                <option
                  key={service.id}
                  value={service.id}
                >
                  {service.name}
                  {service.price
                    ? ` - ${formatINR(Number(service.price))}`
                    : ''}
                </option>
              ))}
            </select>
          )}
        </div>


        {/* DATE */}

        <div>
          <label className="label flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Date
          </label>

          <input
            type="date"
            className="input"
            value={date}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>


        {/* TIME */}

        <div>
          <label className="label flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Time
          </label>

          <input
            type="time"
            className="input"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>


        {/* LOCATION */}

        <div>
          <label className="label flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Service Location
          </label>

          <textarea
            rows={3}
            className="input resize-none"
            placeholder="Enter the address where the service is required"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>


        {/* PRICE */}

        {selectedServiceData && (
          <div className="rounded-xl bg-navy-50 dark:bg-navy-800/60 p-4">

            <div className="flex items-center justify-between">

              <span className="text-sm text-navy-500 dark:text-navy-400">
                Estimated Price
              </span>

              <span className="text-lg font-bold text-navy-900 dark:text-white">
                {formatINR(
                  Number(selectedServiceData.price || 0)
                )}
              </span>

            </div>

          </div>
        )}


        {/* SUBMIT */}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">

          <Link
            to={`/workers/${workerId}`}
            className="btn-outline px-5 py-2.5 text-sm text-center"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={
              submitting ||
              services.length === 0
            }
            className="btn-primary px-5 py-2.5 text-sm flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending Request...
              </>
            ) : (
              'Confirm Booking'
            )}
          </button>

        </div>

      </form>

    </div>
  );
}

