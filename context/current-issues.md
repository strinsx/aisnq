# Current Issues

## Resolved: RadioGroup control-state warning

The quiz runner now passes `null` for an unanswered choice, so its RadioGroup remains controlled from the first render. Lint, the production build, and quiz grading tests passed after the fix. The original error report is retained below for reference.

## Original Error Type
Console Error

## Error Message
Base UI: A component is changing the uncontrolled value state of RadioGroup to be controlled.
Elements should not switch from uncontrolled to controlled (or vice versa).
Decide between using a controlled or uncontrolled RadioGroup element for the lifetime of the component.
The nature of the state is determined during the first render. It's considered controlled if the value is not `undefined`.
More info: https://fb.me/react-controlled-components


    at RadioGroup (components/ui/radio-group.tsx:9:10)
    at QuestionAnswer (components/quiz/quiz-runner.tsx:42:5)
    at QuizRunner (components/quiz/quiz-runner.tsx:90:11)
    at Home (app/page.tsx:447:19)

## Code Frame
   7 |
   8 | function RadioGroup({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive>) {
>  9 |   return <RadioGroupPrimitive className={cn("grid gap-2", className)} {...props} />;
     |          ^
  10 | }
  11 |
  12 | function RadioGroupItem({ className, ...props }: React.ComponentProps<typeof Radio.Root>) {

Next.js version: 16.4.0 (Turbopack)
