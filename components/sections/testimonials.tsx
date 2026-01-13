"use client";

import { useEffect, useState } from "react";
import { SectionHeading } from "@/components/ui/section-heading";
import { RiStarFill } from "react-icons/ri";

interface Testimonial {
  id: number;
  user_name: string;
  user_type: string;
  content: string;
  rating: number;
  approval_status: string;
  is_featured: boolean;
  created_at: string;
}

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/testimonials?limit=12');
      const data = await response.json();

      if (data.success && data.data) {
        // API already returns approved testimonials
        setTestimonials(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserTypeLabel = (type: string) => {
    switch (type) {
      case 'student': return 'Student';
      case 'teacher': return 'Health Professional';
      case 'admin': return 'Administrator';
      default: return 'User';
    }
  };

  return (
    <section
      id="community"
      className="rounded-[36px] bg-white px-6 py-20 shadow-[0_35px_90px_-70px_rgba(0,0,0,0.3)] sm:px-10 lg:px-16"
    >
      <SectionHeading
        eyebrow="What Our Community Says"
        title="Stories from students who leveled up their fluency and found support through AEON."
        align="center"
        className="mb-14"
        variant="light"
      />
      <div className="grid gap-10 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <p className="text-black/70">Loading testimonials...</p>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-black/70">No testimonials available yet.</p>
          </div>
        ) : (
          testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="flex h-full flex-col gap-6 rounded-3xl bg-black p-8 shadow-[0_30px_80px_-65px_rgba(0,0,0,0.5)]"
            >
              <div className="flex items-center gap-4">
                <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-white shadow-[0_12px_30px_-20px_rgba(0,0,0,0.5)] bg-white flex items-center justify-center">
                  <span className="text-black text-lg font-semibold">
                    {testimonial.user_name ? testimonial.user_name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">
                    {testimonial.user_name || 'Anonymous User'}
                  </h3>
                  <p className="text-sm text-white/70">{getUserTypeLabel(testimonial.user_type)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-white">
                {Array.from({ length: testimonial.rating }).map((_, index) => (
                  <RiStarFill key={index} className="h-4 w-4" aria-hidden="true" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-white/80">
                "{testimonial.content}"
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}