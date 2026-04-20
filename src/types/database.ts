// ==============================================
// Zelo BJJ - Database Types
// ==============================================

export type UserRole = "admin" | "member";

// Estados no app (lowercase). Referencia PagBank:
// - Transacoes avulsas: AUTHORIZED, PAID, IN_ANALYSIS, DECLINED, CANCELED
// - Assinaturas recorrentes: PENDING, TRIAL, ACTIVE, OVERDUE, PENDING_ACTION, SUSPENDED, CANCELED, EXPIRED
export type SubscriptionStatus =
  | "pending"
  | "trial"
  | "active"
  | "overdue"
  | "pending_action"
  | "suspended"
  | "canceled"
  | "expired"
  | "paid"
  | "refunded"
  | "in_analysis"
  | "declined";

export type PlanSlug = "curso_digital";

// --- Profiles ---
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: UserRole;
  pagbank_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

// --- Plans ---
export interface Plan {
  id: string;
  name: string;
  slug: PlanSlug;
  description: string | null;
  price_monthly: number;
  payment_link: string | null;
  pagbank_plan_id: string | null;
  features: string[];
  is_active: boolean;
  is_lifetime: boolean;
  sort_order: number;
  created_at: string;
}

// --- Courses ---
export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// --- Modules ---
export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
}

// --- Lessons ---
export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  bunny_video_id: string | null;
  duration_seconds: number | null;
  sort_order: number;
  is_published: boolean;
  is_free: boolean;
  created_at: string;
}

// --- Enrollments ---
export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  plan_id: string;
  enrolled_at: string;
  expires_at: string | null;
  is_active: boolean;
}

// --- Lesson Progress ---
export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  watched_seconds: number;
  completed_at: string | null;
  updated_at: string;
}

// --- Subscriptions ---
export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  pagbank_subscription_id: string | null;
  pagbank_reference_id: string | null;
  pagbank_last_charge_id: string | null;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

// --- Forum ---
export interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  created_at: string;
}

export interface ForumPost {
  id: string;
  category_id: string;
  user_id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
  // joined
  author?: Profile;
  category?: ForumCategory;
  _count?: { comments: number };
}

export interface ForumComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  // joined
  author?: Profile;
}

// --- Notifications ---
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  link: string | null;
  created_at: string;
}

// --- Audit Log ---
export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// --- Helpers for queries with joins ---
export interface CourseWithModules extends Course {
  modules: (CourseModule & { lessons: Lesson[] })[];
}

export interface EnrollmentWithCourse extends Enrollment {
  course: Course;
  plan: Plan;
}

export interface SubscriptionWithPlan extends Subscription {
  plan: Plan;
}
