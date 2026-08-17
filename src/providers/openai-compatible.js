function getConfig(env) {
  return {
    id: "openai-compatible",
    enabled: Boolean(env.OPENAI_API_KEY),
    apiKey: env.OPENAI_API_KEY || "",
    baseUrl: (env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, ""),
    model: env.OPENAI_MODEL || "gpt-4.1-mini",
    timeoutMs: Math.max(1000, Number(env.OPENAI_TIMEOUT_MS) || 30000)
  };
}

function createRequestSignal(timeoutMs, externalSignal) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(new Error("model request timed out")), timeoutMs);
  const abort = () => controller.abort(externalSignal?.reason);
  if (externalSignal?.aborted) abort();
  else externalSignal?.addEventListener("abort", abort, { once: true });
  return {
    signal: controller.signal,
    cleanup() {
      clearTimeout(timeout);
      externalSignal?.removeEventListener("abort", abort);
    }
  };
}

async function parseError(response) {
  const detail = await response.text().catch(() => "");
  const shortDetail = detail.replace(/\s+/g, " ").slice(0, 200);
  return new Error(`model request failed: ${response.status}${shortDetail ? ` ${shortDetail}` : ""}`);
}

export function createOpenAICompatibleProvider({ env = process.env, fetchImpl = fetch } = {}) {
  const config = getConfig(env);

  async function request(body, signal) {
    if (!config.enabled) return null;
    const requestSignal = createRequestSignal(config.timeoutMs, signal);
    try {
      const response = await fetchImpl(`${config.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({ model: config.model, temperature: 0.5, ...body }),
        signal: requestSignal.signal
      });
      if (!response.ok) throw await parseError(response);
      return { response, cleanup: requestSignal.cleanup };
    } catch (error) {
      requestSignal.cleanup();
      throw error;
    }
  }

  return {
    id: config.id,
    enabled: config.enabled,
    runtime() {
      return {
        llm: config.enabled,
        provider: config.id,
        model: config.model,
        baseUrl: config.baseUrl,
        streaming: true
      };
    },
    async complete({ messages, json = false, signal } = {}) {
      const pending = await request(
        {
          messages,
          ...(json ? { response_format: { type: "json_object" } } : {})
        },
        signal
      );
      if (!pending) return null;
      try {
        const data = await pending.response.json();
        return data.choices?.[0]?.message?.content || "";
      } finally {
        pending.cleanup();
      }
    },
    async stream({ messages, onDelta, signal } = {}) {
      const pending = await request({ messages, stream: true }, signal);
      if (!pending) return null;

      const decoder = new TextDecoder();
      let buffer = "";
      let output = "";

      function processEvent(rawEvent) {
        for (const line of rawEvent.split(/\r?\n/)) {
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          const data = JSON.parse(payload);
          const delta = data.choices?.[0]?.delta?.content;
          if (typeof delta === "string" && delta) {
            output += delta;
            onDelta?.(delta);
          }
        }
      }

      try {
        for await (const chunk of pending.response.body) {
          buffer += decoder.decode(chunk, { stream: true });
          const events = buffer.split(/\r?\n\r?\n/);
          buffer = events.pop() || "";
          events.forEach(processEvent);
        }
        buffer += decoder.decode();
        if (buffer.trim()) processEvent(buffer);
        return output;
      } finally {
        pending.cleanup();
      }
    }
  };
}
