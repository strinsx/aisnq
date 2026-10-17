import type { Question, Quiz } from "@/lib/quiz-schema";

export type Answer = string | boolean | undefined;
export type Answers = Record<string, Answer>;

export function normalizeIdentification(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function isAnswered(question: Question, answer: Answer) {
  return question.type === "true_false"
    ? typeof answer === "boolean"
    : typeof answer === "string" && answer.trim().length > 0;
}

export function gradeQuiz(quiz: Quiz, answers: Answers) {
  const review = quiz.questions.map((question) => {
    const answer = answers[question.id];
    let correct = false;
    if (question.type === "identification" && typeof answer === "string") {
      const normalized = normalizeIdentification(answer);
      correct = [question.correctAnswer, ...question.acceptedAnswers].some(
        (candidate) => normalizeIdentification(candidate) === normalized,
      );
    } else if (question.type === "true_false") {
      correct = answer === question.correctAnswer;
    } else if (question.type === "multiple_choice") {
      correct = answer === question.correctAnswer;
    }
    return { question, answer, correct };
  });

  const score = review.filter((item) => item.correct).length;
  const missed = new Map<string, number>();
  for (const item of review) {
    if (!item.correct) {
      missed.set(item.question.sourceSection, (missed.get(item.question.sourceSection) ?? 0) + 1);
    }
  }
  const highest = Math.max(0, ...missed.values());
  const mostMissedSections = [...missed]
    .filter(([, count]) => count === highest)
    .map(([section]) => section);
  return { score, total: review.length, review, mostMissedSections };
}

export type QuizResult = ReturnType<typeof gradeQuiz>;
