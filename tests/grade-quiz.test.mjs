import assert from "node:assert/strict";
import test from "node:test";

import { gradeQuiz, isAnswered, normalizeIdentification } from "../lib/grade-quiz.ts";

test("identification ignores case, punctuation, and extra spaces", () => {
  assert.equal(normalizeIdentification("  CELL,   WALL! "), "cell wall");
  assert.equal(normalizeIdentification("cell-wall"), "cellwall");
  const quiz = {
    questions: [{
      id: "q1", type: "identification", prompt: "Name it", correctAnswer: "Cell wall",
      acceptedAnswers: ["Cell-wall"], explanation: "In the notes.", sourceSection: "Cells",
    }],
  };
  assert.equal(gradeQuiz(quiz, { q1: " CELL,   WALL! " }).score, 1);
  assert.equal(gradeQuiz(quiz, { q1: "cell-wall" }).score, 1);
});

test("multiple choice is exact, false counts as answered, and missed sections are summarized", () => {
  const quiz = {
    questions: [
      { id: "q1", type: "multiple_choice", prompt: "One", options: ["A", "B", "C", "D"], correctAnswer: "A", explanation: "A.", sourceSection: "First" },
      { id: "q2", type: "true_false", prompt: "Two", correctAnswer: false, explanation: "False.", sourceSection: "Second" },
      { id: "q3", type: "identification", prompt: "Three", correctAnswer: "term", acceptedAnswers: [], explanation: "Term.", sourceSection: "First" },
    ],
  };
  assert.equal(isAnswered(quiz.questions[1], false), true);
  assert.equal(isAnswered(quiz.questions[2], "   "), false);
  const result = gradeQuiz(quiz, { q1: "a", q2: false, q3: "wrong" });
  assert.equal(result.score, 1);
  assert.deepEqual(result.mostMissedSections, ["First"]);
});
