"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export type TrainingCourseListItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  required: boolean;
  badgeLabel: string;
  badgeColor: string | null;
  estimatedMinutes: number;
  totalSlides: number;
  passingScore: number;
  certification: {
    passed: boolean;
    score: number;
    completedAt: Date;
    certificateId: string | null;
  } | null;
};

export type PublicCertification = {
  courseTitle: string;
  courseSlug: string;
  badgeLabel: string;
  badgeColor: string | null;
  score: number;
  completedAt: Date;
  certificateId: string | null;
};

export type CourseSlidePublic = {
  id: string;
  slideNumber: number;
  title: string;
  content: string;
  imageUrl: string | null;
  slideType: "lesson" | "quiz";
  quizQuestion: string | null;
  /** Options without correctness (client never sees answers). */
  quizOptions: { text: string }[] | null;
  quizExplanation: string | null;
};

export type CoursePlayerPayload = {
  slug: string;
  title: string;
  passingScore: number;
  badgeLabel: string;
  slides: CourseSlidePublic[];
};

function stripQuizOptions(raw: unknown): { text: string }[] | null {
  if (!Array.isArray(raw)) return null;
  return raw
    .filter((o): o is { text?: string } => o != null && typeof o === "object")
    .map((o) => ({ text: String(o.text ?? "") }))
    .filter((o) => o.text.length > 0);
}

function parseQuizOptionsWithAnswers(raw: unknown): { text: string; isCorrect: boolean }[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((o): o is { text?: string; isCorrect?: boolean } => o != null && typeof o === "object")
    .map((o) => ({
      text: String(o.text ?? ""),
      isCorrect: Boolean(o.isCorrect),
    }))
    .filter((o) => o.text.length > 0);
}

function generateCertificateId(): string {
  const y = new Date().getUTCFullYear();
  const suffix = randomBytes(4).toString("hex").toUpperCase();
  return `TIN-${y}-${suffix}`;
}

async function assertProviderUser(userId: string): Promise<boolean> {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return u?.role === UserRole.provider;
}

export async function getProviderHasCompletedRequiredTraining(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  if (!(await assertProviderUser(user.id))) return true;

  const required = await prisma.course.findMany({
    where: { active: true, required: true },
    select: { id: true },
  });
  if (required.length === 0) return true;

  const certs = await prisma.providerCertification.findMany({
    where: {
      providerId: user.id,
      passed: true,
      courseId: { in: required.map((r) => r.id) },
    },
    select: { courseId: true },
  });
  const done = new Set(certs.map((c) => c.courseId));
  return required.every((r) => done.has(r.id));
}

export async function listProviderTrainingCourses(): Promise<TrainingCourseListItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  if (!(await assertProviderUser(user.id))) return [];

  const courses = await prisma.course.findMany({
    where: { active: true },
    orderBy: [{ required: "desc" }, { category: "asc" }, { title: "asc" }],
  });

  const certs = await prisma.providerCertification.findMany({
    where: { providerId: user.id },
  });
  const certByCourse = new Map(certs.map((c) => [c.courseId, c]));

  return courses.map((c) => {
    const cert = certByCourse.get(c.id);
    return {
      id: c.id,
      slug: c.slug,
      title: c.title,
      description: c.description,
      category: c.category,
      required: c.required,
      badgeLabel: c.badgeLabel,
      badgeColor: c.badgeColor,
      estimatedMinutes: c.estimatedMinutes,
      totalSlides: c.totalSlides,
      passingScore: c.passingScore,
      certification: cert
        ? {
            passed: cert.passed,
            score: cert.score,
            completedAt: cert.completedAt,
            certificateId: cert.certificateId,
          }
        : null,
    };
  });
}

export type CoursePageState =
  | {
      mode: "play";
      course: CoursePlayerPayload;
    }
  | {
      mode: "completed";
      slug: string;
      title: string;
      badgeLabel: string;
      badgeColor: string | null;
      score: number;
      completedAt: Date;
      certificateId: string | null;
    }
  | { mode: "missing" };

export async function getProviderCoursePageState(slug: string): Promise<CoursePageState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { mode: "missing" };
  if (!(await assertProviderUser(user.id))) return { mode: "missing" };

  const course = await prisma.course.findFirst({
    where: { slug, active: true },
    include: {
      slides: { orderBy: { slideNumber: "asc" } },
      certifications: {
        where: { providerId: user.id, passed: true },
        take: 1,
      },
    },
  });
  if (!course) return { mode: "missing" };

  const passedCert = course.certifications[0];
  if (passedCert) {
    return {
      mode: "completed",
      slug: course.slug,
      title: course.title,
      badgeLabel: course.badgeLabel,
      badgeColor: course.badgeColor,
      score: passedCert.score,
      completedAt: passedCert.completedAt,
      certificateId: passedCert.certificateId,
    };
  }

  return {
    mode: "play",
    course: {
      slug: course.slug,
      title: course.title,
      passingScore: course.passingScore,
      badgeLabel: course.badgeLabel,
      slides: course.slides.map((s) => ({
        id: s.id,
        slideNumber: s.slideNumber,
        title: s.title,
        content: s.content,
        imageUrl: s.imageUrl,
        slideType: s.slideType === "quiz" ? "quiz" : "lesson",
        quizQuestion: s.quizQuestion,
        quizOptions: s.slideType === "quiz" ? stripQuizOptions(s.quizOptions) : null,
        quizExplanation: s.quizExplanation,
      })),
    },
  };
}

/** Allows replaying failed attempts; blocks if already passed. */
export async function submitCourseExam(
  courseSlug: string,
  answersBySlideId: Record<string, number>
): Promise<
  | { ok: true; passed: true; score: number; badgeLabel: string; certificateId: string }
  | { ok: true; passed: false; score: number; passingScore: number }
  | { ok: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };
  if (!(await assertProviderUser(user.id))) return { ok: false, error: "Only providers can complete courses." };

  const course = await prisma.course.findFirst({
    where: { slug: courseSlug, active: true },
    include: { slides: { orderBy: { slideNumber: "asc" } } },
  });
  if (!course) return { ok: false, error: "Course not found." };

  const existingPass = await prisma.providerCertification.findFirst({
    where: { providerId: user.id, courseId: course.id, passed: true },
  });
  if (existingPass) return { ok: false, error: "You have already passed this course." };

  const quizSlides = course.slides.filter((s) => s.slideType === "quiz");
  if (quizSlides.length === 0) return { ok: false, error: "This course has no quiz." };

  let correct = 0;
  for (const slide of quizSlides) {
    const opts = parseQuizOptionsWithAnswers(slide.quizOptions);
    const idx = answersBySlideId[slide.id];
    if (typeof idx !== "number" || idx < 0 || idx >= opts.length) continue;
    if (opts[idx]?.isCorrect) correct += 1;
  }

  const score = Math.round((100 * correct) / quizSlides.length);
  const passed = score >= course.passingScore;
  const completedAt = new Date();
  const certificateId = passed ? generateCertificateId() : null;

  await prisma.providerCertification.upsert({
    where: {
      providerId_courseId: { providerId: user.id, courseId: course.id },
    },
    create: {
      providerId: user.id,
      courseId: course.id,
      score,
      passed,
      completedAt,
      certificateId,
    },
    update: {
      score,
      passed,
      completedAt,
      certificateId: passed ? certificateId : null,
    },
  });

  revalidatePath("/dashboard/provider");
  revalidatePath("/dashboard/provider/courses");
  revalidatePath(`/dashboard/provider/courses/${courseSlug}`);

  const profile = await prisma.providerProfile.findUnique({
    where: { userId: user.id },
    select: { slug: true },
  });
  if (profile?.slug) {
    revalidatePath(`/services/provider/${profile.slug}`);
  }

  if (passed) {
    return {
      ok: true,
      passed: true,
      score,
      badgeLabel: course.badgeLabel,
      certificateId: certificateId!,
    };
  }
  return { ok: true, passed: false, score, passingScore: course.passingScore };
}

/** Immediate feedback during the course player (does not persist). */
export async function verifyCourseQuizAnswer(
  slideId: string,
  selectedIndex: number
): Promise<{ correct: boolean; explanation: string | null } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };
  if (!(await assertProviderUser(user.id))) return { error: "Only providers can take courses." };

  const slide = await prisma.courseSlide.findUnique({
    where: { id: slideId },
    include: { course: { select: { active: true } } },
  });
  if (!slide || !slide.course.active || slide.slideType !== "quiz") {
    return { error: "Invalid question." };
  }

  const opts = parseQuizOptionsWithAnswers(slide.quizOptions);
  if (selectedIndex < 0 || selectedIndex >= opts.length) return { error: "Invalid option." };
  const correct = Boolean(opts[selectedIndex]?.isCorrect);
  return { correct, explanation: slide.quizExplanation };
}

export async function getPublicCertificationsForProviderUserId(
  providerUserId: string
): Promise<PublicCertification[]> {
  const rows = await prisma.providerCertification.findMany({
    where: { providerId: providerUserId, passed: true },
    include: { course: { select: { title: true, slug: true, badgeLabel: true, badgeColor: true } } },
    orderBy: { completedAt: "asc" },
  });
  return rows.map((r) => ({
    courseTitle: r.course.title,
    courseSlug: r.course.slug,
    badgeLabel: r.course.badgeLabel,
    badgeColor: r.course.badgeColor,
    score: r.score,
    completedAt: r.completedAt,
    certificateId: r.certificateId,
  }));
}
