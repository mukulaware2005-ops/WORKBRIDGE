import { Link } from 'react-router-dom';

export default function Logo({ compact = false, to = '/' }) {
  return (
    <Link to={to} className="flex items-center gap-2 shrink-0 group" aria-label="WorkBridge home">
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-500 text-white font-extrabold shadow-glow transition-transform group-hover:scale-105">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <path d="M4 12c0-3 2.5-5 5-5s4 2 4 4-1.5 4-4 4-5-2-5-3z" fill="white" fillOpacity="0.95" />
          <path d="M20 12c0 3-2.5 5-5 5s-4-2-4-4 1.5-4 4-4 5 2 5 3z" fill="white" fillOpacity="0.6" />
        </svg>
      </span>
      {!compact && (
        <span className="font-extrabold text-lg tracking-tight text-navy-900 dark:text-white">
          Work<span className="text-primary-600">Bridge</span>
        </span>
      )}
    </Link>
  );
}
