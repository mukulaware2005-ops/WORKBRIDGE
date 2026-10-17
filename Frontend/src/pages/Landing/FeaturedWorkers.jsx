import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getFeatured } from '../../services/workerService';
import WorkerCard from '../../components/workers/WorkerCard';

export default function FeaturedWorkers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
    async function loadWorkers() {
      try {
        const data = await getFeatured();
        setWorkers(data);
      } catch (error) {
        console.error('Failed to load featured workers:', error);
      } finally {
        setLoading(false);
      }
    }

    loadWorkers();
  }, []);

  return (
    <section className="section py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white">
            Featured professionals
          </h2>

          <p className="text-navy-500 dark:text-navy-400 mt-1.5">
            Top-rated, verified workers ready to help this week.
          </p>
        </div>

        <Link
          to="/search"
          className="hidden sm:flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700"
        >
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {loading && (
        <p className="text-sm text-navy-400">
          Loading professionals...
        </p>
      )}

      {!loading && workers.length === 0 && (
        <p className="text-sm text-navy-400">
          No featured professionals available yet.
        </p>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {workers.map((worker) => (
          <WorkerCard
            key={worker.id}
            worker={worker}
          />
        ))}
      </div>
    </section>
  );
}