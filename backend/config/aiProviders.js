// ─── config/aiProviders.js ──────────────────────────────────────────────────
// Multi-Provider AI Engine (OpenRouter, Groq, OpenAI, Anthropic, Gemini)
// Tries providers in priority order; auto-fails over if a key is missing or quota runs out.

const logger = require('../utils/logger');

/**
 * Universal OpenAI-compatible chat completion caller
 */
const callChatAPI = async (endpoint, apiKey, model, prompt, headers = {}) => {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      logger.warn(`[AI Provider Error] ${model} on ${endpoint} (${response.status}): ${errText.substring(0, 200)}`);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    logger.error(`[AI Provider Exception] ${model}: ${err.message}`);
    return null;
  }
};

/**
 * Universal LLM Execution Engine — Priority Chain:
 * 1. OpenRouter (Multi-model: Gemini 2.5, Llama 3, Claude 3.5)
 * 2. Groq (Ultra-fast Llama 3.3 70B)
 * 3. OpenAI (GPT-4o-mini)
 * 4. Anthropic (Claude 3.5 Haiku)
 * 5. Direct Gemini SDK
 */
const executeLLM = async (prompt, systemInstruction = '') => {
  const fullPrompt = systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt;

  // 1. Try OpenRouter
  if (process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY !== 'your_openrouter_api_key_here') {
    const res = await callChatAPI(
      'https://openrouter.ai/api/v1/chat/completions',
      process.env.OPENROUTER_API_KEY,
      'google/gemini-2.5-flash',
      fullPrompt,
      { 'HTTP-Referer': 'http://localhost:3000', 'X-Title': 'Memora AI' }
    );
    if (res) return { text: res, provider: 'OpenRouter (Gemini 2.5 Flash)' };
  }

  // 2. Try Groq (Super-fast LLM)
  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here') {
    const res = await callChatAPI(
      'https://api.groq.com/openai/v1/chat/completions',
      process.env.GROQ_API_KEY,
      'llama-3.3-70b-versatile',
      fullPrompt
    );
    if (res) return { text: res, provider: 'Groq (Llama 3.3 70B)' };
  }

  // 3. Try OpenAI
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
    const res = await callChatAPI(
      'https://api.openai.com/v1/chat/completions',
      process.env.OPENAI_API_KEY,
      'gpt-4o-mini',
      fullPrompt
    );
    if (res) return { text: res, provider: 'OpenAI (GPT-4o-mini)' };
  }

  // 4. Try Direct Gemini SDK
  const { getGemini } = require('./gemini');
  const gemini = getGemini();
  if (gemini) {
    try {
      const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(fullPrompt);
      const resText = result.response.text().trim();
      if (resText) return { text: resText, provider: 'Direct Gemini SDK' };
    } catch (err) {
      logger.warn(`Direct Gemini SDK failed: ${err.message}`);
    }
  }

  return null;
};

module.exports = { executeLLM, callChatAPI };
