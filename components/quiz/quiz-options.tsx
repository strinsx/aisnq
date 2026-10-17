"use client";

import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";
import type { QuestionType, QuizCount, QuizType } from "@/lib/quiz-schema";

const typeLabels: Record<QuizType, string> = {
  multiple_choice: "Multiple choice",
  identification: "Identification",
  true_false: "True or false",
  mixed: "Mixed",
};

const priorityTypes: QuestionType[] = ["multiple_choice", "identification", "true_false"];

type Props = {
  type: QuizType;
  priority: QuestionType;
  count: QuizCount;
  busy: boolean;
  onTypeChange: (type: QuizType) => void;
  onPriorityChange: (type: QuestionType) => void;
  onCountChange: (count: QuizCount) => void;
  onGenerate: () => void;
  onBack: () => void;
};

export function QuizOptions(props: Props) {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <div className="space-y-2">
        <p className="font-mono text-xs tracking-[0.18em] text-muted-foreground uppercase">Practice</p>
        <h2 className="font-heading text-3xl font-semibold">Generate a quiz</h2>
        <p className="text-muted-foreground">Choose questions based on your study notes.</p>
      </div>

      <section className="space-y-3" aria-labelledby="quiz-type-label">
        <h3 id="quiz-type-label" className="font-medium">Quiz type</h3>
        <RadioGroup
          aria-labelledby="quiz-type-label"
          value={props.type}
          onValueChange={(value) => props.onTypeChange(value as QuizType)}
          className="grid gap-2 sm:grid-cols-2"
        >
          {(Object.keys(typeLabels) as QuizType[]).map((type) => (
            <label key={type} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm has-data-checked:border-primary">
              <RadioGroupItem value={type} disabled={props.busy} />
              {typeLabels[type]}
            </label>
          ))}
        </RadioGroup>
      </section>

      {props.type === "mixed" && (
        <section className="space-y-3" aria-labelledby="quiz-priority-label">
          <h3 id="quiz-priority-label" className="font-medium">Prioritize a question type</h3>
          <p className="text-sm text-muted-foreground">About half the questions will use this type.</p>
          <RadioGroup
            aria-labelledby="quiz-priority-label"
            value={props.priority}
            onValueChange={(value) => props.onPriorityChange(value as QuestionType)}
            className="grid gap-2 sm:grid-cols-3"
          >
            {priorityTypes.map((type) => (
              <label key={type} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm has-data-checked:border-primary">
                <RadioGroupItem value={type} disabled={props.busy} />
                {typeLabels[type]}
              </label>
            ))}
          </RadioGroup>
        </section>
      )}

      <section className="space-y-3" aria-labelledby="quiz-count-label">
        <h3 id="quiz-count-label" className="font-medium">Number of questions</h3>
        <RadioGroup
          aria-labelledby="quiz-count-label"
          value={String(props.count)}
          onValueChange={(value) => props.onCountChange(Number(value) as QuizCount)}
          className="grid grid-cols-3 gap-2"
        >
          {([5, 10, 15] as QuizCount[]).map((count) => (
            <label key={count} className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm has-data-checked:border-primary">
              <RadioGroupItem value={String(count)} disabled={props.busy} />
              {count}
            </label>
          ))}
        </RadioGroup>
      </section>

      <div className="flex flex-wrap gap-2 border-t border-border pt-5">
        <Button variant="outline" onClick={props.onBack} disabled={props.busy}>Back to notes</Button>
        <Button onClick={props.onGenerate} disabled={props.busy} aria-busy={props.busy}>
          {props.busy && <Spinner />}
          {props.busy ? "Generating…" : "Generate"}
        </Button>
      </div>
    </div>
  );
}
