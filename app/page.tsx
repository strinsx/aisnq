"use client";

import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { ArrowLeftIcon, FileTextIcon, UploadIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { QuizOptions } from "@/components/quiz/quiz-options";
import { QuizResults } from "@/components/quiz/quiz-results";
import { QuizRunner } from "@/components/quiz/quiz-runner";
import { gradeQuiz, type QuizResult } from "@/lib/grade-quiz";
import { notesSchema, type Notes } from "@/lib/notes-schema";
import {
  quizSchema,
  validateQuiz,
  type QuestionType,
  type Quiz,
  type QuizCount,
  type QuizType,
} from "@/lib/quiz-schema";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const DISCLAIMER =
  "AI-generated notes can contain errors or omit details. Check them against your original material.";

type Phase = "idle" | "fileSelected" | "processing" | "done" | "error";
type Result = { notes: Notes; filename: string; elapsedMs: number };
type QuizView = "notes" | "options" | "generating" | "quiz" | "results";

function responseError(value: unknown, fallback = "Notes could not be generated right now. Please try again.") {
  if (
    value &&
    typeof value === "object" &&
    "error" in value &&
    typeof value.error === "string"
  ) {
    return value.error;
  }
  return fallback;
}

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [quizView, setQuizView] = useState<QuizView>("notes");
  const [quizType, setQuizType] = useState<QuizType>("multiple_choice");
  const [quizPriority, setQuizPriority] = useState<QuestionType>("multiple_choice");
  const [quizCount, setQuizCount] = useState<QuizCount>(10);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [retakeKey, setRetakeKey] = useState(0);
  const quizAbortRef = useRef<AbortController | null>(null);
  const dialogScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dialogScrollRef.current?.scrollTo(0, 0);
  }, [quizView]);

  const isProcessing = phase === "processing";

  function selectFile(nextFile: File | null) {
    if (!nextFile || isProcessing) return;
    if (nextFile.type !== "application/pdf") {
      toast.error("Please upload a PDF file.");
      return;
    }
    if (nextFile.size > MAX_FILE_SIZE) {
      toast.error("PDFs must be 10 MB or smaller.");
      return;
    }
    if (nextFile.size === 0) {
      toast.error("This PDF is empty. Choose another file.");
      return;
    }

    setFile(nextFile);
    setResult(null);
    setPhase("fileSelected");
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    selectFile(event.target.files?.item(0) ?? null);
    event.target.value = "";
  }

  function handleDragEnter(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (isProcessing) return;
    dragDepth.current += 1;
    setIsDragOver(true);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (!isProcessing) event.dataTransfer.dropEffect = "copy";
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (isProcessing) return;
    dragDepth.current -= 1;
    if (dragDepth.current <= 0) {
      dragDepth.current = 0;
      setIsDragOver(false);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragDepth.current = 0;
    setIsDragOver(false);
    selectFile(event.dataTransfer.files.item(0));
  }

  function removeFile() {
    setFile(null);
    setResult(null);
    setPhase("idle");
  }

  async function beginProcessing() {
    if (!file || isProcessing) return;

    setPhase("processing");
    setResult(null);
    const startedAt = performance.now();
    const body = new FormData();
    body.append("file", file);

    try {
      const response = await fetch("/api/notes", { method: "POST", body });
      const elapsedMs = performance.now() - startedAt;
      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) throw new Error(responseError(payload));
      if (!payload || typeof payload !== "object" || !("notes" in payload)) {
        throw new Error("The notes could not be read. Please try again.");
      }

      const notes = notesSchema.safeParse(payload.notes);
      if (!notes.success) {
        throw new Error("The notes could not be read. Please try again.");
      }

      setResult({ notes: notes.data, filename: file.name, elapsedMs });
      setPhase("done");
    } catch (error) {
      setPhase("error");
      toast.error(
        error instanceof Error
          ? error.message
          : "Notes could not be generated right now. Please try again.",
      );
    }
  }

  function resetQuiz() {
    quizAbortRef.current?.abort();
    quizAbortRef.current = null;
    setQuizView("notes");
    setQuiz(null);
    setQuizResult(null);
    setRetakeKey(0);
    setQuizType("multiple_choice");
    setQuizPriority("multiple_choice");
    setQuizCount(10);
  }

  async function generateQuiz() {
    if (!result || quizView === "generating") return;
    const controller = new AbortController();
    quizAbortRef.current = controller;
    setQuizView("generating");

    const requestBody = {
      notes: result.notes,
      type: quizType,
      ...(quizType === "mixed" ? { priority: quizPriority } : {}),
      count: quizCount,
    };

    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
      const payload: unknown = await response.json().catch(() => null);
      if (controller.signal.aborted) return;
      if (!response.ok) throw new Error(responseError(payload, "Quiz generation failed. Please retry."));
      if (!payload || typeof payload !== "object" || !("quiz" in payload)) {
        throw new Error("The quiz could not be read. Please retry.");
      }
      const parsed = quizSchema.safeParse(payload.quiz);
      if (!parsed.success || !validateQuiz(parsed.data, requestBody)) {
        throw new Error("The generated quiz was incomplete. Please retry.");
      }
      setQuiz(parsed.data);
      setQuizResult(null);
      setRetakeKey(0);
      setQuizView("quiz");
    } catch (error) {
      if (controller.signal.aborted) return;
      setQuizView("options");
      toast.error(error instanceof Error ? error.message : "Quiz generation failed. Please retry.");
    } finally {
      if (quizAbortRef.current === controller) quizAbortRef.current = null;
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-10 px-5 py-12 sm:px-8 sm:py-16">
      <header className="space-y-3">
        <p className="font-mono text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
          AISNQ
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Turn a PDF into study notes
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Upload your course material and get a structured notes draft to review.
        </p>
      </header>

      <section aria-label="PDF upload" className="space-y-6">
        <Empty
          aria-busy={isProcessing}
          className={`min-h-80 border-2 transition-colors ${
            isDragOver ? "border-primary bg-primary/5" : "border-border bg-card/50"
          }`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <EmptyHeader>
            <EmptyMedia variant="icon" className="size-11 [&_svg]:size-5">
              <FileTextIcon aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle className="text-lg">
              {file ? "PDF ready to process" : "Drop your PDF here"}
            </EmptyTitle>
            <EmptyDescription>
              {file
                ? "Review your selection, then generate your notes."
                : "Choose a course handout or reading, up to 10 MB."}
            </EmptyDescription>
          </EmptyHeader>

          <EmptyContent>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="sr-only"
              tabIndex={-1}
              aria-label="Choose a PDF"
              onChange={handleInputChange}
              disabled={isProcessing}
            />
            {file && (
              <p className="max-w-full truncate font-medium" title={file.name}>
                {file.name}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                variant="outline"
                disabled={isProcessing}
                onClick={() => inputRef.current?.click()}
              >
                <UploadIcon aria-hidden="true" />
                Upload PDF
              </Button>
              {file && (
                <>
                  <Button disabled={isProcessing} onClick={beginProcessing}>
                    {isProcessing && <Spinner />}
                    {isProcessing ? "Processing…" : "Begin processing"}
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={isProcessing}
                    onClick={removeFile}
                  >
                    Remove
                  </Button>
                </>
              )}
            </div>
          </EmptyContent>
        </Empty>

        {phase === "done" && result && (
          <Dialog onOpenChange={(open) => { if (!open) resetQuiz(); }}>
            <DialogTrigger className="block w-full cursor-pointer rounded-xl text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
              <Card className="transition-colors hover:bg-accent/50">
                <CardHeader>
                  <CardTitle className="text-lg">{result.notes.title}</CardTitle>
                  <CardDescription className="font-mono text-xs break-all">
                    Source: {result.filename}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>{result.notes.summary}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    Generated in {(result.elapsedMs / 1000).toFixed(1)} s · Open notes
                  </p>
                  <p className="text-xs text-muted-foreground">{DISCLAIMER}</p>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent
              showCloseButton={false}
              className="inset-0 top-0 left-0 flex h-dvh w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none bg-background p-0 ring-border sm:inset-6 sm:h-[calc(100dvh-3rem)] sm:w-[calc(100vw-3rem)] sm:max-w-none sm:rounded-2xl"
            >
              <div className="shrink-0 border-b border-border bg-card/70 px-5 py-4 sm:px-8">
                <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
                  <p className="font-mono text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
                    AISNQ / {quizView === "notes" ? "Study notes" : "Practice quiz"}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {quizView === "notes" && (
                      <Button size="sm" onClick={() => setQuizView("options")}>Generate quiz</Button>
                    )}
                    <DialogClose render={<Button variant="outline" size="sm" />}>
                      <ArrowLeftIcon aria-hidden="true" />
                      Back to upload
                    </DialogClose>
                  </div>
                </div>
              </div>

              <div ref={dialogScrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-8 sm:px-8 sm:py-12">
                {quizView === "notes" ? (
                <div className="mx-auto w-full max-w-6xl space-y-10">
                  <DialogHeader className="max-w-4xl gap-4">
                    <p className="font-mono text-xs tracking-[0.18em] text-muted-foreground uppercase">
                      Generated study notes
                    </p>
                    <DialogTitle className="text-3xl leading-tight sm:text-5xl">
                      {result.notes.title}
                    </DialogTitle>
                    <DialogDescription className="font-mono text-xs break-all">
                      Source: {result.filename} · Generated in{" "}
                      {(result.elapsedMs / 1000).toFixed(1)} s
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-14">
                    <div className="min-w-0 space-y-10">
                      <section className="rounded-xl border border-border bg-card/70 p-5 sm:p-7">
                        <h2 className="font-heading text-xl font-semibold">
                          Overview
                        </h2>
                        <p className="mt-3 text-base leading-relaxed">
                          {result.notes.summary}
                        </p>
                      </section>

                      {result.notes.sections.map((section, index) => (
                        <section
                          key={`${section.heading}-${index}`}
                          className="border-b border-border pb-8 last:border-b-0"
                        >
                          <h2 className="font-heading text-2xl font-semibold">
                            {section.heading}
                          </h2>
                          <ul className="mt-4 list-disc space-y-3 pl-5 text-base leading-relaxed marker:text-primary">
                            {section.points.map((point, pointIndex) => (
                              <li key={`${point}-${pointIndex}`}>{point}</li>
                            ))}
                          </ul>
                        </section>
                      ))}
                    </div>

                    {result.notes.keyTerms.length > 0 && (
                      <aside className="rounded-xl border border-border bg-card/70 p-5 lg:sticky lg:top-0">
                        <h2 className="font-heading text-xl font-semibold">
                          Key terms
                        </h2>
                        <dl className="mt-5 space-y-5">
                          {result.notes.keyTerms.map(
                            ({ term, definition }, index) => (
                              <div key={`${term}-${index}`} className="space-y-1">
                                <dt className="font-medium">{term}</dt>
                                <dd className="text-sm leading-relaxed text-muted-foreground">
                                  {definition}
                                </dd>
                              </div>
                            ),
                          )}
                        </dl>
                      </aside>
                    )}
                  </div>

                  <p className="border-t border-border pt-6 text-sm text-muted-foreground">
                    {DISCLAIMER}
                  </p>
                  <Button onClick={() => setQuizView("options")}>Generate quiz</Button>
                </div>
                ) : quizView === "options" || quizView === "generating" ? (
                  <QuizOptions
                    type={quizType}
                    priority={quizPriority}
                    count={quizCount}
                    busy={quizView === "generating"}
                    onTypeChange={setQuizType}
                    onPriorityChange={setQuizPriority}
                    onCountChange={setQuizCount}
                    onGenerate={generateQuiz}
                    onBack={() => setQuizView("notes")}
                  />
                ) : quizView === "quiz" && quiz ? (
                  <QuizRunner
                    key={retakeKey}
                    quiz={quiz}
                    onNavigate={() => dialogScrollRef.current?.scrollTo(0, 0)}
                    onSubmit={(answers) => {
                      setQuizResult(gradeQuiz(quiz, answers));
                      setQuizView("results");
                    }}
                  />
                ) : quizView === "results" && quizResult ? (
                  <QuizResults
                    result={quizResult}
                    onRetake={() => {
                      setRetakeKey((key) => key + 1);
                      setQuizResult(null);
                      setQuizView("quiz");
                    }}
                    onNewQuiz={() => {
                      setQuiz(null);
                      setQuizResult(null);
                      setQuizView("options");
                    }}
                    onBack={() => setQuizView("notes")}
                  />
                ) : null}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </section>
    </main>
  );
}
