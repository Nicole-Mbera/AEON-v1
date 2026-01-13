export const COLORS = {
  backgroundDeep: "#596ee5ff",
  backgroundMid: "#595bcaff",
  backgroundLight: "#95a3ccff",
  cardBackground: "#596ee5ff",
  surface: "#596ee5ff",
  textPrimary: "#000000ff",
  textSecondary: "#000000ff",
  accent: "#596ee5ff",
  accentDark: "#000000ff",
  highlight: "#b8bcf0ff",
  chipActive: "#3a436aff",
  chipInactive: "#d5d6e9ff",
} as const;

export const FONT_FAMILY = {
  primary: "Poppins, var(--font-geist-sans), system-ui, sans-serif",
};

// Platform information
export const PLATFORM = {
  name: "AEON",
  tagline: "Transform Your Learning Journey",
  description: "Connect with expert teachers for personalized education. Master new skills, achieve your goals, and unlock your potential.",
} as const;

// User roles
export const ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
} as const;

// English proficiency levels
export const ENGLISH_LEVELS = [
  'beginner',
  'elementary',
  'intermediate',
  'upper-intermediate',
  'advanced',
  'proficient'
] as const;

// Lesson categories
export const LESSON_CATEGORIES = [
  'General English',
  'Business English',
  'Academic English',
  'Conversation Practice',
  'Grammar',
  'Pronunciation',
  'Writing',
  'Reading Comprehension',
  'Test Preparation (IELTS/TOEFL)',
  'Interview Preparation',
] as const;

// Resource categories
export const RESOURCE_CATEGORIES = [
  'Grammar Lessons',
  'Vocabulary Building',
  'Pronunciation Guides',
  'Reading Materials',
  'Writing Tips',
  'Listening Practice',
  'Speaking Exercises',
  'Test Prep Resources',
  'Cultural Insights',
  'Study Tips',
] as const;

export const SOCIAL_LINKS = [
  { name: "X", href: "https://twitter.com/aeonlearning" },
  { name: "Instagram", href: "https://instagram.com/aeonlearning" },
  { name: "YouTube", href: "https://youtube.com/@aeonlearning" },
  { name: "LinkedIn", href: "https://linkedin.com/company/aeon-learning" },
] as const;

export const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "About", href: "#why" },
  { label: "Testimonials", href: "#community" },
  { label: "Library", href: "/resourceHub" },
  { label: "Teachers", href: "/teachers" },
  { label: "Login", href: "/login" },
] as const;



