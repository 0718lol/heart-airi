import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createAgent, normalizeChatInput } from "./src/agent.js";
import { runToolkit } from "./src/knot.js";
import { createOpenAICompatibleProvider } from "./src/providers/openai-compatible.js";
import { safetyCheck } from "./src/safety.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 3000);
const provider = createOpenAICompatibleProvider();
const agent = createAgent({ provider });

app.use(express.json({ limit: "256kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/runtime", (req, res) => {
  res.json(provider.runtime());
});

app.get("/api/endpoints", (req, res) => {
  res.json({
    product: "heart-airi",
    endpoints: [
      { method: "GET", path: "/api/runtime", description: "查看当前 LLM 运行状态" },
      { method: "POST", path: "/api/safety/check", description: "检测危机和安全风险" },
      { method: "POST", path: "/api/knot/extract", description: "把一句心事抽取成心结魔方" },
      { method: "POST", path: "/api/toolkit/run", description: "运行呼吸、睡前、边界、求助计划等疗愈工具" },
      { method: "POST", path: "/api/chat", description: "多轮陪伴回复，支持 SSE 流式输出" }
    ]
  });
});

function requireText(req, res) {
  const input = normalizeChatInput(req.body);
  if (!input.text) {
    res.status(400).json({ error: "text is required" });
    return null;
  }
  return input;
}

function sendEvent(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

app.post("/api/safety/check", (req, res) => {
  res.json(safetyCheck(req.body?.text || ""));
});

app.post("/api/knot/extract", async (req, res) => {
  const input = requireText(req, res);
  if (!input) return;
  res.json(await agent.extractKnot(input));
});

app.post("/api/toolkit/run", (req, res) => {
  const input = requireText(req, res);
  if (!input) return;
  const tool = String(req.body?.tool || input.mode || "hold");
  const safety = safetyCheck(input.text);
  res.json({
    safety,
    result: safety.crisis ? runToolkit("出现危险信号", "support", input.mood) : runToolkit(input.text, tool, input.mood)
  });
});

app.post("/api/chat", async (req, res) => {
  const input = requireText(req, res);
  if (!input) return;
  const wantsStream = req.body?.stream === true || req.get("accept")?.includes("text/event-stream");
  if (!wantsStream) {
    res.json(await agent.chat(input));
    return;
  }

  res.status(200);
  res.set({
    "content-type": "text/event-stream; charset=utf-8",
    "cache-control": "no-cache, no-transform",
    connection: "keep-alive"
  });
  res.flushHeaders();

  const controller = new AbortController();
  res.on("close", () => controller.abort());
  const prepared = agent.prepare(input);
  sendEvent(res, "context", {
    sessionId: prepared.input.sessionId,
    safety: prepared.safety,
    knot: prepared.knot
  });

  try {
    const result = await agent.streamChat(input, {
      signal: controller.signal,
      onDelta: (delta) => sendEvent(res, "delta", { delta }),
      onReplace: (reply) => sendEvent(res, "replace", { reply })
    });
    sendEvent(res, "result", result);
    sendEvent(res, "done", { ok: true });
  } catch (error) {
    if (!controller.signal.aborted) {
      console.error("chat stream failed", error);
      sendEvent(res, "error", { message: "reply stream failed" });
    }
  } finally {
    res.end();
  }
});

app.use((error, req, res, next) => {
  if (error?.type === "entity.too.large") {
    res.status(413).json({ error: "request body is too large" });
    return;
  }
  next(error);
});

app.listen(port, "0.0.0.0", () => {
  console.log(`heart-airi listening on 0.0.0.0:${port}`);
});
