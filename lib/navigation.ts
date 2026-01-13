// Navigation configurations for different dashboard types

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  match?: "exact" | "startswith";
}

export const adminNav = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: "dashboard",
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: "team",
  },
  {
    label: "Teacher Approvals",
    href: "/admin/teachers",
    icon: "doctor",
  },
  {
    label: "Testimonials",
    href: "/admin/testimonials",
    icon: "testimonials",
  },
];

export const teacherNav = [
  {
    label: "Dashboard",
    href: "/teacher",
    icon: "dashboard",
  },
  {
    label: "My Profile",
    href: "/teacher/profile",
    icon: "user",
  },
  {
    label: "My Students",
    href: "/teacher/students",
    icon: "doctor",
  },
  {
    label: "Schedule",
    href: "/teacher/schedule",
    icon: "schedule",
  },
];

// Organization routes kept for backward compatibility but merged with admin
export const institutionNav = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: "dashboard",
  },
  {
    label: "Teachers",
    href: "/admin/users",
    icon: "doctor",
  },
  {
    label: "Documents",
    href: "/admin/blogs",
    icon: "docs",
  },
];

export const studentNav = [
  {
    label: "Dashboard",
    href: "/student",
    icon: "dashboard",
  },
  {
    label: "Find Teachers",
    href: "/student/teachers",
    icon: "doctor",
  },
  {
    label: "Resource Hub",
    href: "/resourceHub",
    icon: "docs",
  },
  {
    label: "Share Testimonial",
    href: "/testimonials",
    icon: "testimonials",
  },
];
