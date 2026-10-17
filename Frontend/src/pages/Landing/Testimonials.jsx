import { useEffect, useState } from 'react';
import { TestimonialCard } from '../../components/workers/ReviewCard';

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTestimonials() {
      try {
        const response = await fetch(
          'http://127.0.0.1:8000/api/admin/public-testimonials/'
        );

        if (!response.ok) {
          throw new Error('Failed to fetch testimonials');
        }

        const data = await response.json();

        setTestimonials(data);
      } catch (error) {
        console.error(
          'Failed to load testimonials:',
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadTestimonials();
  }, []);

  return (
    <section className="section py-16">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white">
          Loved by customers and professionals
        </h2>
      </div>

      {loading && (
        <p className="text-center text-sm text-navy-400">
          Loading testimonials...
        </p>
      )}

      {!loading && testimonials.length === 0 && (
        <p className="text-center text-sm text-navy-400">
          No testimonials available yet.
        </p>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {testimonials.map((testimonial, index) => (
          <TestimonialCard
            key={testimonial.id}
            name={testimonial.name}
            role={testimonial.role}
            text={testimonial.text}
            avatarColor={
              index === 0
                ? 'from-primary-400 to-primary-600'
                : index === 1
                ? 'from-amber-400 to-orange-500'
                : 'from-secondary-400 to-secondary-600'
            }
          />
        ))}
      </div>
    </section>
  );
}