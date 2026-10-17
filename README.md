# AISNQ

AISNQ turns a PDF into a draft of structured study notes and a practice quiz. Upload a PDF of up to 10 MB on the homepage, select the result card to read the notes, then choose **Generate quiz** to practice. Files, notes, answers, and quizzes are not stored by this app.

## Run locally

1. Install dependencies with `npm install`.
2. Set `GEMINI_API_KEY` and `GEMINI_MODEL` in `.env.local`. The model is set to `gemini-3.5-flash-lite` by default in the local file. Add your own Gemini API key if needed.
3. Start the app with `npm run dev` and open [http://localhost:3000](http://localhost:3000).

The API key is read only by the server routes. Quiz generation uses the study notes JSON, not the original PDF. Generated notes and questions can be incomplete or inaccurate; check them against the original PDF.

The bundled Inter, Playfair Display, and JetBrains Mono webfonts are covered by [their OFL license](app/fonts/OFL.txt).
