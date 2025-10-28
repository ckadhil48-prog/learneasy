/*
Project: Learn Easy (single-file React app + sample quizzes)
Files included below. Follow README at the end to deploy on GitHub Pages.

FILES:
1) index.html
2) /quizzes/sample.json
3) README.md

----- index.html -----
*/

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Learn Easy — Quiz</title>
    <!-- Tailwind CDN for quick styling (mobile-first) -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- React + ReactDOM via CDN -->
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <!-- Babel for JSX in the browser (only for this beginner-friendly version) -->
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
      /* small helper to make Malayalam fonts render nicely on most devices */
      body { -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale; }
      .safe-text { word-break:break-word; }
    </style>
  </head>
  <body class="bg-slate-50 min-h-screen text-slate-900">
    <div id="root" class="p-4"></div>

    <!-- App code -->
    <script type="text/babel">
      const { useState, useEffect } = React;

      // Utility: fetch JSON with fallback
      async function fetchQuiz(quizPath) {
        try {
          const res = await fetch(quizPath);
          if (!res.ok) throw new Error('fetch failed');
          const data = await res.json();
          return data;
        } catch (e) {
          console.warn('Could not fetch', quizPath, e);
          return null;
        }
      }

      function Header() {
        return (
          <header className="max-w-xl mx-auto py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Learn Easy</h1>
              <p className="text-sm text-slate-600">Mobile-first quizzes · Malayalam & English</p>
            </div>
            <div className="text-right text-xs text-slate-500">No login · Shareable links</div>
          </header>
        );
      }

      function Home({ onStart, availableQuizzes }) {
        const [selected, setSelected] = useState(availableQuizzes[0] || 'quizzes/sample.json');

        useEffect(() => { if (availableQuizzes.length) setSelected(availableQuizzes[0]); }, [availableQuizzes]);

        return (
          <div className="max-w-xl mx-auto bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold mb-2">Start Quiz</h2>
            <p className="text-sm text-slate-600 mb-4">Choose a quiz file and press Start. You can also import a local quiz JSON file.</p>

            <label className="block mb-3">
              <span className="text-sm text-slate-700">Select quiz (from hosted files)</span>
              <select value={selected} onChange={(e) => setSelected(e.target.value)} className="mt-1 block w-full rounded p-2 border">
                {availableQuizzes.map(q => (
                  <option key={q} value={q}>{q.replace('quizzes/','')}</option>
                ))}
              </select>
            </label>

            <div className="flex gap-2">
              <button onClick={() => onStart(selected)} className="flex-1 bg-blue-600 text-white rounded py-2 font-semibold">Start Quiz</button>
              <label className="flex-1 bg-slate-100 border rounded p-2 text-center cursor-pointer">
                <input id="file-input" type="file" accept="application/json" className="hidden" onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    try {
                      const json = JSON.parse(reader.result);
                      // store in localStorage for runtime usage
                      localStorage.setItem('learn-easy:imported-quiz', JSON.stringify({name: f.name, data: json}));
                      alert('Quiz imported locally as ' + f.name + '. Now select "Imported: '+f.name+'" from the selector and Start.');
                      // Add a pseudo-entry so user can pick it
                      const ev = new CustomEvent('learn-easy:imported', {detail:{name:f.name}});
                      window.dispatchEvent(ev);
                    } catch (err) { alert('Invalid JSON file. Make sure it is a quiz JSON.'); }
                  };
                  reader.readAsText(f);
                }}>Import .json</label>
            </div>

            <div className="mt-4 text-sm text-slate-500">
              Tip: To publish a quiz permanently, add its .json file to your repository under the `quizzes/` folder. Then select it here.
            </div>
          </div>
        );
      }

      function QuizPlayer({ quizData, onFinish }) {
        const [index, setIndex] = useState(0);
        const [answers, setAnswers] = useState(Array(quizData.length).fill(null));

        function choose(optionIndex) {
          const copy = answers.slice();
          copy[index] = optionIndex;
          setAnswers(copy);
        }

        function next() {
          if (index < quizData.length - 1) setIndex(index + 1);
          else finish();
        }

        function prev() { if (index > 0) setIndex(index - 1); }

        function finish() {
          // compute score
          let score = 0;
          quizData.forEach((q, i) => { if (answers[i] === q.answer) score += 1; });
          onFinish({score, total: quizData.length});
        }

        const q = quizData[index];

        return (
          <div className="max-w-xl mx-auto bg-white rounded-2xl shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-sm text-slate-500">Question {index+1} of {quizData.length}</div>
                <div className="mt-2 text-lg font-semibold safe-text">{q.question}</div>
              </div>
              <div className="text-sm text-slate-400">{q.lang || ''}</div>
            </div>

            <div className="space-y-3">
              {q.options.map((opt, i) => (
                <button key={i} onClick={() => choose(i)} className={`w-full text-left p-3 rounded-lg border ${answers[index]===i ? 'border-blue-600 bg-blue-50' : 'border-slate-200'} safe-text`}> 
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 font-semibold">{['A','B','C','D'][i]}</div>
                    <div>{opt}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mt-6">
              <button onClick={prev} disabled={index===0} className="px-4 py-2 rounded bg-slate-100">Prev</button>
              <div className="space-x-2">
                <button onClick={() => { if (answers[index]===null) { alert('Please choose an option.'); return; } next(); }} className="px-4 py-2 rounded bg-blue-600 text-white">{index===quizData.length-1 ? 'Finish' : 'Next'}</button>
              </div>
            </div>

            <div className="mt-4 text-sm text-slate-500">You can import quizzes locally from your device. Imported quizzes are stored in your browser (localStorage).</div>
          </div>
        );
      }

      function Result({ score, total, onRetry, onHome }) {
        return (
          <div className="max-w-xl mx-auto bg-white rounded-2xl shadow p-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Quiz Completed</h2>
            <p className="text-lg mb-4">You scored <span className="font-semibold">{score}</span> out of <span className="font-semibold">{total}</span></p>
            <div className="flex gap-3 justify-center">
              <button onClick={onRetry} className="px-4 py-2 rounded bg-blue-600 text-white">Try Again</button>
              <button onClick={onHome} className="px-4 py-2 rounded bg-slate-100">Back to Home</button>
            </div>
          </div>
        );
      }

      function App() {
        const [page, setPage] = useState('home'); // home | quiz | result
        const [quizPath, setQuizPath] = useState(null);
        const [quizData, setQuizData] = useState(null);
        const [result, setResult] = useState(null);
        const [availableQuizzes, setAvailableQuizzes] = useState(['quizzes/sample.json']);

        useEffect(() => {
          // If a quiz is imported locally, add it to availableQuizzes
          function onImported(e) {
            const name = e.detail.name;
            const key = 'imported:' + name;
            if (!availableQuizzes.includes(key)) setAvailableQuizzes(prev => [key, ...prev]);
          }
          window.addEventListener('learn-easy:imported', onImported);

          // Also check localStorage for previously imported quiz
          const imported = localStorage.getItem('learn-easy:imported-quiz');
          if (imported) {
            const j = JSON.parse(imported);
            const key = 'imported:' + j.name;
            if (!availableQuizzes.includes(key)) setAvailableQuizzes(prev => [key, ...prev]);
          }

          // Parse query param ?quiz=quizzes/your.json
          const urlParams = new URLSearchParams(window.location.search);
          const q = urlParams.get('quiz');
          if (q) {
            // prefer query param
            setAvailableQuizzes(prev => prev.includes(q) ? prev : [q, ...prev]);
            setQuizPath(q);
            setPage('loading');
          }

          return () => window.removeEventListener('learn-easy:imported', onImported);
        }, []);

        useEffect(() => {
          // If quizPath set (e.g. via query param or onStart), load it
          if (!quizPath) return;
          async function load() {
            if (quizPath.startsWith('imported:')) {
              const name = quizPath.replace('imported:','');
              const stored = JSON.parse(localStorage.getItem('learn-easy:imported-quiz'));
              if (stored && stored.name === name) {
                setQuizData(stored.data);
                setPage('quiz');
              } else {
                alert('Imported quiz not found in browser storage. Try importing again.');
                setPage('home');
              }
              return;
            }

            setPage('loading');
            const data = await fetchQuiz(quizPath);
            if (data) {
              setQuizData(data);
              setPage('quiz');
            } else {
              alert('Could not load quiz ' + quizPath + '. Make sure file exists in the quizzes/ folder.');
              setPage('home');
            }
          }
          load();
        }, [quizPath]);

        function handleStart(path) {
          setQuizPath(path);
        }

        function handleFinish(res) { setResult(res); setPage('result'); }

        function handleRetry() { setPage('quiz'); }
        function handleHome() { setPage('home'); setQuizPath(null); setQuizData(null); setResult(null); }

        return (
          <div>
            <Header />
            <main className="px-4">
              {page === 'home' && <Home onStart={handleStart} availableQuizzes={availableQuizzes} />}
              {page === 'loading' && <div className="max-w-xl mx-auto p-6 text-center">Loading quiz...</div>}
              {page === 'quiz' && quizData && <QuizPlayer quizData={quizData} onFinish={handleFinish} />}
              {page === 'result' && result && <Result score={result.score} total={result.total} onRetry={handleRetry} onHome={handleHome} />}
            </main>

            <footer className="max-w-xl mx-auto text-center text-xs text-slate-400 mt-6 mb-10">Built with ♥ for Learn Easy — Add quiz JSON files to <code>quizzes/</code> to publish permanently.</footer>
          </div>
        );
      }

      ReactDOM.createRoot(document.getElementById('root')).render(<App />);
    </script>
  </body>
</html>


/* ----- quizzes/sample.json ----- */

/* Place this file at quizzes/sample.json in your repository (create the folder) */
[
  {
    "question": "What is the capital of Kerala?",
    "options": ["Kochi","Kozhikode","Thiruvananthapuram","Kannur"],
    "answer": 2,
    "lang": "en"
  },
  {
    "question": "‘മലയാളം’ എന്താണ്?",
    "options": ["ഭാഷ","നാട്","നഗരം","പാട്ട്"],
    "answer": 0,
    "lang": "ml"
  },
  {
    "question": "Choose the correct option: 2 + 2 = ?",
    "options": ["3","4","5","22"],
    "answer": 1,
    "lang": "en"
  }
]


/* ----- README.md ----- */

# Learn Easy — Quick deploy (no-build) version

This repository contains a beginner-friendly, single-file React quiz app that runs without any build step. It is designed for mobile-first use and supports Malayalam + English quizzes.

## Files in this package
- `index.html` — the full app (React via CDN). Place it at the repository root.
- `quizzes/sample.json` — example quiz file. Create a folder `quizzes/` and put quiz JSON files there.

## How to create your GitHub repository and publish (GitHub Pages)
1. On GitHub, create a new repository (e.g. `learn-easy`).
2. Upload `index.html` to the root of the repo.
3. Create a folder named `quizzes/` in the repo and upload `sample.json` (and any other quiz files you want).
4. Go to the repository Settings → Pages (or in the left sidebar, Pages) and set **Source** to `main` branch and `/ (root)`. Save.
5. GitHub Pages will build and provide a URL like `https://<your-username>.github.io/<repo-name>/` — that is your permanent quiz link.

## How to publish additional quizzes later
- Add more `.json` files to the `quizzes/` folder in your repository (via GitHub web UI or by pushing with git).
- Example file name: `quizzes/malayalam_gk.json`.
- Users can open the site with `?quiz=quizzes/malayalam_gk.json` to load that quiz directly.
- From the app home you can select any file present in the `quizzes/` folder.

## Quiz JSON format
Each quiz is a JSON array of question objects. Example:
```json
[
  {
    "question": "What is the capital of Kerala?",
    "options": ["Kochi","Kozhikode","Thiruvananthapuram","Kannur"],
    "answer": 2,
    "lang": "en"
  }
]
```
- `question` — string (can be Malayalam or English)
- `options` — array of 4 strings
- `answer` — index (0-based) of the correct option
- `lang` — optional, `"en"` or `"ml"`

## Importing quizzes from your device
- On the home page click "Import .json" and choose a quiz JSON file from your phone/PC.
- The imported quiz is stored in your browser (localStorage) and appears in the Select list as `Imported: <filename>`.
- Imported quizzes are private to your device unless you upload the JSON file into the GitHub repo.

## Notes & Next steps
- This version uses CDNs and babel in-browser — great for fast setup and testing. For a production-ready app (faster, smaller), we can convert to a proper React project (Vite/CRA) and deploy a build to GitHub Pages or Netlify. If you'd like that, tell me and I'll prepare the build-ready project.
- If you want a UI to upload quizzes directly to your GitHub repo from the app, we can implement GitHub OAuth + REST calls — but that requires authentication and is a bigger step. For now, uploading via GitHub web UI is simplest.

---

If you want, I can now:
1. Walk you through creating the GitHub repository and uploading these files step-by-step, or
2. Prepare a production-ready Vite + React project (recommended later), or
3. Deploy this app for you if you give me a repository name and confirm you want me to push the files (I will give exact commands you can run locally).

Tell me which next step you prefer.
