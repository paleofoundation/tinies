"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import type { CoursePlayerPayload } from "@/lib/training/course-actions";
import { submitCourseExam, verifyCourseQuizAnswer } from "@/lib/training/course-actions";

type Props = { course: CoursePlayerPayload };

export function CoursePlayer({ course }: Props) {
  const router = useRouter();
  const slides = course.slides;
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});
  const [quizResult, setQuizResult] = useState<Record<string, { correct: boolean; explanation: string | null }>>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [finalOutcome, setFinalOutcome] = useState<
    | null
    | { passed: true; score: number; badgeLabel: string; certificateId: string }
    | { passed: false; score: number; passingScore: number }
  >(null);

  const slide = slides[idx];
  const progress = useMemo(() => ((idx + 1) / slides.length) * 100, [idx, slides.length]);

  const quizIds = useMemo(() => slides.filter((s) => s.slideType === "quiz").map((s) => s.id), [slides]);

  useEffect(() => {
    const s = slides[idx];
    if (s?.slideType === "quiz" && answers[s.id] !== undefined) {
      setSelectedOption(answers[s.id]!);
    } else {
      setSelectedOption(null);
    }
  }, [idx, slides, answers]);

  function goPrev() {
    setIdx((i) => Math.max(0, i - 1));
    setSelectedOption(null);
  }

  function goNext() {
    setIdx((i) => Math.min(slides.length - 1, i + 1));
    setSelectedOption(null);
  }

  async function handleQuizSubmit() {
    if (!slide || slide.slideType !== "quiz" || selectedOption == null) {
      toast.error("Choose an answer.");
      return;
    }
    const r = await verifyCourseQuizAnswer(slide.id, selectedOption);
    if ("error" in r) {
      toast.error(r.error);
      return;
    }
    setAnswers((a) => ({ ...a, [slide.id]: selectedOption }));
    setQuizSubmitted((s) => ({ ...s, [slide.id]: true }));
    setQuizResult((q) => ({ ...q, [slide.id]: { correct: r.correct, explanation: r.explanation } }));
  }

  async function handleFinishCourse() {
    const missing = quizIds.filter((id) => answers[id] === undefined);
    if (missing.length > 0) {
      toast.error("Answer all quiz questions before completing.");
      return;
    }
    setFinishing(true);
    const res = await submitCourseExam(course.slug, answers);
    setFinishing(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    if (res.passed) {
      setFinalOutcome({
        passed: true,
        score: res.score,
        badgeLabel: res.badgeLabel,
        certificateId: res.certificateId,
      });
    } else {
      setFinalOutcome({ passed: false, score: res.score, passingScore: res.passingScore });
    }
  }

  if (finalOutcome?.passed) {
    return (
      <div
        className="mx-auto max-w-lg rounded-[var(--radius-xl)] border p-10 text-center shadow-[var(--shadow-md)]"
        style={{
          borderColor: "var(--color-primary-200)",
          background: "linear-gradient(180deg, var(--color-primary-muted-08) 0%, var(--color-surface) 45%)",
        }}
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: "var(--color-primary-100)", color: "var(--color-primary)" }}>
          <Sparkles className="h-8 w-8" aria-hidden />
        </div>
        <h1 className="mt-6 font-normal text-2xl" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>
          Congratulations!
        </h1>
        <p className="mt-3 text-sm leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
          You earned the <strong style={{ color: "var(--color-primary)" }}>{finalOutcome.badgeLabel}</strong> badge. It&apos;s now visible on your public profile. Score:{" "}
          {finalOutcome.score}%.
        </p>
        <p className="mt-2 font-mono text-xs" style={{ color: "var(--color-text-muted)" }}>
          Certificate {finalOutcome.certificateId}
        </p>
        <button
          type="button"
          onClick={() => router.push("/dashboard/provider/courses")}
          className="mt-8 h-12 w-full rounded-[var(--radius-pill)] font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--color-primary)", fontFamily: "var(--font-body), sans-serif" }}
        >
          Back to courses
        </button>
      </div>
    );
  }

  if (finalOutcome && !finalOutcome.passed) {
    return (
      <div className="mx-auto max-w-lg rounded-[var(--radius-xl)] border p-10 text-center shadow-[var(--shadow-md)]" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
        <h1 className="font-normal text-2xl" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>
          Keep learning
        </h1>
        <p className="mt-3 text-sm leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
          You scored {finalOutcome.score}%. You need {finalOutcome.passingScore}% to pass. Review the material and try again.
        </p>
        <button
          type="button"
          onClick={() => {
            setFinalOutcome(null);
            setIdx(0);
            setAnswers({});
            setQuizSubmitted({});
            setQuizResult({});
            setSelectedOption(null);
          }}
          className="mt-8 h-12 w-full rounded-[var(--radius-pill)] font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--color-secondary)", fontFamily: "var(--font-body), sans-serif" }}
        >
          Retake course
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard/provider/courses")}
          className="mt-3 w-full text-sm font-semibold hover:underline"
          style={{ color: "var(--color-primary)", fontFamily: "var(--font-body), sans-serif" }}
        >
          Back to courses
        </button>
      </div>
    );
  }

  if (!slide) return null;

  const isQuiz = slide.slideType === "quiz";
  const submitted = quizSubmitted[slide.id];
  const result = quizResult[slide.id];
  const isLast = idx === slides.length - 1;
  const allQuizzesAnswered = quizIds.every((id) => answers[id] !== undefined);
  const showCompleteOnLessonEnd = isLast && !isQuiz && allQuizzesAnswered && quizIds.length > 0;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <div className="h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: "var(--color-primary-100)" }}>
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: "var(--color-primary)" }} />
        </div>
        <p className="mt-2 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
          Slide {idx + 1} of {slides.length}
        </p>
      </div>

      <article
        className="rounded-[var(--radius-xl)] border p-6 shadow-[var(--shadow-md)] sm:p-10"
        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
      >
        <h1 className="font-normal text-2xl" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>
          {slide.title}
        </h1>

        {!isQuiz ? (
          <>
            <div
              className="mt-6 max-w-none space-y-3 text-sm leading-relaxed [&_h2]:mt-4 [&_h2]:font-normal [&_h2]:text-lg [&_li]:my-1 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5"
              style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}
            >
              <ReactMarkdown>{slide.content}</ReactMarkdown>
            </div>
            {slide.imageUrl ? (
              <div className="relative mt-6 aspect-video w-full overflow-hidden rounded-[var(--radius-lg)] border" style={{ borderColor: "var(--color-border)" }}>
                <Image src={slide.imageUrl} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 42rem" />
              </div>
            ) : null}
          </>
        ) : (
          <div className="mt-6">
            <p className="text-base font-medium leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
              {slide.quizQuestion}
            </p>
            <ul className="mt-4 space-y-3">
              {(slide.quizOptions ?? []).map((opt, i) => (
                <li key={i}>
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-[var(--radius-lg)] border p-3 transition-colors ${
                      selectedOption === i ? "ring-2 ring-[var(--color-primary)]/40" : ""
                    }`}
                    style={{
                      borderColor: submitted && result
                        ? i === answers[slide.id] && result.correct
                          ? "var(--color-success)"
                          : i === answers[slide.id] && !result.correct
                            ? "var(--color-error)"
                            : "var(--color-border)"
                        : "var(--color-border)",
                      backgroundColor: "var(--color-background)",
                    }}
                  >
                    <input
                      type="radio"
                      name={`quiz-${slide.id}`}
                      className="mt-1"
                      checked={selectedOption === i}
                      disabled={submitted}
                      onChange={() => setSelectedOption(i)}
                    />
                    <span className="text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                      {opt.text}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            {!submitted ? (
              <button
                type="button"
                onClick={() => void handleQuizSubmit()}
                className="mt-6 h-11 rounded-[var(--radius-pill)] px-6 font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: "var(--color-primary)", fontFamily: "var(--font-body), sans-serif" }}
              >
                Submit answer
              </button>
            ) : result ? (
              <div
                className="mt-6 rounded-[var(--radius-lg)] border p-4 text-sm"
                style={{
                  borderColor: result.correct ? "var(--color-success-muted)" : "rgba(220, 38, 38, 0.25)",
                  backgroundColor: result.correct ? "var(--color-success-muted)" : "rgba(220, 38, 38, 0.06)",
                  fontFamily: "var(--font-body), sans-serif",
                  color: "var(--color-text)",
                }}
              >
                <p className="font-semibold">{result.correct ? "Correct" : "Not quite"}</p>
                {result.explanation ? <p className="mt-2 text-[var(--color-text-secondary)]">{result.explanation}</p> : null}
              </div>
            ) : null}
          </div>
        )}

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t pt-6" style={{ borderColor: "var(--color-border)" }}>
          <button
            type="button"
            onClick={goPrev}
            disabled={idx === 0}
            className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-pill)] border px-5 text-sm font-semibold disabled:opacity-40"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-body), sans-serif" }}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          {(isLast && isQuiz && submitted && allQuizzesAnswered) || showCompleteOnLessonEnd ? (
            <button
              type="button"
              disabled={finishing}
              onClick={() => void handleFinishCourse()}
              className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-pill)] px-6 text-sm font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: "var(--color-secondary)", fontFamily: "var(--font-body), sans-serif" }}
            >
              {finishing ? "Submitting…" : "Complete course"}
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              disabled={idx >= slides.length - 1 || (isQuiz && !submitted)}
              className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-pill)] px-5 text-sm font-semibold text-white disabled:opacity-40"
              style={{ backgroundColor: "var(--color-primary)", fontFamily: "var(--font-body), sans-serif" }}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </article>
    </div>
  );
}
