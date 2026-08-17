import { spawn } from "node:child_process";
import { createServer } from "node:http";

const host = "127.0.0.1";

function appUrl(port, pathname = "/") {
  return `http://${host}:${port}${pathname}`;
}

async function waitForApp(port) {
  for (let i = 0; i < 60; i += 1) {
    try {
      const response = await fetch(appUrl(port));
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`server did not start on ${port}`);
}

async function startApp(port, extraEnv = {}) {
  const child = spawn("node", ["server.js"], {
    cwd: import.meta.dirname,
    env: {
      ...process.env,
      PORT: String(port),
      OPENAI_API_KEY: "",
      OPENAI_BASE_URL: "",
      OPENAI_MODEL: "",
      ...extraEnv
    },
    stdio: "ignore"
  });
  await waitForApp(port);
  return child;
}

async function stopApp(child) {
  if (!child || child.exitCode !== null) return;
  child.kill();
  await new Promise((resolve) => child.once("exit", resolve));
}

async function postJson(port, pathname, body, headers = {}) {
  const response = await fetch(appUrl(port, pathname), {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error(`${pathname} failed: ${response.status}`);
  return response;
}

function parseEvents(text) {
  return text
    .split(/\r?\n\r?\n/)
    .map((block) => {
      const lines = block.split(/\r?\n/);
      const event = lines.find((line) => line.startsWith("event:"))?.slice(6).trim();
      const data = lines.filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trim()).join("\n");
      return event && data ? { event, data: JSON.parse(data) } : null;
    })
    .filter(Boolean);
}

function createMockProvider() {
  const requests = [];
  const server = createServer(async (req, res) => {
    let raw = "";
    for await (const chunk of req) raw += chunk;
    const body = JSON.parse(raw || "{}");
    requests.push({ body, authorization: req.headers.authorization });
    const messageText = JSON.stringify(body.messages || []);

    if (messageText.includes("触发失败")) {
      res.writeHead(503, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: { message: "simulated failure" } }));
      return;
    }

    if (body.stream) {
      res.writeHead(200, { "content-type": "text/event-stream" });
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: "我记得你提过考试，" } }] })}\n\n`);
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: "我们先把这一刻放慢一点。" } }] })}\n\n`);
      res.end("data: [DONE]\n\n");
      return;
    }

    const content = body.response_format
      ? JSON.stringify({
          title: "模型整理的心结",
          fact: "明天有一场考试",
          feeling: "焦虑",
          need: "安全感",
          guess: "担心结果不好",
          controllable: "看五分钟提纲",
          support: "找朋友说一会儿",
          tinyStep: "打开提纲",
          tiles: ["事实：考试", "感受：焦虑", "需要：安全", "猜测：会失败", "可控：看提纲", "支持：找朋友", "小步：打开", "身体：呼吸", "收束：休息"],
          reply: "我听见你的焦虑了。"
        })
      : "我记得你提过考试。我们先不逼自己解决全部，只照顾眼前这一小步。";
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ choices: [{ message: { content } }] }));
  });

  return {
    requests,
    async listen() {
      await new Promise((resolve) => server.listen(0, host, resolve));
      return server.address().port;
    },
    async close() {
      await new Promise((resolve) => server.close(resolve));
    }
  };
}

async function testLocalMode() {
  const port = 41821;
  const child = await startApp(port);
  try {
    const html = await fetch(appUrl(port)).then((response) => response.text());
    const appScript = await fetch(appUrl(port, "/app.js?v=20260817-guided-tools")).then((response) => response.text());
    const appStyles = await fetch(appUrl(port, "/styles.css?v=20260817-guided-tools")).then((response) => response.text());
    const runtime = await fetch(appUrl(port, "/api/runtime")).then((response) => response.json());
    const endpoints = await fetch(appUrl(port, "/api/endpoints")).then((response) => response.json());
    const knot = await postJson(port, "/api/knot/extract", { text: "我最近很焦虑，感觉没人懂我", mood: "rainy", mode: "untangle" }).then((response) => response.json());
    const tool = await postJson(port, "/api/toolkit/run", { text: "我今晚睡不着", mood: "rainy", tool: "sleep" }).then((response) => response.json());
    const safety = await postJson(port, "/api/safety/check", { text: "我现在不安全，不想一个人待着" }).then((response) => response.json());
    const chat = await postJson(port, "/api/chat", {
      text: "我还是很焦虑",
      sessionId: "local-session",
      history: [{ role: "user", content: "我明天要考试" }]
    }).then((response) => response.json());
    const streamText = await postJson(
      port,
      "/api/chat",
      { text: "陪我慢一点", stream: true },
      { accept: "text/event-stream" }
    ).then((response) => response.text());
    const streamEvents = parseEvents(streamText);
    const crisis = await postJson(port, "/api/chat", { text: "我想自杀" }).then((response) => response.json());
    const empty = await fetch(appUrl(port, "/api/chat"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: "" })
    });

    if (!html.includes("心蕊 AIRI 二开版")) throw new Error("missing title");
    if (html.includes("API 接口")) throw new Error("api console should not be visible");
    if (html.includes("测 Runtime") || html.includes("测 Safety") || html.includes("测 Knot")) throw new Error("api test buttons should not be visible");
    if (html.includes("/api/") || html.includes("后端") || html.includes("prototype")) throw new Error("developer wording should not be visible");
    if (!html.includes("app-layout") || !html.includes("floatingPet")) throw new Error("missing app shell");
    if (!html.includes("welcomeGate") || !html.includes("profileForm")) throw new Error("missing local profile gate");
    if (!html.includes("checkinPanel") || !html.includes("checkinForm")) throw new Error("missing check-in flow");
    if (!html.includes("memoryDialog") || !html.includes("clearConversation") || !html.includes("safetyDialog") || !html.includes("logoutProfile")) throw new Error("missing local data controls");
    if (!html.includes("工作工具") || !html.includes("sampleConversation")) throw new Error("missing support tools");
    if (!html.includes("小游戏") || !html.includes("bubbleGame") || !html.includes("breathGame") || !html.includes("gardenGame")) throw new Error("missing mini games");
    if (!html.includes("live2dStage")) throw new Error("missing Live2D canvas");
    if (!html.includes("/vendor/live2dcubismcore.min.js") || !html.includes("/vendor/pixi.min.js") || !html.includes("/vendor/pixi-live2d-cubism4.min.js")) throw new Error("missing Live2D scripts");
    if (!html.includes("app.js?v=20260817-guided-tools")) throw new Error("missing cache-busted script");
    if (!appScript.includes('fetch("/api/chat"') || !appScript.includes('accept: "text/event-stream"') || !appScript.includes("saveConversationTurn") || !appScript.includes("returnToProfileGate")) throw new Error("frontend chat integration is missing");
    if (!appScript.includes("activeToolFlow") || !appScript.includes("pressure-classifier") || !appScript.includes("buildSupportDraft")) throw new Error("guided tool flows are missing");
    if (!appStyles.includes("body.quiet-mode .floating-pet") || appStyles.includes("body.quiet-mode .floating-pet,\nbody.quiet-mode .side-stack")) throw new Error("quiet mode companion is not visible");
    if (runtime.llm || runtime.provider !== "openai-compatible" || runtime.streaming !== true) throw new Error("bad local runtime status");
    if (!Array.isArray(endpoints.endpoints) || endpoints.endpoints.length < 5) throw new Error("missing endpoints list");
    if (!Array.isArray(knot.knot.tiles) || knot.knot.tiles.length !== 9 || knot.source !== "local") throw new Error("bad local knot");
    if (tool.result.title !== "睡前卸载") throw new Error("bad toolkit result");
    if (!safety.needsHumanSupport || safety.crisis) throw new Error("support risk was not classified");
    if (chat.source !== "local" || chat.sessionId !== "local-session" || !chat.reply) throw new Error("bad local chat fallback");
    if (!streamEvents.some((item) => item.event === "context") || !streamEvents.some((item) => item.event === "delta") || !streamEvents.some((item) => item.event === "result")) throw new Error("bad local chat stream");
    if (crisis.source !== "safety" || !crisis.safety.crisis || !crisis.reply.includes("120")) throw new Error("crisis response is not deterministic");
    if (empty.status !== 400) throw new Error("empty chat should be rejected");
  } finally {
    await stopApp(child);
  }
}

async function testProviderMode() {
  const mock = createMockProvider();
  const providerPort = await mock.listen();
  const port = 41822;
  const child = await startApp(port, {
    OPENAI_API_KEY: "test-key",
    OPENAI_BASE_URL: `http://${host}:${providerPort}/v1`,
    OPENAI_MODEL: "test-model"
  });

  try {
    const runtime = await fetch(appUrl(port, "/api/runtime")).then((response) => response.json());
    const chat = await postJson(port, "/api/chat", {
      text: "我还是很慌",
      sessionId: "provider-session",
      nickname: "小雨",
      history: [
        { role: "user", content: "我明天要考试" },
        { role: "assistant", content: "考试让你有些紧张。" }
      ],
      memories: ["散步能让我平静"]
    }).then((response) => response.json());
    const modelRequest = mock.requests.at(-1);
    const modelMessages = JSON.stringify(modelRequest.body.messages);

    const knot = await postJson(port, "/api/knot/extract", { text: "我明天考试，很焦虑", mode: "untangle" }).then((response) => response.json());
    const streamText = await postJson(
      port,
      "/api/chat",
      { text: "继续陪我一下", stream: true, history: [{ role: "user", content: "我明天要考试" }] },
      { accept: "text/event-stream" }
    ).then((response) => response.text());
    const streamEvents = parseEvents(streamText);
    const callsBeforeCrisis = mock.requests.length;
    const crisis = await postJson(port, "/api/chat", { text: "我想结束生命" }).then((response) => response.json());
    const failed = await postJson(port, "/api/chat", { text: "触发失败，我很焦虑" }).then((response) => response.json());

    if (!runtime.llm || runtime.model !== "test-model") throw new Error("provider runtime is not enabled");
    if (chat.source !== "openai-compatible" || !chat.reply.includes("考试")) throw new Error("provider chat was not used");
    if (!modelMessages.includes("我明天要考试") || !modelMessages.includes("散步能让我平静") || !modelMessages.includes("小雨")) throw new Error("multi-turn context or memory was omitted");
    if (modelRequest.authorization !== "Bearer test-key") throw new Error("provider authorization is missing");
    if (knot.source !== "openai-compatible" || knot.knot.title !== "模型整理的心结" || knot.knot.tiles.length !== 9) throw new Error("provider knot extraction failed");
    if (!streamEvents.some((item) => item.event === "delta" && item.data.delta.includes("考试"))) throw new Error("provider stream delta is missing");
    if (!streamEvents.some((item) => item.event === "result" && item.data.source === "openai-compatible")) throw new Error("provider stream result is missing");
    if (crisis.source !== "safety" || mock.requests.length !== callsBeforeCrisis + 1) throw new Error("crisis request reached provider");
    if (!failed.fallback || failed.source !== "local" || !failed.reply) throw new Error("provider failure did not fall back locally");
  } finally {
    await stopApp(child);
    await mock.close();
  }
}

await testLocalMode();
await testProviderMode();
console.log("smoke ok");
