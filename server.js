import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 3000);

app.use(express.json({ limit: "256kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/runtime", (req, res) => {
  res.json({
    llm: Boolean(process.env.OPENAI_API_KEY),
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    baseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1"
  });
});

app.get("/api/endpoints", (req, res) => {
  res.json({
    product: "heart-airi",
    endpoints: [
      { method: "GET", path: "/api/runtime", description: "查看当前 LLM 运行状态" },
      { method: "POST", path: "/api/safety/check", description: "检测危机和安全风险" },
      { method: "POST", path: "/api/knot/extract", description: "把一句心事抽取成心结魔方" },
      { method: "POST", path: "/api/toolkit/run", description: "运行呼吸、睡前、边界、求助计划等疗愈工具" },
      { method: "POST", path: "/api/chat", description: "返回陪伴式回复和心结结构" }
    ]
  });
});

const crisisPatterns = [
  /自杀|轻生|不想活|活不下去|结束生命|死了算了|想死|没必要活/,
  /伤害自己|自残|割腕|吞药|跳楼|上吊/,
  /杀了|报复|伤害别人|弄死|伤害他人/
];

const feelingRules = [
  ["委屈", /委屈|不公平|没人懂|被误解|被冤枉/],
  ["孤独", /孤独|没人陪|一个人|空虚|没人理/],
  ["焦虑", /焦虑|担心|害怕|慌|压力|紧张|睡不着/],
  ["低落", /抑郁|难过|崩溃|累|麻木|没意思|没力气/],
  ["愤怒", /生气|愤怒|烦死|火大|讨厌|受不了/],
  ["困惑", /不知道|迷茫|纠结|混乱|想不清/]
];

const needRules = [
  ["被理解", /没人懂|被误解|委屈|孤独/],
  ["安全感", /害怕|慌|危险|担心|焦虑/],
  ["休息", /累|疲惫|睡不着|没力气|撑不住/],
  ["边界", /控制|逼我|要求|压力|关系|父母|朋友/],
  ["方向", /迷茫|不知道|未来|选择|纠结/]
];

const toolkit = {
  hold: {
    title: "先接住",
    intent: "情绪承接",
    steps: ["把事情说成一句话", "承认它真的让你难受", "先不急着评价自己"],
    prompt: "我会先陪你站稳，不急着讲道理。"
  },
  untangle: {
    title: "拆心结",
    intent: "认知梳理",
    steps: ["事实和猜测分开", "感受和需要分开", "找出今天能控制的 10%"],
    prompt: "我们把一团乱拆成几个能看的小块。"
  },
  play: {
    title: "变轻点",
    intent: "情绪减压",
    steps: ["找一个真实颜色", "动一动肩膀", "给这团心事起个外号"],
    prompt: "变轻不是逃避，是先把身体带回来。"
  },
  breathe: {
    title: "呼吸灯",
    intent: "身体安定",
    steps: ["吸气 4 拍", "停 1 拍", "呼气 6 拍", "重复 3 轮"],
    prompt: "跟着心蕊胸口的小灯慢慢呼吸。"
  },
  sleep: {
    title: "睡前卸载",
    intent: "睡前整理",
    steps: ["写下还没做完的事", "标记明天再处理", "把手机放远一点", "允许今天到这里"],
    prompt: "今晚的目标不是想通人生，是让大脑知道可以收工。"
  },
  letter: {
    title: "写给自己",
    intent: "自我同情",
    steps: ["用朋友的语气写一句", "承认今天不容易", "给自己一个具体照顾"],
    prompt: "把对别人会有的温柔，借一点给自己。"
  },
  boundary: {
    title: "关系边界",
    intent: "关系梳理",
    steps: ["这是谁的期待", "我真正能承担多少", "一句不攻击人的边界表达"],
    prompt: "边界不是冷漠，是让关系不用靠透支维持。"
  },
  tiny: {
    title: "行动小步",
    intent: "行为激活",
    steps: ["选择 2 分钟能做的事", "降低标准", "做完就算数"],
    prompt: "先把下一步小到不会吓到自己。"
  },
  support: {
    title: "求助计划",
    intent: "支持网络",
    steps: ["选一个可信任的人", "准备一句求助消息", "约定一个安全地点或时间"],
    prompt: "有些时刻不该一个人扛，我们把真人帮助叫进来。"
  }
};

function findRule(text, rules, fallback) {
  const hit = rules.find(([, pattern]) => pattern.test(text));
  return hit ? hit[0] : fallback;
}

function summarize(text) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (!clean) return "一团还没说出口的心事";
  return clean.length > 44 ? `${clean.slice(0, 44)}...` : clean;
}

function safetyCheck(text) {
  const immediate = crisisPatterns.some((pattern) => pattern.test(text));
  const support = /撑不住|崩溃|不安全|不想一个人|绝望|没有意义|消失|活着好累/.test(text);
  return {
    level: immediate ? "crisis" : support ? "needs-human-support" : "support",
    crisis: immediate,
    needsHumanSupport: support || immediate,
    message: immediate
      ? "现在先处理安全：请立刻联系身边可信任的人，离开危险物品或地点，去明亮且有人在的地方；如有立即危险，请拨打 120 或 110，或前往附近医院急诊。"
      : support
        ? "我愿意陪你，但这时候也值得让一个真实的人知道。我们先找一个可信任的人，发一条不用解释太多的求助消息。"
        : "可以继续陪伴式梳理。"
  };
}

function localKnot(text, mood = "cloudy", mode = "hold") {
  const feeling = findRule(text, feelingRules, mood === "sunny" ? "起伏" : "沉重");
  const need = findRule(text, needRules, "被好好接住");
  const fact = summarize(text);
  const guess = /是不是|可能|应该|肯定|一定|总是|从来/.test(text) ? "这里混着猜测" : "猜测先放旁边";
  const actionMap = {
    play: "摸到一个真实颜色",
    untangle: "只写一句事实",
    breathe: "跟着呼吸灯三轮",
    sleep: "写下明天再处理",
    letter: "写一句朋友式安慰",
    boundary: "写一句边界表达",
    tiny: "做一个 2 分钟小步",
    support: "发一条求助消息"
  };
  const action = actionMap[mode] || "慢慢说完这一句";
  const support = /朋友|家人|同学|老师|伴侣|父母/.test(text) ? "找一个能听的人" : "先让心蕊陪着";

  return {
    title: mood === "storm" ? "先稳住的一面" : "今天的心结魔方",
    fact,
    feeling,
    need,
    guess,
    controllable: action,
    support,
    tinyStep: action,
    tiles: [
      `事实：${fact}`,
      `感受：${feeling}`,
      `需要：${need}`,
      `猜测：${guess}`,
      `可控：${action}`,
      `支持：${support}`,
      `小步：${action}`,
      "身体：呼吸三轮",
      "收束：今天到这里"
    ],
    reply: buildLocalReply({ fact, feeling, need, action, mode })
  };
}

function buildLocalReply({ fact, feeling, need, action, mode }) {
  if (mode === "breathe") {
    return `先不分析了。你现在像是带着“${feeling}”，我们用三轮呼吸把身体放下来：吸气四拍，呼气六拍。做完再看“${fact}”。`;
  }
  if (mode === "sleep") {
    return `今晚先不逼自己想通。把“${fact}”写进明天清单，然后对自己说：今天到这里也算完成。`;
  }
  if (mode === "letter") {
    return `试着像安慰朋友一样对自己说：我知道你因为“${fact}”很不容易，你需要“${need}”，我会先陪你做一小步。`;
  }
  if (mode === "boundary") {
    return `这里可能需要一点边界。可以先写：“我理解你的期待，但我现在能做到的是____，不能做到的是____。”`;
  }
  if (mode === "tiny") {
    return `我们把目标缩到很小：${action}。不是为了立刻变好，是为了让你重新感觉自己还能动一下。`;
  }
  if (mode === "support") {
    return `我们准备一条求助消息：“我现在状态不太好，不需要你解决问题，可以陪我十分钟吗？”`;
  }
  if (mode === "untangle") {
    return `我把它拆成三层：事实是“${fact}”，感受像“${feeling}”，需要可能是“${need}”。先不要急着评判，今天只做一步：${action}。`;
  }
  if (mode === "play") {
    return `这团心事有点重，我们先让身体回来。它里面有“${feeling}”，也有“${need}”。先做一个很小的动作：${action}。`;
  }
  return `我先接住这句话。它外面是“${fact}”，里面像是“${feeling}”。你现在不需要马上变好，先允许自己需要“${need}”。`;
}

function runToolkit(text, tool = "hold", mood = "cloudy") {
  const selected = toolkit[tool] || toolkit.hold;
  const knot = localKnot(text, mood, tool);
  return {
    tool,
    title: selected.title,
    intent: selected.intent,
    prompt: selected.prompt,
    steps: selected.steps,
    card: {
      feeling: knot.feeling,
      need: knot.need,
      tinyStep: knot.tinyStep,
      support: knot.support
    },
    reply: knot.reply
  };
}

async function callModel({ text, mood, mode }) {
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  if (!apiKey) return null;

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content:
            "你是心蕊的情绪支持助手，面向中国大陆成年人。不要诊断，不要冒充医生，不要建议停药或调整药物。遇到自伤、他伤或立即危险，优先建议联系身边可信任的人、离开危险物品、去有人在的地方，并拨打120/110或前往附近医院急诊。输出严格 JSON，字段: title,fact,feeling,need,guess,controllable,support,tinyStep,tiles,reply。tiles 必须 9 项中文短语。reply 温柔、轻松、短。"
        },
        {
          role: "user",
          content: JSON.stringify({ text, mood, mode })
        }
      ],
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    throw new Error(`model request failed: ${response.status}`);
  }
  const data = await response.json();
  return JSON.parse(data.choices?.[0]?.message?.content || "{}");
}

app.post("/api/safety/check", (req, res) => {
  res.json(safetyCheck(req.body?.text || ""));
});

app.post("/api/knot/extract", async (req, res) => {
  const text = String(req.body?.text || "");
  const mood = String(req.body?.mood || "cloudy");
  const mode = String(req.body?.mode || "hold");
  const safety = safetyCheck(text);
  if (safety.crisis) {
    res.json({
      safety,
      knot: {
        title: "安全优先",
        fact: "出现危险信号",
        feeling: "危险信号",
        need: "真人支持",
        guess: "不要独处判断",
        controllable: "联系真人",
        support: "120 / 110 / 可信任的人",
        tinyStep: "发出求助消息",
        tiles: ["停下", "离开危险物", "找真人", "120", "110", "别独处", "发消息", "去明亮处", "等回应"],
        reply: safety.message
      }
    });
    return;
  }

  try {
    const modelKnot = await callModel({ text, mood, mode });
    res.json({ safety, knot: { ...localKnot(text, mood, mode), ...modelKnot } });
  } catch (error) {
    console.error(error);
    res.json({ safety, knot: localKnot(text, mood, mode), fallback: true });
  }
});

app.post("/api/toolkit/run", (req, res) => {
  const text = String(req.body?.text || "");
  const tool = String(req.body?.tool || req.body?.mode || "hold");
  const mood = String(req.body?.mood || "cloudy");
  const safety = safetyCheck(text);
  if (safety.crisis) {
    res.json({
      safety,
      result: runToolkit("出现危险信号", "support", mood)
    });
    return;
  }
  res.json({ safety, result: runToolkit(text, tool, mood) });
});

app.post("/api/chat", async (req, res) => {
  const text = String(req.body?.text || "");
  const mood = String(req.body?.mood || "cloudy");
  const mode = String(req.body?.mode || "hold");
  const safety = safetyCheck(text);
  if (safety.crisis) {
    res.json({ safety, reply: safety.message, knot: localKnot(text, mood, mode) });
    return;
  }
  const knot = localKnot(text, mood, mode);
  res.json({ safety, reply: knot.reply, knot });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`heart-airi listening on 0.0.0.0:${port}`);
});
