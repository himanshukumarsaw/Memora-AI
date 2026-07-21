// ─── config/openrouter.js ───────────────────────────────────────────────────
// OpenRouter LLM API helper — compatible with Gemini 2.5 Flash / Llama 3 models

const logger = require('../utils/logger');

const callOpenRouter = async (prompt, model = 'google/gemini-2.5-flash') => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey === 'your_openrouter_api_key_here') return null;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Memora AI',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.warn(`[OpenRouter] API Error ${response.status}: ${errorText}`);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    logger.error(`[OpenRouter] Request failed: ${err.message}`);
    return null;
  }
};

module.exports = { callOpenRouter };
