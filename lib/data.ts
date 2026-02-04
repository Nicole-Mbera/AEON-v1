export const HERO_STATS = [
  { label: "Active Users", value: "50K+" },
  { label: "Verified Professionals", value: "200+" },
  { label: "Satisfaction Rate", value: "98%" },
] as const;

export const WHY_BODYWISE = [
  {
    title: "Personalized Learning Paths",
    description: "Education tailored to your unique goals, learning style, and pace. No more one-size-fits-all approaches that leave students behind or hold others back."
  },
  {
    title: "Direct Expert Connection",
    description: "Learn one-on-one from verified experts in your field of interest. Get mentorship, guidance, and real-world insights from professionals who are passionate about teaching."
  },
  {
    title: "Boundless Education",
    description: "Access quality learning regardless of location, socioeconomic status, or background. Break free from geographical and financial barriers that limit educational opportunities."
  }
] as const;

export const CORE_FEATURES = [
  {
    title: "Book live Sessions with experts",
    description:
      "Find and schedule one-on-one video sessions with verified experts in your field. Browse our network of professionals, view their specialties and availability, and book personalized mentoring sessions tailored to your learning goals.",
    cta: "Find & Book Experts",
    href: "/login",
    image:
      "/uploads/features_image_1.jpeg",
  },
  {
    title: "Digital Learning Library",
    description:
      "Access our comprehensive digital library with curated educational videos, articles, and interactive resources. Learn at your own pace with expert-created content designed to support your continuous skill development.",
    cta: "Explore Library",
    href: "/login",
    image:
      "/uploads/features_image_2.jpeg",
  },
] as const;

export const EDUCATION_TAGS = [
  "All",
  "Body Image",
  "Mental Health",
  "Safe Practices",
  "Real Stories",
] as const;

export const EDUCATION_RESOURCES = [
  {
    tag: "Study Techniques",
    title: "Mastering Effective Learning Strategies",
    summary:
      "Discover proven study methods and time management techniques to maximize your learning potential and academic performance.",
    image:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1100&q=80",
    href: "/education",
  },
  {
    tag: "Career Development",
    title: "Building Your Professional Portfolio",
    summary:
      "Learn how to showcase your skills and projects to stand out in today's competitive job market and connect with industry mentors.",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1100&q=80",
    href: "/education",
  },
  {
    tag: "Skill Building",
    title: "The Complete Guide to Digital Literacy",
    summary:
      "Essential digital skills for the modern workplace, from basic computer proficiency to advanced software applications.",
    image:
      "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=1100&q=80",
    href: "/education",
  },
  {
    tag: "Success Stories",
    title: "Maria's Learning Journey",
    summary:
      "How personalized mentorship and flexible scheduling helped Maria transition into her dream career while balancing work and studies.",
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1100&q=80",
    href: "/education",
  },
  {
    tag: "Study Techniques",
    title: "Overcoming Learning Plateaus",
    summary:
      "Practical strategies to break through learning barriers and maintain consistent progress in your educational journey.",
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1100&q=80",
    href: "/education",
  },
  {
    tag: "Career Development",
    title: "Networking for Career Growth",
    summary:
      "Learn how to build meaningful professional relationships and leverage connections for career advancement opportunities.",
    image:
      "https://images.unsplash.com/photo-1551836026-d5c88ac5c73d?auto=format&fit=crop&w=1100&q=80",
    href: "/education",
  },
] as const;

export const TESTIMONIALS = [

  {
    name: "Sarah J.",
    location: "Afganistan, Kabul",
    quote:
      "As a working professional, AEON's flexible scheduling and expert teachers allowed me to advance my marketing skills without compromising my job. The digital library resources were incredibly valuable.",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=256&q=80",
    rating: 5,
  },
  {
    name: "David K.",
    location: "UAE",
    quote:
      "AEON connected me with a mentor who helped learn English faster. The personalized sessions were exactly what I needed to bridge the gap between theory and practice.",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80",
    rating: 5,
  },

  {
    name: "Marcus T.",
    location: "Lagos, Nigeria",
    quote:
      "The one-on-one sessions with industry experts gave me real-world insights I couldn't get from traditional courses. AEON truly breaks down traditional educational barriers.",
    avatar:
      "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?auto=format&fit=crop&w=256&q=80",
    rating: 5,
  },
] as const;

export const JOIN_ROLES = [
  {
    key: "user",
    title: "Student",
    description:
      "Learn English with personalized lessons from expert teachers and access comprehensive learning resources.",
    perks: [
      "Personalized English lessons tailored to your learning goals",
      "Direct video sessions with verified English teachers",
      "Access to comprehensive learning resources and materials",
    ],
    href: "/signup?role=user",
    cta: "Sign up as an Individual",
  },
  {
    key: "institution",
    title: "Institution",
    description:
      "Support your community with BodyWise resources for schools, universities, and wellness organizations.",
    perks: [
      "Dedicated dashboards for community outcomes",
      "Virtual workshops from mental health professionals",
      "Co-branded programs for ongoing body confidence education",
    ],
    href: "/signup?role=institution",
    cta: "Partner with BodyWise",
  },
] as const;


