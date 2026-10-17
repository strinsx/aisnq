"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { QuizResult } from "@/lib/grade-quiz";

function answerText(value: string | boolean | undefined) {
  if (value === undefined) return "No answer";
  if (typeof value === "boolean") return value ? "True" : "False";
  return value;
}

export function QuizResults({ result, onRetake, onNewQuiz, onBack }: {
  result: QuizResult;
  onRetake: () => void;
  onNewQuiz: () => void;
  onBack: () => void;
}) {
  const percent = Math.round((result.score / result.total) * 100);
  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <div className="space-y-2">
        <p className="font-mono text-xs tracking-[0.18em] text-muted-foreground uppercase">Quiz results</p>
        <h2 className="font-heading text-4xl font-semibold">{result.score} / {result.total}</h2>
        <p className="text-lg">{percent}% correct</p>
        <p className="text-sm text-muted-foreground">
          {result.mostMissedSections.length
            ? `Most missed sections: ${result.mostMissedSections.join(", ")}.`
            : "No missed sections. Well done!"}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={onRetake}>Retake</Button>
        <Button variant="outline" onClick={onNewQuiz}>New quiz</Button>
        <Button variant="ghost" onClick={onBack}>Back to notes</Button>
      </div>

      <section className="space-y-4" aria-label="Question review">
        {result.review.map(({ question, answer, correct }, index) => (
          <Card key={question.id}>
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={correct ? "border-primary/30 bg-primary/10" : "border-destructive/30 bg-destructive/10 text-destructive"}>
                  {correct ? "Correct" : "Incorrect"}
                </Badge>
                <span className="text-xs text-muted-foreground">Question {index + 1} · {question.sourceSection}</span>
              </div>
              <CardTitle>{question.prompt}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><span className="font-medium">Your answer:</span> {answerText(answer)}</p>
              <p><span className="font-medium">Correct answer:</span> {answerText(question.correctAnswer)}</p>
              <p className="text-muted-foreground">{question.explanation}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <p className="border-t border-border pt-5 text-sm text-muted-foreground">
        Quiz questions are generated from your study notes, not your full module, and may contain errors.
      </p>
    </div>
  );
}
