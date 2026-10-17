## Goal

Add quiz generation to the AISNQ prototype. From inside the study notes dialog, the student picks a quiz type, Gemini generates questions based only on the study notes (not the original PDF), the student answers them, and a results view shows the score, the correct answers, and a summary.

## Design Decisions

- The notes dialog gets a "Generate quiz" button.
- Clicking it moves the same dialog to an options step (not a second nested dialog, to avoid stacked-dialog focus and scroll issues). Dialog views: `notes` -> `options` -> `generating` -> `quiz` -> `results`.
- Options step:
  - Quiz type: Multiple choice, Identification, True or false, Mixed.
  - If Mixed: the student picks which type to prioritize (Multiple choice, Identification, or True or false). The prioritized type makes up about half of the questions, and the other two types split the rest.
  - Number of questions: 5, 10, or 15 (default 10).
- The "Generate" button shows a shadcn `Spinner` and is disabled while the request is running.
- Quiz view: one question at a time with Previous/Next, a `Progress` bar, and a Submit button that enables once every question is answered.
  - Multiple choice: `RadioGroup`.
  - True or false: two-option `RadioGroup`.
  - Identification: text `Input`.
- Results view:
  - Score ("7 / 10") and percentage.
  - A per-question review: the question, the student's answer, the correct answer, whether it was right or wrong, and a short explanation.
  - A summary line listing the note sections the student missed most.
  - Buttons: "Retake", "New quiz", "Back to notes".
- Uses shadcn/ui components. Note: there is no official shadcn `questionnaire` component that I know of, so the quiz UI is composed from `RadioGroup`, `Input`, `Progress`, `Card`, `Badge`, and `Button`.
- Gemini receives only the Notes JSON as input. The PDF is not re-sent.
- Grading happens on the client, so the answer key is part of the API response. This is acceptable for a self-study prototype.
- Nothing is persisted. If the student refreshes, the notes and quiz are lost.

## Implementations

**Frontend**
- Extend the notes dialog with a view state machine (`notes | options | generating | quiz | results`).
- `components/quiz/quiz-options.tsx`: type, priority (only shown for Mixed), and count.
- `components/quiz/quiz-runner.tsx`: question navigation, answer state, and Submit.
- `components/quiz/quiz-results.tsx`: score, per-question review, and summary.
- `lib/grade-quiz.ts`: grading logic.
  - Multiple choice and true/false: exact match on the correct option.
  - Identification: normalize (trim, lowercase, strip punctuation and extra spaces), then compare against `correctAnswer` and every entry in `acceptedAnswers`.

**Backend (`app/api/quiz/route.ts`)**
- Accepts `{ notes, type, priority?, count }` as JSON.
- Validates the body with zod. `notes` must match the existing notes schema, `type` must be one of the four allowed values, `priority` is required only when `type` is `mixed`, and `count` must be 5, 10, or 15.
- Sends the notes and the quiz prompt to Gemini with JSON output and a response schema.
- Validates the response with zod and these extra checks, rejecting the whole quiz if any fail:
  - The number of questions equals the requested count.
  - Every multiple-choice question has exactly 4 options, and its correct answer is one of them.
  - Every true/false answer is a boolean.
  - Every identification question has a non-empty `correctAnswer`.
  - No two questions share the same prompt.
- Returns `{ quiz, meta: { durationMs } }`. Nothing is stored.

**Quiz JSON shape**
{
  "questions": [
    {
      "id": "q1",
      "type": "multiple_choice | identification | true_false",
      "prompt": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": "string | boolean",
      "acceptedAnswers": ["string"],
      "explanation": "string",
      "sourceSection": "string"
    }
  ]
}
`options` applies only to multiple choice. `acceptedAnswers` applies only to identification. `sourceSection` is the heading from the notes the question was based on, which powers the "most missed sections" summary.

**Prompt guidance (first version)**
- Use only the provided study notes. Do not add outside facts.
- Cover the notes evenly across sections and key terms.
- Multiple choice: exactly one correct answer, plausible distractors.
- Identification: the answer must be a short term or phrase, and include likely accepted variants (for example, singular and plural forms).
- True or false: avoid trick wording and avoid statements that are only half true.
- Each question includes a one-sentence explanation that refers back to the notes.
- Return only JSON matching the schema.

## Core Flows

1. **Happy path:** open the notes dialog -> Generate quiz -> pick type and count -> Generate -> spinner -> answer each question -> Submit -> results.
2. **Mixed:** the student picks Mixed -> a priority picker appears -> the quiz is generated with that type weighted at about half.
3. **Invalid quiz from Gemini:** malformed JSON, wrong question count, or a correct answer not in the options -> the whole quiz is rejected, an error toast is shown, and the student stays on the options step to retry.
4. **Provider failure or rate limit:** error toast, the options stay selected, and the student can retry.
5. **Very short notes:** if the notes contain too little content for the requested count, the student sees an error rather than padded or repeated questions.
6. **Closing mid-quiz:** closing the dialog discards in-progress answers. (Open decision below.)
7. **Retake and new quiz:** Retake reuses the same questions with cleared answers. New quiz returns to the options step.

## Complete when

- The notes dialog has a "Generate quiz" button that opens the options step.
- Quiz type, count, and (for Mixed) priority can be chosen, and priority appears only for Mixed.
- Generating shows the Spinner and disables the button until the request ends.
- The quiz contains exactly the requested number of questions, in the selected type or mix.
- Every question comes from the study notes, and each carries a `sourceSection`.
- Multiple choice and true/false use RadioGroup, and identification uses Input.
- Submit is disabled until all questions are answered.
- The results view shows the score, the correct answers, the student's answers, explanations, and the most-missed sections.
- Identification answers are graded case-insensitively and ignore punctuation and extra spaces.
- An invalid or failed generation shows a toast and does not show a broken quiz.
- A disclaimer is visible on the results: "Quiz questions are generated from your study notes, not your full module, and may contain errors."
- The Gemini key is not exposed to the client.