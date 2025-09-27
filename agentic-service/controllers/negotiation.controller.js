import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import { clearNegotiationState, getNegotiationState, saveNegotiationState } from "../helpers/negotiationCache.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SESSION_TTL_SECONDS = 60 * 30;
const MAX_HISTORY = 12;
const MODEL_NAME = "gemini-2.5-flash-lite";
const TEMPERATURE = 0.35;

// Cache system instruction to avoid rebuilding
const instructionCache = new Map();

const buildSystemInstruction = (product = {}, userName = "") => {
  const { productName, marketValue, usageYears, condition, askingPrice, threshold, id } = product;

  const cacheKey = id || JSON.stringify({ productName, marketValue, askingPrice, threshold });

  if (instructionCache.has(cacheKey)) {
    return instructionCache.get(cacheKey);
  }

  const systemInstruction = `You are Brittoo's bargaining assistant.
    Product: ${productName ?? "unknown"}.
    Market value: ${marketValue ?? "unknown"} TK.
    Owner asking price: ${askingPrice ?? "unknown"} TK.
    Used for: ${usageYears ?? "unknown"}.
    Condition: ${condition ?? "unknown"}.
    Owner minimum threshold (do NOT go below): ${threshold ?? "unknown"} TK.
    UserName: ${userName ?? "unknown"}

    COMMUNICATION STYLE: Speak naturally. Like a real agent for second hand product.
    Goal: Start negotiation from the asking price and try to maximize the final price for the owner while never suggesting below the threshold.

    OUTPUT RULES (follow exactly):
    1) Only include a single machine-parseable line when proposing an offer:
      SUGGESTED_PRICE: <number>
      Then a short human-friendly MESSAGE: <text>
      Do not include any other machine-parsable price lines.

    2) NEVER change or re-propose a SUGGESTED_PRICE in response to purely informational questions (e.g., "how long is this used?", "what's the condition?", "does it include cable?"). For informational questions, answer concisely and do NOT add SUGGESTED_PRICE.

    3) If a SUGGESTED_PRICE already exists earlier in the conversation, treat that as the current standing offer. Do NOT lower or alter that standing offer when answering non-price questions. You may restate that last offered price if asked (e.g., "current offer is 720 TK") but do not modify it.

    4) Only propose a new SUGGESTED_PRICE when the user explicitly asks about price or makes a numeric offer/counter (examples: "can you give it in 700?", "is 700 ok?", "I can pay 700", "offer 700"). If the user makes an offer, produce a single new SUGGESTED_PRICE that moves toward agreement while maximizing the owner's outcome — aim to remain closer to the asking price and never go below the owner's minimum threshold.

    5) When making a counter-offer after a buyer's numeric offer:
      - Prefer counters that are not lower than the last assistant SUGGESTED_PRICE unless the buyer's offer is lower and you are intentionally conceding to reach agreement.
      - Never propose a price below the owner's minimum threshold.
      - Give a one-line reason (brief) in the MESSAGE explaining the counter (e.g., condition, market value, included accessories).

    6) If you must refuse to propose a price for any reason, answer the user's informational question and do NOT include SUGGESTED_PRICE.

    Be concise, follow these rules strictly, and only produce SUGGESTED_PRICE when the user has explicitly initiated price negotiation.`;

  // Cache size limit to prevent memory leaks
  if (instructionCache.size >= 100) {
    const firstKey = instructionCache.keys().next().value;
    instructionCache.delete(firstKey);
  }

  instructionCache.set(cacheKey, systemInstruction);
  return systemInstruction;
};

const extractCleanMessage = (text) => {
  let cleanText = text
    .replace(/SUGGESTED_PRICE:\s*[0-9]+(?:\.[0-9]+)?\s*/gi, '')
    .replace(/\b(MESSAGE|ASSISTANT|USER):\s*/gi, '')
    .replace(/\bTK\b\s*/gi, '')
    .replace(/^\s+|\s+$/g, '')
    .trim();

  return cleanText || text;
};


const prepareConversationContent = (history) => {
  return history
    .slice(-MAX_HISTORY)
    .filter(m => m.role !== "system") // rm sys msg
    .map(m => `${m.role.toUpperCase()}: ${m.text}`)
    .join("\n\n");
};

const extractSuggestedPrice = (text, threshold) => {
  const match = text.match(/SUGGESTED_PRICE:\s*([0-9]+(?:\.[0-9]+)?)/i);
  if (!match) return null;
  const price = Number(match[1]);
  if (threshold && price < threshold) {
    console.warn(`⚠️ AI suggested price ${price} below threshold ${threshold}`);
    return null;
  }
  return price;
};

export const negotiatePrice = async (req, res) => {
  const startTime = Date.now();
  try {
    const { message, product, confirm, close } = req.body;
    const userId = req.user.id;
    if (!userId) return res.status(400).json({ error: "userId required" });
    if (!message) return res.status(400).json({ error: "message required" });
    if (!product || typeof product !== "object") {
      return res.status(400).json({ error: "product object required" });
    }

    if (confirm === true || close === true) {
      const cleared = await clearNegotiationState(userId, product.id);
      return res.json({
        reply: cleared ? "✅ Negotiation closed successfully" : "⚠️ No active negotiation found",
        cleared
      });
    }

    let session = await getNegotiationState(userId, product.id);
    if (!session) {
      const systemInstruction = buildSystemInstruction(product, req.user.name);
      session = {
        history: [{ role: "system", text: systemInstruction }],
        lastActive: Date.now(),
        productId: product.id,
        userId
      };
    }
    const sanitizedMessage = message.trim().substring(0, 500);

    session.history.push({ role: "user", text: sanitizedMessage });
    session.lastActive = Date.now();

    const contents = prepareConversationContent(session.history);
    const systemInstruction = session.history.find(m => m.role === "system")?.text
      ?? buildSystemInstruction(product, req.user.name);


    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: contents || sanitizedMessage,
      config: {
        systemInstruction,
        temperature: TEMPERATURE,
        maxOutputTokens: 500,
      },
    });

    const botText = response?.text ?? "Error: empty response";
    session.history.push({ role: "assistant", text: botText });
    const suggestedPrice = extractSuggestedPrice(botText, product.threshold);
    const cleanReply = extractCleanMessage(botText);

    await saveNegotiationState(userId, product.id, session, SESSION_TTL_SECONDS);

    return res.json({
      reply: cleanReply,
      suggestedPrice,
    });

  } catch (err) {
    const duration = Date.now() - startTime;
    console.error("negotiatePrice error:", {
      error: err.message,
      duration: `${duration}ms`,
      userId: req.body?.userId,
      productId: req.body?.product?.id
    });

    return res.status(500).json({
      error: "internal_error",
      message: "Failed to process negotiation request"
    });
  }
};