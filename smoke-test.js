import { spawn } from "node:child_process";

const port = 41821;
const child = spawn("node", ["server.js"], {
  cwd: import.meta.dirname,
  env: { ...process.env, PORT: String(port) },
  stdio: "ignore"
});

async function wait() {
  for (let i = 0; i < 50; i += 1) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/`);
      if (res.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("server did not start");
}

try {
  await wait();
  const html = await fetch(`http://127.0.0.1:${port}/`).then((res) => res.text());
  const runtime = await fetch(`http://127.0.0.1:${port}/api/runtime`).then((res) => res.json());
  const endpoints = await fetch(`http://127.0.0.1:${port}/api/endpoints`).then((res) => res.json());
  const api = await fetch(`http://127.0.0.1:${port}/api/knot/extract`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: "我最近很焦虑，感觉没人懂我", mood: "rainy", mode: "untangle" })
  }).then((res) => res.json());
  const tool = await fetch(`http://127.0.0.1:${port}/api/toolkit/run`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: "我今晚睡不着", mood: "rainy", tool: "sleep" })
  }).then((res) => res.json());
  const safety = await fetch(`http://127.0.0.1:${port}/api/safety/check`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: "我现在不安全，不想一个人待着" })
  }).then((res) => res.json());

  if (!html.includes("心蕊 AIRI 二开版")) throw new Error("missing title");
  if (html.includes("API 接口")) throw new Error("api console should not be visible");
  if (html.includes("测 Runtime") || html.includes("测 Safety") || html.includes("测 Knot")) throw new Error("api test buttons should not be visible");
  if (html.includes("/api/") || html.includes("后端") || html.includes("agent") || html.includes("prototype")) throw new Error("developer wording should not be visible");
  if (!html.includes("app-layout")) throw new Error("missing sidebar app layout");
  if (!html.includes("floatingPet")) throw new Error("missing draggable pet");
  if (!html.includes("welcomeGate") || !html.includes("profileForm")) throw new Error("missing local profile gate");
  if (!html.includes("quickActions") || !html.includes("我只是有点难受")) throw new Error("missing quick support flows");
  if (!html.includes("memoryDialog") || !html.includes("safetyDialog")) throw new Error("missing memory and safety dialogs");
  if (!html.includes("工作工具")) throw new Error("missing tool rail");
  if (!html.includes("sampleConversation")) throw new Error("missing inline sample conversation");
  if (html.includes("你可以说") || html.includes("心蕊会给你")) throw new Error("old tool mock card should not be visible");
  if (!html.includes("小游戏")) throw new Error("missing mini games panel");
  if (!html.includes("bubbleGame") || !html.includes("breathGame") || !html.includes("gardenGame")) throw new Error("missing mini game controls");
  if (!html.includes("live2dStage")) throw new Error("missing Live2D canvas");
  if (!html.includes("/vendor/live2dcubismcore.min.js")) throw new Error("missing Cubism runtime script");
  if (!html.includes("/vendor/pixi.min.js")) throw new Error("missing Pixi script");
  if (!html.includes("/vendor/pixi-live2d-cubism4.min.js")) throw new Error("missing Pixi Live2D script");
  if (!html.includes("app.js?v=20260813-airi-logical-size")) throw new Error("missing cache-busted script");
  if (typeof runtime.llm !== "boolean") throw new Error("bad llm status");
  if (!runtime.model) throw new Error("missing model name");
  if (!Array.isArray(endpoints.endpoints) || endpoints.endpoints.length < 5) throw new Error("missing endpoints list");
  if (!Array.isArray(api.knot.tiles) || api.knot.tiles.length !== 9) throw new Error("bad knot tiles");
  if (tool.result.title !== "睡前卸载") throw new Error("bad toolkit result");
  if (api.safety.crisis) throw new Error("false crisis");
  if (!safety.needsHumanSupport || safety.crisis) throw new Error("support risk was not classified");
  console.log("smoke ok");
} finally {
  child.kill();
}
