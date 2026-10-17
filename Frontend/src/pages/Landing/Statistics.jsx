import { useEffect, useState } from 'react';
import {
  Users,
  UserCheck,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { StatisticsCard } from '../../components/common/StatisticsCard';

export default function Statistics() {
  const [stats, setStats] = useState({
    workers: 0,
    customers: 0,
    completedServices: 0,
    verifiedWorkers: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await fetch(
          'http://127.0.0.1:8000/api/admin/public-stats/'
        );

        if (!response.ok) {
          throw new Error('Failed to fetch statistics');
        }

        const data = await response.json();

        setStats(data);
      } catch (error) {
        console.error(
          'Failed to load landing statistics:',
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const statCards = [
    {
      icon: Users,
      value: loading ? '...' : stats.workers,
      label: 'Skilled workers',
      accent: 'primary',
    },
    {
      icon: UserCheck,
      value: loading ? '...' : stats.customers,
      label: 'Happy customers',
      accent: 'secondary',
    },
    {
      icon: CheckCircle2,
      value: loading ? '...' : stats.completedServices,
      label: 'Services completed',
      accent: 'accent',
    },
    {
      icon: ShieldCheck,
      value: loading ? '...' : stats.verifiedWorkers,
      label: 'Verified professionals',
      accent: 'primary',
    },
  ];

  return (
    <section className="section py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <StatisticsCard
            key={stat.label}
            {...stat}
          />
        ))}
      </div>
    </section>
  );
}