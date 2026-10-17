import { Link } from 'react-router-dom';

export default function Logo({ compact = false, to = '/' }) {
  return (
    <Link to={to} className="flex items-center shrink-0 group" aria-label="WorkBridge home">
      <span
        className={`${compact ? 'h-12 w-12' : 'h-16 w-16'} overflow-hidden rounded-full border-2 border-primary-100 bg-white p-1 shadow-sm transition-transform group-hover:scale-105 dark:border-navy-700`}
      >
        <img
          src="/logo/Logo%20WorkBridge.svg"
          alt="WorkBridge"
          className="h-full w-full rounded-full object-contain"
        />
      </span>
    </Link>
  );
}
