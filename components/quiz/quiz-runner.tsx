"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { isAnswered, type Answer, type Answers } from "@/lib/grade-quiz";
import type { Question, Quiz } from "@/lib/quiz-schema";

const labels = {
  multiple_choice: "Multiple choice",
  identification: "Identification",
  true_false: "True or false",
};

function QuestionAnswer({ question, answer, onChange }: {
  question: Question;
  answer: Answer;
  onChange: (answer: Answer) => void;
}) {
  if (question.type === "identification") {
    return (
      <Input
        aria-label="Your answer"
        autoComplete="off"
        placeholder="Type a short answer"
        value={typeof answer === "string" ? answer : ""}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  const options = question.type === "true_false" ? ["True", "False"] : question.options;
  const value: string | null = question.type === "true_false"
    ? typeof answer === "boolean" ? String(answer) : null
    : typeof answer === "string" ? answer : null;

  return (
    <RadioGroup
      aria-label="Answer choices"
      value={value}
      onValueChange={(selected) => onChange(
        question.type === "true_false" ? selected === "true" : String(selected),
      )}
      className="gap-2"
    >
      {options.map((option) => (
        <label key={option} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm has-data-checked:border-primary has-data-checked:bg-primary/5">
          <RadioGroupItem value={question.type === "true_false" ? option.toLowerCase() : option} />
          {option}
        </label>
      ))}
    </RadioGroup>
  );
}

export function QuizRunner({ quiz, onSubmit, onNavigate }: {
  quiz: Quiz;
  onSubmit: (answers: Answers) => void;
  onNavigate: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const question = quiz.questions[index];
  const answered = quiz.questions.filter((item) => isAnswered(item, answers[item.id])).length;
  const complete = answered === quiz.questions.length;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>Question {index + 1} of {quiz.questions.length}</span>
          <span>{answered} answered</span>
        </div>
        <Progress value={((index + 1) / quiz.questions.length) * 100} aria-label="Quiz progress" />
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{labels[question.type]}</Badge>
            <span className="text-xs text-muted-foreground">From {question.sourceSection}</span>
          </div>
          <CardTitle id="current-question" className="text-xl leading-snug">{question.prompt}</CardTitle>
        </CardHeader>
        <CardContent>
          <QuestionAnswer
            question={question}
            answer={answers[question.id]}
            onChange={(answer) => setAnswers((previous) => ({ ...previous, [question.id]: answer }))}
          />
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" disabled={index === 0} onClick={() => { setIndex(index - 1); onNavigate(); }}>Previous</Button>
        <Button variant="outline" disabled={index === quiz.questions.length - 1} onClick={() => { setIndex(index + 1); onNavigate(); }}>Next</Button>
        <Button className="ml-auto" disabled={!complete} onClick={() => onSubmit(answers)}>Submit quiz</Button>
      </div>
    </div>
  );
}
