/* =========================================================
   OnePoint Smart Home — /api/ask
   Vercel serverless function (Node 18+)
   POST { question: string } → { answer: string, hasWebSearch: boolean }

   Env vars (set in Vercel dashboard → Settings → Environment Variables):
     ANTHROPIC_API_KEY   your Anthropic API key
     FIRECRAWL_API_KEY   your Firecrawl API key (optional)
   ========================================================= */

const Anthropic = require('@anthropic-ai/sdk');
const { KNOWLEDGE_BASE } = require('../knowledge/base.js');

/* ── Should this question trigger a live web search? ── */
const WEB_TRIGGERS = [
  'price','cost','aed','budget','how much',
  'which brand','best brand','brand','compare',' vs ',
  'recommend','buy','purchase',
  'latest','new model','2024','2025','2026',
  'available','supplier','where to get','review','rating'
];

function needsWebSearch(q) {
  if (!process.env.FIRECRAWL_API_KEY) return false;
  const lower = q.toLowerCase();
  return WEB_TRIGGERS.some(t => lower.includes(t));
}

/* ── Firecrawl search with hard 3 s abort ── */
async function webSearch(question) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: question + ' UAE smart home',
        limit: 3,
        scrapeOptions: { formats: ['markdown'] }
      }),
      signal: controller.signal
    });
    clearTimeout(timer);
    if (!res.ok) return '';
    const data = await res.json();
    if (!data.data?.length) return '';
    return data.data
      .slice(0, 3)
      .map(r => `[${r.title || r.url}](${r.url})\n${(r.markdown || r.description || '').substring(0, 600)}`)
      .join('\n\n---\n\n')
      .substring(0, 2500);
  } catch (_) {
    clearTimeout(timer);
    return '';
  }
}

/* ── System prompt ── */
function buildSystem(webContext) {
  return `You are the AI advisor for OnePoint Smart Home, a UAE-based smart home design and advisory platform.

PRIMARY KNOWLEDGE BASE (always use this first):
${KNOWLEDGE_BASE}
${webContext ? `
LIVE WEB RESULTS (use for current pricing or brand comparisons — cite URL if you use it):
${webContext}
` : ''}
RULES:
- Concise: 2–4 sentences for simple questions; bullet list or table for comparisons.
- All AED prices are indicative — state this when quoting prices.
- Brand-neutral — mention brands only when asked; always note alternatives.
- For lux/fixture count questions, show the formula working briefly.
- For "design my home / upload floor plan" requests → link to services.html#contact.
- If unsure, say so. Never invent specs or prices.
- No filler phrases. Friendly but professional.

VISUAL DATA (optional — only when it adds real clarity to numerical comparisons):
If your answer includes budget ranges or tier comparisons, append ONE visual block at the very end of your text — after everything else.

For budget / price comparisons:
[VISUAL]{"type":"bar","title":"Budget comparison","unit":"AED","items":[{"label":"Economy","value":80000},{"label":"Standard","value":200000},{"label":"Premium","value":500000}]}[/VISUAL]

For economy / standard / premium tier breakdowns:
[VISUAL]{"type":"tier","items":[{"label":"Economy","range":"AED 80K–140K","tag":"Smart switches + Wi-Fi"},{"label":"Standard","range":"AED 140K–260K","tag":"Scenes + Wired cameras"},{"label":"Premium","range":"AED 260K–500K","tag":"DALI/KNX + Full AV"}]}[/VISUAL]

Use a visual for: whole-home budget questions, "how much does X cost", tier comparison questions.
Skip it for: lux/lumen calculations, brand questions, definitions, retrofit advice, simple yes/no answers.`;
}

/* ── Handler ── */
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed.' });

  const question = (req.body?.question || '').toString().trim().substring(0, 600);
  if (question.length < 3) return res.status(400).json({ error: 'Please enter a question.' });

  /* 1 — optional web search */
  const webContext = needsWebSearch(question) ? await webSearch(question) : '';

  /* 2 — Claude */
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const msg = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 700,
      system:     buildSystem(webContext),
      messages:   [{ role: 'user', content: question }]
    });

    /* parse optional [VISUAL]...[/VISUAL] block */
    var rawText    = msg.content[0].text;
    var visualMatch = rawText.match(/\[VISUAL\]([\s\S]*?)\[\/VISUAL\]/);
    var visual     = null;
    var answer     = rawText.replace(/\[VISUAL\][\s\S]*?\[\/VISUAL\]/g, '').trim();

    if (visualMatch) {
      try { visual = JSON.parse(visualMatch[1].trim()); } catch (_) { visual = null; }
    }

    return res.status(200).json({
      answer,
      visual,
      hasWebSearch: !!webContext
    });

  } catch (err) {
    console.error('[ask] Claude error:', err?.message || err);
    return res.status(500).json({
      error: 'The AI advisor is temporarily unavailable. Please try again in a moment.'
    });
  }
};
