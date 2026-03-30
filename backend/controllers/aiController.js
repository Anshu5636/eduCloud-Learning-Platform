const fs = require('fs');
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_MODEL    = 'gemini-flash-latest';

// FIX: check at call-time, not module load time, so .env is already loaded
const isConfigured = () => !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 10);


// FIX: build URL inside the function so the key is read after dotenv loads
const callGemini = async (prompt, temperature = 0.7, maxTokens = 800) => {

  const url = `${GEMINI_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const res = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents:         [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature, maxOutputTokens: maxTokens },
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.message || `Gemini API error ${res.status}`);
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Unexpected Gemini response format');
  return text.trim();
};


const buildPrompt = (systemMsg, userMsg, history = []) => {
  let prompt = `${systemMsg}\n\n`;
  const recent = history.slice(-4);
  for (const h of recent) {
    if (h.role === 'user')      prompt += `User: ${h.content}\n`;
    if (h.role === 'assistant') prompt += `Assistant: ${h.content}\n`;
  }
  prompt += `User: ${userMsg}\nAssistant:`;
  return prompt;
};

// FIX: restored full topic-specific demo responses
const demoChat = (msg) => {
  const m = msg.toLowerCase();
  if (m.includes('oop') || m.includes('object'))
    return 'OOP (Object-Oriented Programming) has 4 pillars:\n\n1. **Encapsulation** — bundling data and methods inside a class\n2. **Inheritance** — a child class inherits properties from parent\n3. **Polymorphism** — same method name, different behavior\n4. **Abstraction** — hiding internal details, showing only essentials\n\nExample: A `Dog` class extends `Animal`. Both have a `speak()` method but behave differently.';
  if (m.includes('python'))
    return 'Python key concepts:\n\n- **Variables**: `x = 10`, `name = "Alice"`\n- **Lists**: `my_list = [1, 2, 3]`\n- **Functions**: `def greet(name): return f"Hello {name}"`\n- **Classes**: `class Person: def __init__(self, name): self.name = name`\n- **Loops**: `for i in range(5): print(i)`';
  if (m.includes('algorithm') || m.includes('dsa'))
    return 'Key DSA Topics:\n\n- **Arrays** — O(1) access, O(n) search\n- **Binary Search** — O(log n), works on sorted arrays\n- **Sorting** — QuickSort O(n log n) avg, BubbleSort O(n²)\n- **Linked Lists** — O(1) insert, O(n) search\n- **Trees** — Binary Search Tree: O(log n) avg\n- **Graph** — BFS uses queue, DFS uses stack/recursion';
  if (m.includes('react'))
    return 'React fundamentals:\n\n- **Components** — functions returning JSX\n- **Props** — read-only data passed to components\n- **State** — `const [count, setCount] = useState(0)`\n- **useEffect** — for side effects (API calls, timers)\n- **JSX** — HTML-like syntax in JavaScript\n\nExample: `function Button({ label }) { return <button>{label}</button>; }`';
  return `I'm EduBot in demo mode. You asked: "${msg}"\n\n**To enable real AI responses:**\n1. Get a free API key at aistudio.google.com\n2. Add to backend .env: \`GEMINI_API_KEY=your_key_here\`\n3. Restart the server\n\nThe AI uses **Gemini 2.0 Flash** which is free with generous limits.`;
};

// FIX: restored proper explanation text
const demoQuiz = (n) => Array.from({ length: n }, (_, i) => ({
  question:      `Sample Q${i + 1}: What concept is central to the content you provided?`,
  options:       ['Core concept A', 'Core concept B', 'Core concept C', 'Core concept D'],
  correctAnswer: 0,
  explanation:   'Add your GEMINI_API_KEY to backend .env to generate real questions.',
}));

exports.status = (req, res) => {
  res.json({
    success:     true,
    aiAvailable: isConfigured(),
    provider:    'gemini',
    model:       GEMINI_MODEL,
  });
};


exports.chat = async (req, res) => {
  const { message, history = [] } = req.body;

  if (!message?.trim())
    return res.status(400).json({ success: false, message: 'Message required' });

  if (!isConfigured())
    return res.json({ success: true, reply: demoChat(message), aiAvailable: false, provider: 'demo' });

  try {
    const system = `You are EduBot, a helpful academic assistant for EduCloud learning platform. Help ${req.user.name} (${req.user.role}) with coursework and academic questions. Be clear, concise, and educational. Use markdown formatting for code and lists.`;

    const prompt = buildPrompt(system, message, history);
    const reply  = await callGemini(prompt, 0.7, 500);

    res.json({ success: true, reply, aiAvailable: true, provider: 'gemini' });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.json({
      success:     true,
      reply:       demoChat(message) + `\n\n*(AI temporarily unavailable: ${err.message.substring(0, 100)})*`,
      aiAvailable: false,
      provider:    'fallback',
    });
  }
};


exports.generateQuizFromText = async (req, res) => {
  const { content, numQuestions = 5 } = req.body;
  const numQ = Math.min(Math.max(parseInt(numQuestions) || 5, 2), 10);

  if (!content || content.trim().length < 30)
    return res.status(400).json({ success: false, message: 'Provide at least 30 characters of content' });

  if (!isConfigured())
    return res.json({ success: true, questions: demoQuiz(numQ), aiAvailable: false });

  try {
    const prompt = `You are a quiz generator. You output ONLY valid JSON arrays. No explanations, no markdown, no extra text. Just the JSON array.

Generate exactly ${numQ} multiple-choice questions based on this content:

${content.substring(0, 2000)}

Output ONLY this JSON array format (no other text):
[{"question":"...","options":["A","B","C","D"],"correctAnswer":0,"explanation":"..."}]

Rules:
- correctAnswer is 0-3 (index of correct option)
- Each question has exactly 4 options
- Questions test understanding of the content above`;

    let raw = await callGemini(prompt, 0.2, 2000);

    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) throw new Error('No JSON array in response');

    let questions;
    try {
      questions = JSON.parse(match[0]);
    } catch {
      console.warn('⚠️ Fixing malformed AI JSON...');
      const fixed = match[0].replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
      questions = JSON.parse(fixed);
    }

    if (!Array.isArray(questions) || questions.length === 0)
      throw new Error('Empty quiz returned');

    questions = questions.slice(0, numQ).map((q, i) => ({
      question:      String(q.question || `Question ${i + 1}`),
      options:       Array.isArray(q.options) && q.options.length === 4 ? q.options.map(String) : ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: Number.isInteger(q.correctAnswer) && q.correctAnswer >= 0 && q.correctAnswer <= 3 ? q.correctAnswer : 0,
      explanation:   String(q.explanation || ''),
    }));

    res.json({ success: true, questions, aiAvailable: true, provider: 'gemini' });
  } catch (err) {
    console.error('Quiz error:', err.message);
    res.json({ success: true, questions: demoQuiz(numQ), aiAvailable: false, provider: 'fallback', warning: err.message });
  }
};


exports.generateQuiz = async (req, res) => {
  try {
    let content = req.body.content || '';
    if (req.file) {
      try {
        if (req.file.mimetype === 'application/pdf') {
          const pdf    = require('pdf-parse');
          const buffer = fs.readFileSync(req.file.path);
          content      = (await pdf(buffer)).text.substring(0, 2000);
        } else {
          content = fs.readFileSync(req.file.path, 'utf8').substring(0, 2000);
        }
      } catch (e) { console.warn('File read error:', e.message); }
    }
    if (!content || content.trim().length < 30)
      return res.status(400).json({ success: false, message: 'No readable content found' });
    req.body.content = content;
    return exports.generateQuizFromText(req, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.summarize = async (req, res) => {
  let content = req.body.content || '';

  // FIX: added try/catch around file reads so a bad file doesn't crash the request
  if (req.file) {
    try {
      if (req.file.mimetype === 'application/pdf') {
        const pdf    = require('pdf-parse');
        const buffer = fs.readFileSync(req.file.path);
        content      = (await pdf(buffer)).text;
      } else {
        content = fs.readFileSync(req.file.path, 'utf8');
      }
    } catch (e) { console.warn('File read error:', e.message); }
  }

  if (!content || content.trim().length < 20)
    return res.status(400).json({ success: false, message: 'Content required' });

  if (!isConfigured()) {
    return res.json({
      success:     true,
      aiAvailable: false,
      summary:     `## Content Preview (Demo Mode)\n\n${content.substring(0, 500)}...\n\n---\n*Add GEMINI_API_KEY to backend .env to get real AI summaries.*`,
    });
  }

  try {
    const prompt = `You are an academic content summarizer. Format the following content into clear markdown notes with these sections: ## Key Concepts, ## Main Points (bullet list), ## Summary. Be concise and educational.\n\n${content.substring(0, 3000)}`;

    const summary = await callGemini(prompt, 0.3, 800);
    res.json({ success: true, summary, aiAvailable: true, provider: 'gemini' });
  } catch (err) {
    console.error('Summarize error:', err.message);
    res.json({
      success:     true,
      aiAvailable: false,
      provider:    'fallback',
      summary:     `## Content Summary (AI Unavailable)\n\n${content.substring(0, 600)}...\n\n*Error: ${err.message.substring(0, 100)}*`,
    });
  }
};