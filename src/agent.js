import { randomUUID } from "node:crypto";
import { composeChatMessages, composeKnotMessages } from "./character.js";
import { localKnot, mergeModelKnot } from "./knot.js";
import { crisisKnot, safetyCheck } from "./safety.js";

const allowedMoods = new Set(["sunny", "cloudy", "rainy", "storm"]);
const allowedModes = new Set(["hold", "untangle", "play", "solve", "breathe", "sleep", "letter", "boundary", "tiny", "support"]);

function clean(value, maxLength) {
  return String(value || "").replace(/\0/g, "").trim().slice(0, maxLength);
}

function normalizeDailyState(value) {
  if (!value || typeof value !== "object") return null;
  return {
    mood: Number.isInteger(value.mood) ? Math.min(5, Math.max(1, value.mood)) : undefined,
    energy: Number.isInteger(value.energy) ? Math.min(3, Math.max(1, value.energy)) : undefined,
    stress: Number.isInteger(value.stress) ? Math.min(3, Math.max(1, value.stress)) : undefined,
    causes: Array.isArray(value.causes) ? value.causes.map((item) => clean(item, 16)).filter(Boolean).slice(0, 7) : [],
    note: clean(value.note, 300) || undefined
  };
}

function parseJsonObject(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    return JSON.parse(value);
  } catch {
    const match = value.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function normalizeReply(value) {
  return clean(value, 1600);
}

export function normalizeChatInput(body = {}) {
  const mood = clean(body.mood, 24);
  const mode = clean(body.mode, 24);
  return {
    text: clean(body.text, 4000),
    mood: allowedMoods.has(mood) ? mood : "cloudy",
    mode: allowedModes.has(mode) ? mode : "hold",
    sessionId: clean(body.sessionId, 80) || randomUUID(),
    history: body.history,
    memories: body.memories,
    nickname: clean(body.nickname, 24),
    dailyState: normalizeDailyState(body.dailyState),
    preference: ["listen", "solve", "calm"].includes(body.preference) ? body.preference : ""
  };
}

export function createAgent({ provider, logger = console } = {}) {
  function prepare(input) {
    const safety = safetyCheck(input.text);
    const knot = safety.crisis ? crisisKnot(safety) : localKnot(input.text, input.mood, input.mode);
    return { input, safety, knot };
  }

  async function chat(rawInput, { signal } = {}) {
    const prepared = prepare(normalizeChatInput(rawInput));
    const { input, safety, knot } = prepared;
    if (safety.crisis) return { sessionId: input.sessionId, safety, reply: safety.message, knot, source: "safety" };
    if (!provider?.enabled) return { sessionId: input.sessionId, safety, reply: knot.reply, knot, source: "local" };

    try {
      const content = await provider.complete({ messages: composeChatMessages({ ...input, safetyLevel: safety.level }), signal });
      const reply = normalizeReply(content);
      if (!reply) throw new Error("model returned an empty reply");
      return { sessionId: input.sessionId, safety, reply, knot, source: provider.id };
    } catch (error) {
      logger.error("chat provider fallback", error);
      return { sessionId: input.sessionId, safety, reply: knot.reply, knot, source: "local", fallback: true };
    }
  }

  async function streamChat(rawInput, { onDelta, onReplace, signal } = {}) {
    const prepared = prepare(normalizeChatInput(rawInput));
    const { input, safety, knot } = prepared;
    const context = { sessionId: input.sessionId, safety, knot };

    if (safety.crisis) {
      onDelta?.(safety.message);
      return { ...context, reply: safety.message, source: "safety" };
    }
    if (!provider?.enabled) {
      onDelta?.(knot.reply);
      return { ...context, reply: knot.reply, source: "local" };
    }

    try {
      const content = await provider.stream({ messages: composeChatMessages({ ...input, safetyLevel: safety.level }), onDelta, signal });
      const reply = normalizeReply(content);
      if (!reply) throw new Error("model returned an empty reply");
      return { ...context, reply, source: provider.id };
    } catch (error) {
      if (signal?.aborted) throw error;
      logger.error("stream provider fallback", error);
      onReplace?.(knot.reply);
      return { ...context, reply: knot.reply, source: "local", fallback: true };
    }
  }

  async function extractKnot(rawInput, { signal } = {}) {
    const input = normalizeChatInput(rawInput);
    const safety = safetyCheck(input.text);
    if (safety.crisis) return { safety, knot: crisisKnot(safety), source: "safety" };
    const local = localKnot(input.text, input.mood, input.mode);
    if (!provider?.enabled) return { safety, knot: local, source: "local" };

    try {
      const content = await provider.complete({ messages: composeKnotMessages(input), json: true, signal });
      const knot = mergeModelKnot(local, parseJsonObject(content));
      return { safety, knot, source: provider.id };
    } catch (error) {
      logger.error("knot provider fallback", error);
      return { safety, knot: local, source: "local", fallback: true };
    }
  }

  return { prepare, chat, streamChat, extractKnot };
}
