import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  MailCheck,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

const STEPS = ['Account', 'Profile', 'Verify'];

export default function CustomerSignup() {
  useDocumentTitle('Create Customer Account');

  const { signup } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
    city: 'Mumbai',
    area: '',
    language: 'Hindi',
    contactPref: 'Chat',
  });

  const update = (key) => (e) => {
    setForm((current) => ({
      ...current,
      [key]: e.target.value,
    }));
  };

  const next = () => {
    setError('');

    if (step === 0) {
      if (
        !form.name ||
        !form.email ||
        !form.phone ||
        !form.password
      ) {
        setError(
          'Please fill in all required fields.'
        );
        return;
      }

      if (form.password !== form.confirm) {
        setError('Passwords do not match.');
        return;
      }

      if (form.password.length < 8) {
        setError(
          'Password must be at least 8 characters.'
        );
        return;
      }
    }

    setStep((current) =>
      Math.min(current + 1, STEPS.length - 1)
    );
  };

  const back = () => {
    setError('');

    setStep((current) =>
      Math.max(current - 1, 0)
    );
  };

  const createAccount = async () => {
    setLoading(true);
    setError('');

    try {
      await signup({
        role: 'customer',
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });

      showToast(
        'Account created. Please verify your email.'
      );

      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white">
        Create your customer account
      </h1>

      <p className="text-navy-500 dark:text-navy-400 mt-2">
        Find trusted professionals in a few steps.
      </p>

      <div className="flex items-center gap-2 mt-6 mb-8">
        {STEPS.map((label, index) => (
          <div
            key={label}
            className="flex items-center gap-2 flex-1"
          >
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                index <= step
                  ? 'bg-primary-600 text-white'
                  : 'bg-navy-100 dark:bg-navy-800 text-navy-400'
              }`}
            >
              {index < step
                ? <CheckCircle2 className="h-4 w-4" />
                : index + 1}
            </div>

            {index < STEPS.length - 1 && (
              <div
                className={`h-0.5 flex-1 ${
                  index < step
                    ? 'bg-primary-600'
                    : 'bg-navy-100 dark:bg-navy-800'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm px-4 py-2.5 mb-4">
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="account"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            className="space-y-4"
          >
            <div>
              <label className="label">
                Full Name
              </label>

              <input
                className="input"
                value={form.name}
                onChange={update('name')}
                placeholder="Ananya Kapoor"
                required
              />
            </div>

            <div>
              <label className="label">
                Email
              </label>

              <input
                type="email"
                className="input"
                value={form.email}
                onChange={update('email')}
                placeholder="ananya@example.com"
                required
              />
            </div>

            <div>
              <label className="label">
                Phone
              </label>

              <input
                className="input"
                value={form.phone}
                onChange={update('phone')}
                placeholder="98765 43210"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">
                  Password
                </label>

                <input
                  type="password"
                  className="input"
                  value={form.password}
                  onChange={update('password')}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label className="label">
                  Confirm
                </label>

                <input
                  type="password"
                  className="input"
                  value={form.confirm}
                  onChange={update('confirm')}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            className="space-y-4"
          >
            <div>
              <label className="label">
                City
              </label>

              <select
                className="input"
                value={form.city}
                onChange={update('city')}
              >
                {[
                  'Mumbai',
                  'Pune',
                  'Delhi',
                  'Bengaluru',
                  'Hyderabad',
                  'Nagpur',
                  'Nashik',
                  'Ahmedabad',
                ].map((city) => (
                  <option key={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">
                Area
              </label>

              <input
                className="input"
                value={form.area}
                onChange={update('area')}
                placeholder="Andheri West"
              />
            </div>

            <div>
              <label className="label">
                Preferred Language
              </label>

              <select
                className="input"
                value={form.language}
                onChange={update('language')}
              >
                {[
                  'Hindi',
                  'English',
                  'Marathi',
                  'Kannada',
                  'Telugu',
                  'Gujarati',
                ].map((language) => (
                  <option key={language}>
                    {language}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">
                Contact Preference
              </label>

              <select
                className="input"
                value={form.contactPref}
                onChange={update('contactPref')}
              >
                {[
                  'Chat',
                  'Call',
                  'Either',
                ].map((option) => (
                  <option key={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="verify"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6"
          >
            <div className="h-16 w-16 rounded-2xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-5">
              <MailCheck className="h-8 w-8 text-primary-600" />
            </div>

            <h2 className="text-xl font-extrabold text-navy-900 dark:text-white">
              Verify your email
            </h2>

            <p className="text-sm text-navy-500 dark:text-navy-400 mt-3">
              We sent a verification link to
            </p>

            <p className="font-semibold text-navy-900 dark:text-white mt-1">
              {form.email}
            </p>

            <p className="text-sm text-navy-500 dark:text-navy-400 mt-4">
              Open the verification link first.
              After your email is verified, you can log in.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate('/login/customer')
              }
              className="btn-primary px-6 py-2.5 mt-6"
            >
              Go to Login
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {step < 2 && (
        <div className="flex gap-3 mt-8">

          {step > 0 && (
            <button
              type="button"
              onClick={back}
              className="btn-outline px-4 py-2.5"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          )}

          {step === 0 && (
            <button
              type="button"
              onClick={next}
              className="btn-primary flex-1 py-2.5"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          )}

          {step === 1 && (
            <button
              type="button"
              onClick={createAccount}
              disabled={loading}
              className="btn-primary flex-1 py-2.5"
            >
              {loading
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : 'Create Account'
              }
            </button>
          )}

        </div>
      )}

      {step < 2 && (
        <p className="text-sm text-navy-500 dark:text-navy-400 text-center mt-6">
          Already have an account?{' '}
          <Link
            to="/login/customer"
            className="font-semibold text-primary-600"
          >
            Log in
          </Link>
        </p>
      )}
    </div>
  );
}