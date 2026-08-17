const messages = document.querySelector("#messages");
const composer = document.querySelector("#composer");
const input = document.querySelector("#input");
const cube = document.querySelector("#cube");
const spirit = document.querySelector("#spirit");
const knotTitle = document.querySelector("#knotTitle");
const knotSummary = document.querySelector("#knotSummary");
const feeling = document.querySelector("#feeling");
const need = document.querySelector("#need");
const tinyStep = document.querySelector("#tinyStep");
const runtimeStatus = document.querySelector("#runtimeStatus");
const safetyStatus = document.querySelector("#safetyStatus");
const toolGrid = document.querySelector("#toolGrid");
const selectedTool = document.querySelector("#selectedTool");
const runTool = document.querySelector("#runTool");
const sampleConversation = document.querySelector("#sampleConversation");
const floatingPet = document.querySelector("#floatingPet");
const live2dStage = document.querySelector("#live2dStage");
const dialoguePanel = document.querySelector(".dialogue");
const gameStatus = document.querySelector("#gameStatus");
const bubbleGame = document.querySelector("#bubbleGame");
const breathGame = document.querySelector("#breathGame");
const gardenGame = document.querySelector("#gardenGame");
const welcomeGate = document.querySelector("#welcomeGate");
const profileForm = document.querySelector("#profileForm");
const profileName = document.querySelector("#profileName");
const checkinPanel = document.querySelector("#checkinPanel");
const checkinForm = document.querySelector("#checkinForm");
const checkinTitle = document.querySelector("#checkinTitle");
const dailyMood = document.querySelector("#dailyMood");
const dailyEnergy = document.querySelector("#dailyEnergy");
const dailyStress = document.querySelector("#dailyStress");
const dailyCauses = document.querySelector("#dailyCauses");
const dailyPreference = document.querySelector("#dailyPreference");
const dailyNote = document.querySelector("#dailyNote");
const followupPanel = document.querySelector("#followupPanel");
const followupAction = document.querySelector("#followupAction");
const quietMode = document.querySelector("#quietMode");
const logoutProfile = document.querySelector("#logoutProfile");
const modalBackdrop = document.querySelector("#modalBackdrop");
const memoryDialog = document.querySelector("#memoryDialog");
const memoryForm = document.querySelector("#memoryForm");
const memoryInput = document.querySelector("#memoryInput");
const memoryList = document.querySelector("#memoryList");
const memoryTabs = document.querySelector("#memoryTabs");
const methodForm = document.querySelector("#methodForm");
const methodInput = document.querySelector("#methodInput");
const methodCategory = document.querySelector("#methodCategory");
const methodList = document.querySelector("#methodList");
const actionList = document.querySelector("#actionList");
const safetyDialog = document.querySelector("#safetyDialog");
const safetyContact = document.querySelector("#safetyContact");
const safetyWarnings = document.querySelector("#safetyWarnings");
const safetyCalming = document.querySelector("#safetyCalming");
const safetyPlace = document.querySelector("#safetyPlace");
const safetyProfessional = document.querySelector("#safetyProfessional");
const safetySaved = document.querySelector("#safetySaved");
const contextTool = document.querySelector("#contextTool");
const contextToolTitle = document.querySelector("#contextToolTitle");
const contextToolReason = document.querySelector("#contextToolReason");
const allToolsToggle = document.querySelector("#allToolsToggle");
const conversationState = document.querySelector(".conversation-state");

let activeProfile = null;
let conversationHistory = [];
let sessionId = createSessionId();
let chatPending = false;
let activeToolFlow = null;
let dailyDraft = { mood: null, energy: null, stress: null, causes: [], preference: null };
let pendingFollowupId = null;
const pageOpenedAt = Date.now();

let mood = "sunny";
let mode = "hold";
let gardenLevel = 0;
let breathing = false;
let live2dModel = null;
let live2dApp = null;
let live2dReady = false;
let live2dIdleTimer = null;
let live2dBaseWidth = 1;
let live2dBaseHeight = 1;

const toolLabels = {
  hold: "先接住 · 情绪承接",
  untangle: "拆心结 · 认知梳理",
  play: "变轻点 · 压力拆解",
  solve: "一起想办法 · 现实问题",
  breathe: "呼吸灯 · 身体安定",
  sleep: "睡前卸载 · 收工仪式",
  letter: "写给自己 · 自我同情",
  boundary: "关系边界 · 表达练习",
  tiny: "行动小步 · 行为激活",
  support: "求助计划 · 真人支持"
};

const toolMocks = {
  hold: {
    title: "先接住",
    when: "适合刚想开口、还说不清楚发生了什么的时候。",
    input: "我今天很难受，但不知道从哪讲起",
    output: "一段不评判的回应 + 一个很小的整理入口",
    result: "先让你感觉被接住，再慢慢靠近问题。",
    flow: [
      ["user", "我今天很难受，但不知道从哪讲起。"],
      ["bot", "那我们不急着讲清楚。先把“难受”放在这里，我陪你从最轻的一句开始。"],
      ["bot", "你可以只选一个词：委屈、累、空、烦、害怕，或者“说不上来”。"],
      ["user", "可能是委屈吧，感觉没人真的在乎我。"],
      ["bot", "我听见的是：你不是想要别人立刻解决问题，你更想被认真放在心上。今天先做一小步：把“我希望被怎样对待”写成一句话。"]
    ]
  },
  untangle: {
    title: "拆心结",
    when: "适合脑子里一团乱、反复想同一件事的时候。",
    input: "朋友一句话让我很受伤，我一直在想是不是我太敏感",
    output: "事实、感受、猜测、需要、可控小步",
    result: "把一团情绪拆成几块，不再被它整个压住。",
    flow: [
      ["user", "朋友一句话让我很受伤，我一直在想是不是我太敏感。"],
      ["bot", "我们先分开看，不急着判谁对谁错。事实是：他说了那句话。猜测是：你在想“是不是我太敏感”。"],
      ["bot", "那句话刺中的感受更像哪一个：被否定、被忽略、被抛下，还是不被尊重？"],
      ["user", "像是不被尊重。"],
      ["bot", "心结花盘：事实=他说了那句话；感受=不被尊重；需要=被认真对待；可控小步=先写下你希望对方下次怎么说。"]
    ]
  },
  play: {
    title: "变轻点",
    when: "适合压力很满，需要先把事情分出轻重的时候。",
    input: "我有好多事压着，完全不知道先处理什么",
    output: "必须做、可延后、可求助三栏 + 一个最小动作",
    result: "先把压力从一团变成能处理的一格。",
    flow: [
      ["user", "我烦得不行，什么都不想做。"],
      ["bot", "先不解决人生。我们先把这团烦躁变小一点。"],
      ["bot", "给它起个外号，比如“乱飞的纸团”。然后找房间里一个绿色的东西，看它 10 秒。"],
      ["user", "我看到桌上的绿色杯子。"],
      ["bot", "很好。你已经从脑内风暴回到现实物体了。下一步只做一个轻动作：喝一口水，或者把肩膀放下来。"]
    ]
  },
  solve: {
    title: "一起想办法",
    when: "适合已经说清楚难受，想处理一个现实问题的时候。",
    input: "我和同事沟通总是卡住，不知道下一步怎么办",
    output: "问题边界、可控部分、最小动作和备用动作",
    result: "不同时解决全部，只推进今天能控制的一格。",
    flow: [
      ["user", "我和同事沟通总是卡住，不知道下一步怎么办。"],
      ["bot", "我们先把目标缩小：这次沟通最希望得到的结果是什么？"],
      ["user", "希望他明确什么时候能交给我。"],
      ["bot", "你能控制的是把请求说具体。最小动作可以是写一句：我需要在周三前收到材料，你今天方便确认时间吗？"],
      ["bot", "如果对方仍不回应，备用动作是把进度风险同步给负责人，而不是继续一个人等。"]
    ]
  },
  breathe: {
    title: "呼吸灯",
    when: "适合心慌、紧绷、睡不着、身体停不下来的时候。",
    input: "我现在很慌，胸口发紧",
    output: "三轮吸气/呼气节奏 + 身体安定提示",
    result: "让身体先回到安全一点的位置。",
    flow: [
      ["user", "我现在很慌，胸口发紧。"],
      ["bot", "先不用解释原因。身体现在需要一个节奏。"],
      ["bot", "第一轮：吸气 4 拍，停 1 拍，呼气 6 拍。我陪你数：1、2、3、4，停，6、5、4、3、2、1。"],
      ["user", "好一点，但还是紧。"],
      ["bot", "那再做一轮。目标不是马上平静，是让紧绷从 10 分降到 8 分。做到这里已经有用。"]
    ]
  },
  sleep: {
    title: "睡前卸载",
    when: "适合晚上脑子停不下来、越想越清醒的时候。",
    input: "我今晚睡不着，总想着明天的事",
    output: "明日清单、暂停语、收工仪式",
    result: "让大脑知道今天可以先到这里。",
    flow: [
      ["user", "我今晚睡不着，总想着明天的事。"],
      ["bot", "我们不在床上开会。先把明天的事放进小篮子。"],
      ["bot", "写三行：最担心的事、明天几点处理、今晚先不处理的理由。"],
      ["user", "我怕明天汇报讲不好。"],
      ["bot", "记录为：明天 10 点看一遍提纲。今晚任务完成。现在给大脑一句收工语：我已经把它放到明天了。"]
    ]
  },
  letter: {
    title: "写给自己",
    when: "适合自责、羞耻、觉得自己很糟糕的时候。",
    input: "我又搞砸了，觉得自己真的很没用",
    output: "一封像写给朋友一样的短句",
    result: "把攻击自己的声音，换成能修复自己的声音。",
    flow: [
      ["user", "我又搞砸了，觉得自己真的很没用。"],
      ["bot", "先停一下。“搞砸了一件事”和“我是没用的人”不是同一句话。"],
      ["bot", "如果这是你朋友说的，你会怎么回他？"],
      ["user", "我可能会说，至少你已经很努力了。"],
      ["bot", "那这句话也可以给你自己：我今天很挫败，但我确实努力过。下一步不是惩罚自己，是修一小处。"]
    ]
  },
  boundary: {
    title: "关系边界",
    when: "适合被别人期待、控制、消耗，却不知道怎么说不的时候。",
    input: "家人总要求我按他们想法来，我很累",
    output: "边界句式、可承担范围、不可承担范围",
    result: "让你能表达边界，而不是爆发或憋住。",
    flow: [
      ["user", "家人总要求我按他们想法来，我很累。"],
      ["bot", "这里先不争谁对谁错，我们练一句不攻击人的边界。"],
      ["bot", "句式是：我理解你的期待，但我现在能做到的是____，不能做到的是____。"],
      ["user", "我能听他们建议，但不想被安排。"],
      ["bot", "可以说：我愿意听建议，但最后决定我想自己来。这样不是顶撞，是把责任还给自己。"]
    ]
  },
  tiny: {
    title: "行动小步",
    when: "适合知道要改变，但一想到开始就很累的时候。",
    input: "我有很多事要做，但完全动不了",
    output: "一个 2 分钟动作 + 降低标准的做法",
    result: "先恢复一点点掌控感。",
    flow: [
      ["user", "我有很多事要做，但完全动不了。"],
      ["bot", "那我们不做“很多事”。只做一个小到不会吓到你的动作。"],
      ["bot", "打开清单，圈出最小的一件，不要求完成。只圈出来。"],
      ["user", "我圈了回复一封邮件。"],
      ["bot", "很好。下一步缩小成 2 分钟：只打开邮件窗口，写标题。完成这一步就算今天启动成功。"]
    ]
  },
  support: {
    title: "求助计划",
    when: "适合一个人撑不住，需要把真人帮助叫进来的时候。",
    input: "我现在不太安全，不想一个人待着",
    output: "求助消息模板、联系人、下一步安全动作",
    result: "优先把你带到有人陪、能求助的状态。",
    flow: [
      ["user", "我现在不太安全，不想一个人待着。"],
      ["bot", "现在优先不是分析，而是让你不要一个人扛。"],
      ["bot", "先选一个能马上联系的人。消息可以直接复制：我现在不太安全，能不能马上陪我一下？"],
      ["user", "我可以发给朋友。"],
      ["bot", "发出去后，去一个更亮、更有人经过的地方等回应。如果有立即危险，请联系 120、110 或附近医院急诊。"]
    ]
  }
};

const aspectMocks = [
  {
    name: "事实",
    guide: "先还原发生了什么，不急着下结论。",
    question: "如果只写摄像头能拍到的部分，会是哪一句？",
    close: "事实越清楚，情绪越不容易被猜测带走。"
  },
  {
    name: "感受",
    guide: "给情绪起名，让它从一整团变成一个能看见的词。",
    question: "它更像委屈、害怕、烦、空，还是说不上来？",
    close: "能叫出名字，本身就是把它握住了一点。"
  },
  {
    name: "需要",
    guide: "情绪背后通常藏着一个没被照顾到的需要。",
    question: "你最希望被理解、被尊重、被陪着，还是先休息？",
    close: "需要不是任性，它是在提醒你哪里很重要。"
  },
  {
    name: "猜测",
    guide: "把脑内推演先放到旁边，别让它伪装成事实。",
    question: "这句话里哪些是确定的，哪些只是你很担心的可能？",
    close: "猜测可以被看见，但不用由它来开车。"
  },
  {
    name: "可控",
    guide: "只找今天能控制的一小块，不要求解决全部。",
    question: "如果只能照顾 10%，你愿意先动哪一小步？",
    close: "可控感常常是从很小的动作回来的。"
  },
  {
    name: "支持",
    guide: "看看这件事能不能让一个真人一起分担一点。",
    question: "谁可以听你说十分钟，不急着评价或给方案？",
    close: "能求助不是失败，是把自己放到更安全的位置。"
  },
  {
    name: "小步",
    guide: "把下一步缩到小到不会吓到自己。",
    question: "两分钟内能完成的版本是什么？只打开、只写一句也算。",
    close: "启动比完美更重要，今天先让系统重新动起来。"
  },
  {
    name: "身体",
    guide: "情绪太满时，先照顾身体的节奏。",
    question: "愿不愿意跟心蕊做三轮：吸气四拍，呼气六拍？",
    close: "身体降下来一点，脑子才更有空间。"
  },
  {
    name: "收束",
    guide: "给今天一个温和的停靠点。",
    question: "哪句话能提醒自己：我已经处理到这里了？",
    close: "不是所有事都要今晚想通，能停下也是整理的一部分。"
  }
];

function splitAspectTile(tile, index) {
  const text = String(tile || "").trim();
  const match = text.match(/^([^：:]{1,8})[：:]\s*(.+)$/);
  const fallback = aspectMocks[index] || aspectMocks[0];
  return {
    name: match ? match[1] : fallback.name,
    value: match ? match[2] : text || fallback.name,
    mock: fallback
  };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function addMessage(text, who = "bot") {
  const node = document.createElement("article");
  node.className = `message ${who}`;
  node.textContent = text;
  messages.appendChild(node);
  messages.scrollTop = messages.scrollHeight;
  return node;
}

function createSessionId() {
  return globalThis.crypto?.randomUUID?.() || `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeStoredHistory(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && ["user", "assistant"].includes(item.role) && typeof item.content === "string")
    .map((item) => ({ role: item.role, content: item.content.slice(0, 1600) }))
    .slice(-40);
}

function saveConversationTurn(userText, assistantText) {
  conversationHistory = [
    ...conversationHistory,
    { role: "user", content: userText },
    { role: "assistant", content: assistantText }
  ].slice(-40);
  if (!activeProfile) return;
  activeProfile.conversation = conversationHistory;
  activeProfile.sessionId = sessionId;
  saveProfile();
}

function renderConversationHistory() {
  messages.innerHTML = "";
  conversationHistory.forEach((item) => addMessage(item.content, item.role === "user" ? "user" : "bot"));
}

function speak(text) {
  const bridge = window.asteam?.rpc;
  if (typeof bridge === "function") {
    bridge("tts.speak", { text }).catch(() => browserSpeak(text));
  } else {
    browserSpeak(text);
  }
}

function browserSpeak(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  utterance.rate = 0.95;
  speechSynthesis.speak(utterance);
}

function setActive(containerId, attr, value) {
  document.querySelectorAll(`#${containerId} button`).forEach((button) => {
    button.classList.toggle("active", button.dataset[attr] === value);
  });
}

function renderCube(tiles) {
  cube.innerHTML = "";
  tiles.slice(0, 9).forEach((tile, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = tile;
    button.style.setProperty("--delay", `${index * 38}ms`);
    button.addEventListener("click", () => {
      button.classList.toggle("open");
      renderAspectMock(tile, index);
      const opened = cube.querySelectorAll(".open").length;
      spirit.dataset.state = opened >= 5 ? "relieved" : "thinking";
      if (opened === 3) addMessage("三格已经转松。现在只看你能照顾的那 10%。", "bot");
    });
    cube.appendChild(button);
  });
}

const focusFlows = {
  steady: {
    title: "陪我撑过五分钟",
    intro: "不需要马上想通。我们只把这一刻照顾好一点。",
    steps: [
      "找一个可以坐下的地方，让双脚踩到地面。",
      "慢慢看一看周围：说出 3 个你看见的东西。",
      "吸气 4 拍，呼气 6 拍，做三轮。",
      "喝一口水，或者用凉水碰一碰手背。",
      "现在给难受打个分：刚才是几分，现在是几分？"
    ]
  },
  untangle: {
    title: "把脑内反复播放的事拆开",
    intro: "先不判断自己对不对，只分清事实、感受和猜测。",
    steps: [
      "在下面写一句：摄像头能拍到的事实是什么？",
      "给这件事起一个感受的名字：委屈、害怕、烦、空，或说不上来。",
      "圈出脑中最刺人的那句猜测，不用急着相信它。",
      "问自己：我现在最需要的是理解、休息、安全感，还是一点方向？",
      "只选一个今天能控制的 10%：写一句话、走两分钟，或找人聊聊。"
    ]
  },
  pressure: {
    title: "把压力缩小成一个小步骤",
    intro: "压力很大时，不用同时处理全部事情。先找回一点掌控感。",
    steps: [
      "把最占脑子的事情写成一句，不要求完整。",
      "把它分成：今天必须做、可以晚点做、可以请人帮忙。",
      "从必须做的部分里选一个两分钟动作。",
      "把标准降低到‘开始就算完成’，做完就停一下。",
      "如果仍然扛不住，把下面的求助消息发给一个可信任的人。"
    ]
  },
  support: {
    title: "先写一条能发出去的求助消息",
    intro: "求助不是给别人添麻烦。你可以不解释全部，只说你需要陪伴。",
    steps: [
      "选一个现在比较可能回复你的人。",
      "告诉对方你现在的状态，不需要证明自己有多严重。",
      "说清楚你希望对方怎么陪你：听十分钟、陪你走走，或帮你联系专业帮助。",
      "发出去后，去一个明亮且有人在的地方等回复。",
      "如果你有立即危险，请直接联系 120、110 或附近医院急诊。"
    ]
  }
};

const guidedToolKeys = new Set(["untangle", "play", "solve", "support"]);

const guidedToolDefinitions = {
  untangle: {
    title: "拆心结",
    badge: "多轮整理",
    intro: "我们只把一团心事拆开，不急着判断你对不对。",
    totalSteps: 5,
    placeholder: "先写：0-10 分 + 最卡住你的事",
    firstPrompt: "先给这份难受打 0-10 分，再写一句最卡住你的事。比如：8 分，朋友那句话让我一直想是不是我太敏感。"
  },
  play: {
    title: "压力拆解",
    badge: "三栏分类",
    intro: "把压力从一整团拆成：今天必须做、可以延后、可以找人帮忙。",
    totalSteps: 4,
    placeholder: "一行一个压力点，或者用逗号隔开",
    firstPrompt: "把现在压着你的 1-5 件事写下来。一行一个，或者用逗号隔开。先不用排序。"
  },
  solve: {
    title: "一起想办法",
    badge: "现实问题",
    intro: "先确定一个具体问题，再找今天能控制的一小格。",
    totalSteps: 4,
    placeholder: "先用一句话写最想解决的问题",
    firstPrompt: "这次最想解决的现实问题是什么？只写一个，越具体越好。"
  },
  support: {
    title: "求助计划",
    badge: "真人支持",
    intro: "不需要解释全部，我们先准备一条真的能发出去的消息。",
    totalSteps: 3,
    placeholder: "选一个求助对象，也可以直接输入",
    firstPrompt: "先选一个比较可能回应你的人：朋友、家人、同事/老师，或专业人士。也可以直接写称呼。"
  }
};

const feelingHints = [
  ["委屈", /委屈|不公平|没人懂|误解|冤枉/],
  ["不被尊重", /尊重|冒犯|边界|看不起|羞辱/],
  ["焦虑", /焦虑|担心|害怕|慌|压力|紧张|睡不着/],
  ["低落", /难过|崩溃|累|麻木|没意思|没力气|抑郁/],
  ["愤怒", /生气|愤怒|烦|火大|讨厌|受不了/],
  ["孤独", /孤独|一个人|没人陪|没人理|空/]
];

const pressureLabels = {
  must: "今天必须处理",
  later: "可以延后",
  ask: "可以求助"
};

const supportToneLabels = {
  soft: "轻一点",
  direct: "直接一点",
  familiar: "熟人语气"
};

function normalizeShortText(text, fallback = "这件事") {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (!clean) return fallback;
  return clean.length > 52 ? `${clean.slice(0, 52)}...` : clean;
}

function extractScore(text) {
  const match = String(text || "").match(/(?:^|[^\d])([0-9]|10)(?:\s*分)?(?:$|[^\d])/);
  return match ? Number(match[1]) : null;
}

function inferFeeling(text, fallback = "难受") {
  const hit = feelingHints.find(([, pattern]) => pattern.test(text));
  return hit ? hit[0] : fallback;
}

function splitPressureItems(text) {
  return String(text || "")
    .split(/[\n,，、；;]+/)
    .map((item) => normalizeShortText(item, ""))
    .filter(Boolean)
    .slice(0, 5);
}

function classifyPressureItem(item, index) {
  if (/求|帮|问|联系|沟通|老师|同事|家人|朋友|医生|咨询/.test(item)) return "ask";
  if (/以后|改天|下周|以后再|不急|可以晚|复盘|整理/.test(item)) return "later";
  if (index === 0 || /今天|明天|马上|截止|必须|考试|汇报|上交|面试/.test(item)) return "must";
  return index >= 3 ? "later" : "must";
}

function getGroupedPressure(flow) {
  const items = flow.data.items || [];
  const categories = flow.data.categories || {};
  return Object.keys(pressureLabels).reduce((groups, key) => {
    groups[key] = items.filter((_, index) => categories[index] === key);
    return groups;
  }, {});
}

function createToolFlow(tool) {
  const definition = guidedToolDefinitions[tool];
  return {
    tool,
    step: 0,
    completed: false,
    answers: [],
    data: {},
    memoryCandidate: "",
    methodCandidate: "",
    actionCandidate: "",
    prompt: definition.firstPrompt,
    createdAt: Date.now()
  };
}

function setToolComposer(active) {
  const submitButton = composer.querySelector("button[type='submit']");
  if (!activeToolFlow || !active) {
    input.placeholder = "说一句最卡住你的话，我会陪你慢慢整理...";
    runTool.textContent = "开始";
    if (submitButton) submitButton.textContent = "发送";
    return;
  }
  const definition = guidedToolDefinitions[activeToolFlow.tool];
  input.placeholder = activeToolFlow.completed ? "可以继续和心蕊正常聊天..." : definition.placeholder;
  runTool.textContent = activeToolFlow.completed ? "再做一次" : "重开";
  if (submitButton) submitButton.textContent = activeToolFlow.completed ? "发送" : "继续";
}

function renderToolProgress(flow, definition) {
  const current = flow.completed ? definition.totalSteps : Math.min(flow.step + 1, definition.totalSteps);
  const percent = flow.completed ? 100 : Math.round((flow.step / definition.totalSteps) * 100);
  return `
    <div class="tool-flow-progress" aria-label="当前进度">
      <span style="width:${percent}%"></span>
    </div>
    <div class="tool-flow-meta"><span>${current} / ${definition.totalSteps}</span><span>${escapeHtml(definition.badge)}</span></div>
  `;
}

function renderPressureClassifier(flow) {
  const items = flow.data.items || [];
  const categories = flow.data.categories || {};
  if (!items.length || flow.step !== 1 || flow.completed) return "";
  return `
    <div class="pressure-classifier">
      ${items.map((item, index) => `
        <div class="pressure-item">
          <strong>${escapeHtml(item)}</strong>
          <div>
            ${Object.entries(pressureLabels).map(([key, label]) => `
              <button type="button" data-tool-action="pressure-class" data-item-index="${index}" data-pressure-class="${key}" class="${categories[index] === key ? "active" : ""}">${label}</button>
            `).join("")}
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function renderPressureColumns(flow) {
  if (flow.tool !== "play" || !(flow.data.items || []).length) return "";
  const grouped = getGroupedPressure(flow);
  return `
    <div class="pressure-columns">
      ${Object.entries(pressureLabels).map(([key, label]) => `
        <section>
          <h4>${label}</h4>
          ${grouped[key].length ? grouped[key].map((item) => `<p>${escapeHtml(item)}</p>`).join("") : "<p>暂时没有</p>"}
        </section>
      `).join("")}
    </div>
  `;
}

function renderSupportChoices(flow) {
  if (flow.tool !== "support" || flow.completed) return "";
  if (flow.step === 0) {
    return `
      <div class="choice-row">
        ${["朋友", "家人", "同事/老师", "专业人士"].map((item) => `<button type="button" data-tool-action="support-contact" data-value="${item}">${item}</button>`).join("")}
      </div>
    `;
  }
  if (flow.step === 1) {
    return `
      <div class="choice-row">
        <button type="button" data-tool-action="support-need" data-value="只是想有人陪我说说话">陪我说说话</button>
        <button type="button" data-tool-action="support-need" data-value="想请你帮我一起想办法">一起想办法</button>
        <button type="button" data-tool-action="support-need" data-value="我现在状态比较危险，需要你尽快联系我">尽快联系我</button>
      </div>
    `;
  }
  return "";
}

function renderSupportDraft(flow) {
  if (flow.tool !== "support" || !flow.data.draft) return "";
  return `
    <div class="support-draft">
      <p>${escapeHtml(flow.data.draft)}</p>
      <div class="choice-row">
        <button type="button" data-tool-action="copy-support">复制消息</button>
        ${Object.entries(supportToneLabels).map(([tone, label]) => `<button type="button" data-tool-action="support-tone" data-tone="${tone}">${label}</button>`).join("")}
        <button type="button" data-tool-action="open-safety">安全计划</button>
      </div>
    </div>
  `;
}

function renderToolWorkbench() {
  if (!activeToolFlow) {
    sampleConversation.classList.remove("tool-workbench");
    sampleConversation.hidden = true;
    setToolComposer(false);
    return;
  }
  const flow = activeToolFlow;
  const definition = guidedToolDefinitions[flow.tool];
  const statusText = flow.completed ? "已完成" : flow.prompt;
  sampleConversation.classList.add("tool-workbench");
  sampleConversation.hidden = false;
  sampleConversation.innerHTML = `
    <div class="tool-flow-head">
      <div>
        <span>${escapeHtml(definition.badge)}</span>
        <strong>${escapeHtml(definition.title)}</strong>
      </div>
      <button type="button" data-tool-action="exit">回到聊天</button>
    </div>
    <p class="tool-flow-intro">${escapeHtml(definition.intro)}</p>
    ${renderToolProgress(flow, definition)}
    <article class="message bot sample">${escapeHtml(statusText)}</article>
    ${renderPressureClassifier(flow)}
    ${renderPressureColumns(flow)}
    ${renderSupportChoices(flow)}
    ${renderSupportDraft(flow)}
    <div class="tool-flow-actions">
      ${flow.step === 1 && flow.tool === "play" && !flow.completed ? '<button type="button" data-tool-action="pressure-done">完成分类</button>' : ""}
      ${flow.completed && flow.methodCandidate ? '<button type="button" data-tool-action="save-method">这个方法对我有用</button>' : ""}
      ${flow.completed && flow.actionCandidate ? '<button type="button" data-tool-action="save-action">下次回来问我</button>' : ""}
      ${flow.completed ? '<button type="button" data-tool-action="restart">再做一次</button>' : ""}
    </div>
  `;
  setToolComposer(true);
}

function finishGuidedTool(flow, message, { methodCandidate = "", actionCandidate = "" } = {}) {
  flow.completed = true;
  flow.prompt = "这个工具已经做完。你可以保存有效方法、约定下次回访，也可以直接回到普通聊天。";
  flow.memoryCandidate = methodCandidate;
  flow.methodCandidate = methodCandidate;
  flow.actionCandidate = actionCandidate;
  addMessage(message, "bot");
  renderToolWorkbench();
}

function completeUntangle(flow) {
  const issue = normalizeShortText(flow.data.issue);
  const fact = normalizeShortText(flow.data.fact || issue);
  const feeling = flow.data.feeling || inferFeeling(`${issue} ${flow.data.sting || ""}`);
  const thought = normalizeShortText(flow.data.thought, "我脑子里那句很重的话");
  const need = /尊重|忽略|否定|抛下|边界/.test(flow.data.sting || "") ? "被认真对待" : "被理解，也被允许慢一点";
  const action = /关系|朋友|家人|同事|老师/.test(issue)
    ? "先写一版不发送的表达草稿"
    : "只处理今天能控制的 10%";
  const scoreLine = flow.data.scoreBefore !== null || flow.data.scoreAfter !== null
    ? `\n强度：${flow.data.scoreBefore ?? "未记录"} -> ${flow.data.scoreAfter ?? "未记录"} 分`
    : "";

  renderCube([
    `事实：${fact}`,
    `感受：${feeling}`,
    `需要：${need}`,
    `想法：${thought}`,
    `刺痛：${normalizeShortText(flow.data.sting, "还在确认")}`,
    `可控：${action}`,
    "支持：需要时找真人",
    "身体：呼气六秒",
    "收束：先到这里"
  ]);
  finishGuidedTool(
    flow,
    `我帮你拆好了：\n事实：${fact}\n感受：${feeling}\n想法：${thought}\n需要：${need}\n小动作：${action}${scoreLine}\n\n所以这不是“你太敏感”这么简单，而是这件事碰到了你很在意的需要。`,
    {
      methodCandidate: "先分事实、感受和想法，再只做一个可控小动作",
      actionCandidate: action
    }
  );
  spirit.dataset.state = "relieved";
}

function completePressure(flow) {
  const grouped = getGroupedPressure(flow);
  const firstMust = grouped.must[0] || flow.data.items[0] || "眼前这件事";
  const action = normalizeShortText(flow.data.action, `只打开和“${firstMust}”有关的第一样东西`);
  const scoreLine = flow.data.scoreAfter !== null ? `\n现在压力分数：${flow.data.scoreAfter} / 10` : "";
  finishGuidedTool(
    flow,
    `压力已经分成三栏：\n今天必须处理：${grouped.must.join("、") || "暂时没有"}\n可以延后：${grouped.later.join("、") || "暂时没有"}\n可以求助：${grouped.ask.join("、") || "暂时没有"}\n\n现在只做一个小动作：${action}。完成不了也没关系，可以继续缩小到 30 秒。${scoreLine}`,
    {
      methodCandidate: "压力大时先分成必须做、可延后、可求助，再只选一个小动作",
      actionCandidate: action
    }
  );
  spirit.dataset.state = "relieved";
}

function buildSupportDraft(flow, tone = flow.data.tone || "soft") {
  const contact = flow.data.contact || "你";
  const need = flow.data.need || "只是想有人陪我说说话";
  if (tone === "direct") {
    return `${contact}，我现在状态不太好，${need}。你现在方便联系我一下吗？`;
  }
  if (tone === "familiar") {
    return `${contact}，我这会儿有点撑不住，想找你待一会儿。不用帮我解决全部，能不能回我一下？`;
  }
  return `${contact}，我现在状态不太好，不需要你马上解决问题，${need}。你方便陪我十分钟吗？`;
}

function completeSolve(flow) {
  const problem = normalizeShortText(flow.data.problem);
  const controllable = normalizeShortText(flow.data.controllable, "先确定我能控制的一部分");
  const action = normalizeShortText(flow.data.action, "先完成一个两分钟动作");
  const backup = normalizeShortText(flow.data.backup, "如果做不动，就把动作再缩小一半");
  finishGuidedTool(
    flow,
    `我们先不解决全部：\n当前问题：${problem}\n我能控制：${controllable}\n今天的小动作：${action}\n遇到阻力时：${backup}\n\n只完成“小动作”就算推进，不需要顺便把整个问题处理完。`,
    {
      methodCandidate: "遇到现实问题时，先分清可控部分，再只推进一个最小动作",
      actionCandidate: action
    }
  );
  spirit.dataset.state = "relieved";
}

function completeSupport(flow) {
  flow.data.tone = flow.data.tone || "soft";
  flow.data.draft = buildSupportDraft(flow);
  const urgent = /危险|尽快|不安全|马上/.test(flow.data.need || "");
  finishGuidedTool(
    flow,
    `我先写了一条可以发出去的求助消息。发出后，尽量去明亮、有人经过的地方等回应。${urgent ? "如果你现在有立即危险，请直接联系 120、110 或附近医院急诊。" : ""}`,
    { methodCandidate: `需要求助时，我可以这样开口：${flow.data.draft}` }
  );
  if (urgent) openDialog(safetyDialog);
  spirit.dataset.state = urgent ? "guard" : "soft";
}

async function checkToolSafety(text) {
  try {
    return await fetch("/api/safety/check", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text })
    }).then((response) => response.json());
  } catch {
    return null;
  }
}

async function processGuidedToolAnswer(text) {
  if (!activeToolFlow || activeToolFlow.completed) return false;
  const flow = activeToolFlow;
  const safety = await checkToolSafety(text);
  if (safety?.crisis) {
    addMessage(safety.message, "guard");
    openDialog(safetyDialog);
    flow.tool = "support";
    flow.step = 1;
    flow.data.need = "我现在状态比较危险，需要你尽快联系我";
    flow.prompt = "先选一个可以马上联系的人。也可以直接输入称呼。";
    spirit.dataset.state = "guard";
    renderToolWorkbench();
    return true;
  }
  if (safety?.needsHumanSupport && flow.tool !== "support") {
    addMessage(safety.message, "bot");
  }

  flow.answers.push({ step: flow.step, text, createdAt: Date.now() });
  if (flow.tool === "untangle") {
    if (flow.step === 0) {
      flow.data.scoreBefore = extractScore(text);
      flow.data.issue = text.replace(/(?:^|[^\d])(?:[0-9]|10)\s*分?/, "").trim() || text;
      flow.data.feeling = inferFeeling(text);
      flow.step = 1;
      flow.prompt = "这件事最刺痛你的地方更像哪一个：被否定、被忽略、被抛下、不被尊重，还是别的？";
      addMessage(`我先听见了“${flow.data.feeling}”。我们不急着下结论，先找那一下最刺痛的位置。`, "bot");
    } else if (flow.step === 1) {
      flow.data.sting = text;
      flow.step = 2;
      flow.prompt = "如果只写摄像头能拍到的部分，事实会是哪一句？";
      addMessage("好，先把刺痛放在这一格。下一格我们只写事实，不写评价。", "bot");
    } else if (flow.step === 2) {
      flow.data.fact = text;
      flow.step = 3;
      flow.prompt = "脑子里最重、最反复的那句话是什么？可以照原样写出来。";
      addMessage("事实已经清楚一点了。现在把脑内那句最重的话单独拿出来看。", "bot");
    } else if (flow.step === 3) {
      flow.data.thought = text;
      flow.step = 4;
      flow.prompt = "现在再给这份难受打 0-10 分。如果不想打分，也可以写“跳过”。";
      addMessage("这句话很重，但它是一种想法，不等于完整的你。我们最后看一下强度有没有松一点。", "bot");
    } else {
      flow.data.scoreAfter = extractScore(text);
      completeUntangle(flow);
    }
  } else if (flow.tool === "play") {
    if (flow.step === 0) {
      const items = splitPressureItems(text);
      flow.data.items = items.length ? items : [normalizeShortText(text)];
      flow.data.categories = Object.fromEntries(flow.data.items.map((item, index) => [index, classifyPressureItem(item, index)]));
      flow.step = 1;
      flow.prompt = "我先放进三栏了。你可以点按钮调整分类，调好后点“完成分类”。";
      addMessage("我先把它们从一团压力拆成三栏。这里不是最终判断，你可以马上调整。", "bot");
    } else if (flow.step === 1) {
      flow.prompt = "这一格需要点一下分类按钮。调好后点“完成分类”，我再陪你选最小动作。";
      addMessage("我收到你的补充了。为了让压力真的变清楚，这一步请先在上方面板里点分类。", "bot");
    } else if (flow.step === 2) {
      flow.data.action = text;
      flow.step = 3;
      flow.prompt = "现在给压力重新打 0-10 分。完成不了也可以说“没完成”。";
      addMessage("这个动作已经够小了。我们只看它能不能帮你启动，不要求一次解决全部。", "bot");
    } else if (flow.step === 3) {
      flow.data.scoreAfter = extractScore(text);
      completePressure(flow);
    }
  } else if (flow.tool === "solve") {
    if (flow.step === 0) {
      flow.data.problem = text;
      flow.step = 1;
      flow.prompt = "这件事里，哪些部分是你今天能够控制或影响的？";
      addMessage("先把问题边界画出来。我们只拿回你能控制的部分，不替别人做决定。", "bot");
    } else if (flow.step === 1) {
      flow.data.controllable = text;
      flow.step = 2;
      flow.prompt = "把可控部分缩成一个两分钟到十分钟的小动作，会是什么？";
      addMessage("可控部分已经找到了。下一步把标准降到“开始就算完成”。", "bot");
    } else if (flow.step === 2) {
      flow.data.action = text;
      flow.step = 3;
      flow.prompt = "最可能卡住你的阻力是什么？如果发生，备用动作可以怎么再小一点？";
      addMessage("这个动作已经足够具体。我们再给它准备一个做不动时也能执行的备用版本。", "bot");
    } else {
      flow.data.backup = text;
      completeSolve(flow);
    }
  } else if (flow.tool === "support") {
    if (flow.step === 0) {
      flow.data.contact = normalizeShortText(text, "你");
      flow.step = 1;
      flow.prompt = "你希望对方怎么帮你？选一个：陪我说说话、一起想办法、尽快联系我。";
      addMessage(`好，先把“${flow.data.contact}”放进求助计划。下一步只说你希望对方怎么陪。`, "bot");
    } else if (flow.step === 1) {
      flow.data.need = normalizeShortText(text, "只是想有人陪我说说话");
      completeSupport(flow);
    }
  }
  renderToolWorkbench();
  return true;
}

function startGuidedTool(tool = mode) {
  if (tool === "hold") {
    activeToolFlow = null;
    renderToolWorkbench();
    addMessage("我在。你不用把事情讲完整，先说最想被我听见的那一句就好。", "bot");
    input.focus();
    return;
  }
  if (!guidedToolKeys.has(tool)) {
    activeToolFlow = null;
    renderToolWorkbench();
    runSelectedTool();
    return;
  }
  activeToolFlow = createToolFlow(tool);
  const definition = guidedToolDefinitions[tool];
  sampleConversation.hidden = false;
  addMessage(`我们用「${definition.title}」来做，不用一次说完整。`, "bot");
  addMessage(definition.firstPrompt, "bot");
  spirit.dataset.state = tool === "support" ? "soft" : "thinking";
  renderToolWorkbench();
  input.focus();
}

const methodCategoryLabels = {
  body: "身体",
  environment: "环境",
  emotion: "情绪",
  relationship: "关系",
  action: "行动"
};

const actionStatusLabels = {
  pending: "等待回访",
  done: "已完成",
  partial: "做了一点",
  cancelled: "已取消"
};

function localDateKey(timestamp = Date.now()) {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function ensureProfileShape(profile) {
  profile.memories = Array.isArray(profile.memories) ? profile.memories : [];
  profile.methods = Array.isArray(profile.methods) ? profile.methods : [];
  profile.actions = Array.isArray(profile.actions) ? profile.actions : [];
  profile.dailyCheckins = Array.isArray(profile.dailyCheckins) ? profile.dailyCheckins : [];
  profile.safetyPlan ||= null;
  return profile;
}

function latestDailyCheckin() {
  return activeProfile?.dailyCheckins?.at(-1) || null;
}

function recommendTool({ daily = latestDailyCheckin(), text = "" } = {}) {
  const clean = String(text || "");
  if (/自杀|轻生|不想活|伤害自己|自残|不安全|撑不住|不想一个人/.test(clean)) {
    return { tool: "support", reason: "先把真人支持和安全放在前面" };
  }
  if (/心慌|胸口|呼吸|紧绷|停不下来/.test(clean) || daily?.preference === "calm" || daily?.energy === 1) {
    return { tool: "breathe", reason: "先让身体回到稍微稳定一点的位置" };
  }
  if (/怎么办|怎么处理|下一步|解决|计划|沟通|选择/.test(clean) || daily?.preference === "solve") {
    return { tool: "solve", reason: "把现实问题缩成今天能推进的一步" };
  }
  if (/好多事|来不及|忙不过来|压力|任务|工作|考试|汇报/.test(clean) || daily?.stress === 3) {
    return { tool: "play", reason: "先分清必须做、可延后和可求助" };
  }
  if (/反复想|是不是我|内耗|想不通|敏感|关系|委屈/.test(clean)) {
    return { tool: "untangle", reason: "把事实、感受和脑内猜测分开" };
  }
  const effectiveMethod = activeProfile?.methods?.find((item) => item.effectiveness === "effective");
  if (effectiveMethod) return { tool: "hold", reason: `先听你说；你也可以用之前有效的“${effectiveMethod.text}”` };
  return { tool: "hold", reason: daily?.preference === "listen" ? "按你的选择，先听你把话说完" : "先听你把这句话说完" };
}

function applyToolRecommendation(recommendation) {
  if (!recommendation || !toolLabels[recommendation.tool]) return;
  mode = recommendation.tool;
  contextTool.dataset.tool = mode;
  contextToolTitle.textContent = toolLabels[mode].split(" · ")[0];
  contextToolReason.textContent = recommendation.reason;
  selectedTool.textContent = toolLabels[mode];
  conversationState.textContent = recommendation.reason;
  toolGrid.querySelectorAll("button").forEach((button) => button.classList.toggle("active", button.dataset.tool === mode));
}

function saveMethod(text, category = "action", source = "manual") {
  if (!activeProfile) return false;
  const clean = normalizeShortText(text, "");
  if (!clean || activeProfile.methods.some((item) => item.text === clean)) return false;
  activeProfile.methods = [{
    id: createSessionId(),
    text: clean,
    category: methodCategoryLabels[category] ? category : "action",
    effectiveness: "untested",
    source,
    createdAt: Date.now()
  }, ...activeProfile.methods].slice(0, 30);
  saveProfile();
  renderMemoryList();
  return true;
}

function saveAction(text, source = "chat") {
  if (!activeProfile) return false;
  const clean = normalizeShortText(text, "");
  if (!clean) return false;
  activeProfile.actions = [{
    id: createSessionId(),
    text: clean,
    source,
    status: "pending",
    dueAt: Date.now(),
    createdAt: Date.now()
  }, ...activeProfile.actions].slice(0, 30);
  saveProfile();
  renderMemoryList();
  return true;
}

function renderPendingFollowup() {
  if (!activeProfile) return;
  const action = activeProfile.actions.find((item) => item.status === "pending" && item.dueAt <= Date.now() && item.createdAt < pageOpenedAt);
  pendingFollowupId = action?.id || null;
  followupPanel.hidden = !action;
  if (action) followupAction.textContent = action.text;
}

function profileKey(name) {
  return `heartAiriProfile:${encodeURIComponent(name.trim().toLowerCase())}`;
}

function loadProfile(name) {
  try {
    return JSON.parse(localStorage.getItem(profileKey(name)) || "null");
  } catch {
    return null;
  }
}

function saveProfile() {
  if (!activeProfile) return;
  localStorage.setItem(profileKey(activeProfile.name), JSON.stringify(activeProfile));
}

function showProfile(profile) {
  activeProfile = ensureProfileShape(profile);
  conversationHistory = normalizeStoredHistory(profile.conversation);
  sessionId = typeof profile.sessionId === "string" && profile.sessionId ? profile.sessionId : createSessionId();
  profileName.value = profile.name;
  welcomeGate.hidden = true;
  sampleConversation.hidden = true;
  renderConversationHistory();
  renderMemoryList();
  const today = profile.dailyCheckins.find((item) => item.date === localDateKey());
  if (today) {
    checkinPanel.hidden = true;
    applyToolRecommendation(recommendTool({ daily: today }));
    renderPendingFollowup();
  } else {
    startCheckin();
    followupPanel.hidden = true;
  }
  if (profile.safetyPlan) {
    safetyContact.value = profile.safetyPlan.contact || "";
    safetyWarnings.value = profile.safetyPlan.warnings || "";
    safetyCalming.value = profile.safetyPlan.calming || "";
    safetyPlace.value = profile.safetyPlan.place || "";
    safetyProfessional.value = profile.safetyPlan.professional || "";
    document.querySelectorAll("[data-safety-step]").forEach((input) => {
      input.checked = profile.safetyPlan.steps?.includes(input.dataset.safetyStep) || false;
    });
  }
}

function startCheckin() {
  dailyDraft = { mood: null, energy: null, stress: null, causes: [], preference: null };
  checkinTitle.textContent = "今天的你，大概在哪里？";
  checkinForm.querySelectorAll(".active").forEach((button) => button.classList.remove("active"));
  dailyNote.value = "";
  checkinPanel.hidden = false;
}

function finishCheckin(record) {
  checkinPanel.classList.add("checkin-complete");
  window.setTimeout(() => {
    checkinPanel.hidden = true;
    checkinPanel.classList.remove("checkin-complete");
    renderPendingFollowup();
  }, 320);
  applyToolRecommendation(recommendTool({ daily: record }));
  const preferenceReply = record.preference === "solve"
    ? "我知道了。今天我们不只停在安慰，可以一起把最现实的问题缩成一个小步骤。"
    : record.preference === "calm"
      ? "我知道了。今天先不急着分析，让身体和情绪缓下来一点。"
      : "我知道了。今天我先认真听，不催你马上想办法。";
  addMessage(preferenceReply, "bot");
}

function renderMemoryList() {
  if (!activeProfile) return;
  const memories = activeProfile.memories || [];
  const methods = activeProfile.methods || [];
  const actions = activeProfile.actions || [];
  const turns = Math.floor(conversationHistory.length / 2);
  document.querySelector("#conversationSummary").textContent = turns ? `已在这台设备保存最近 ${turns} 轮对话` : "这台设备还没有保存最近对话";
  memoryList.innerHTML = memories.length
    ? memories.map((memory, index) => `<div class="memory-item"><span>${escapeHtml(memory.text)}</span><button type="button" data-memory-index="${index}">删除</button></div>`).join("")
    : `<p class="dialog-copy">还没有保存的内容。只有你主动点击“记住这件事”，心蕊才会把它放进这里。</p>`;
  methodList.innerHTML = methods.length
    ? methods.map((method) => `
      <div class="method-item">
        <div><span>${escapeHtml(methodCategoryLabels[method.category] || "行动")}</span><strong>${escapeHtml(method.text)}</strong></div>
        <div class="method-feedback" aria-label="方法效果">
          <button class="${method.effectiveness === "effective" ? "active" : ""}" type="button" data-method-effect="effective" data-method-id="${method.id}">有效</button>
          <button class="${method.effectiveness === "general" ? "active" : ""}" type="button" data-method-effect="general" data-method-id="${method.id}">一般</button>
          <button class="${method.effectiveness === "unsuitable" ? "active" : ""}" type="button" data-method-effect="unsuitable" data-method-id="${method.id}">不适合</button>
          <button type="button" data-method-delete="${method.id}">删除</button>
        </div>
      </div>
    `).join("")
    : `<p class="dialog-copy">还没有验证过的方法。把确实愿意再试的方法放进来，之后心蕊会优先参考。</p>`;
  actionList.innerHTML = actions.length
    ? actions.map((action) => `
      <div class="action-item">
        <div><span>${escapeHtml(actionStatusLabels[action.status] || "已记录")}</span><strong>${escapeHtml(action.text)}</strong></div>
        <button type="button" data-action-delete="${action.id}">删除</button>
      </div>
    `).join("")
    : `<p class="dialog-copy">还没有约定回访的小行动。完成工具后，可以选择“下次回来问我”。</p>`;
}

function openDialog(dialog) {
  modalBackdrop.hidden = false;
  dialog.hidden = false;
}

function closeDialogs() {
  modalBackdrop.hidden = true;
  memoryDialog.hidden = true;
  safetyDialog.hidden = true;
}

function returnToProfileGate() {
  if (activeProfile) saveProfile();
  localStorage.removeItem("heartAiriLastProfile");
  activeProfile = null;
  conversationHistory = [];
  sessionId = createSessionId();
  messages.innerHTML = "";
  input.value = "";
  dailyNote.value = "";
  activeToolFlow = null;
  pendingFollowupId = null;
  checkinPanel.hidden = true;
  followupPanel.hidden = true;
  closeDialogs();
  setQuietMode(false);
  welcomeGate.hidden = false;
  profileName.value = "";
  profileName.focus();
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const helper = document.createElement("textarea");
    helper.value = text;
    document.body.appendChild(helper);
    helper.select();
    const copied = document.execCommand("copy");
    helper.remove();
    return copied;
  }
}

function renderFocusFlow(flowName) {
  const flow = focusFlows[flowName];
  if (flow) addMessage(flow.intro, "bot");
  if (flowName === "support") openDialog(safetyDialog);
}

function initProfileAndMvp() {
  const lastName = localStorage.getItem("heartAiriLastProfile");
  const existing = lastName ? loadProfile(lastName) : null;
  if (existing) {
    showProfile(existing);
  }

  profileForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = profileName.value.trim();
    if (!name) return;
    const existingProfile = loadProfile(name);
    activeProfile = ensureProfileShape(existingProfile || { name, memories: [], safetyPlan: null, createdAt: Date.now() });
    localStorage.setItem("heartAiriLastProfile", name);
    saveProfile();
    showProfile(activeProfile);
  });

  [dailyMood, dailyEnergy, dailyStress, dailyPreference].forEach((group) => {
    group.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-value]");
      if (!button) return;
      group.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item === button));
      const key = group === dailyMood ? "mood" : group === dailyEnergy ? "energy" : group === dailyStress ? "stress" : "preference";
      dailyDraft[key] = key === "preference" ? button.dataset.value : Number(button.dataset.value);
      checkinTitle.textContent = "今天的你，大概在哪里？";
    });
  });

  dailyCauses.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-value]");
    if (!button) return;
    button.classList.toggle("active");
    dailyDraft.causes = [...dailyCauses.querySelectorAll("button.active")].map((item) => item.dataset.value);
  });

  checkinForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!activeProfile) return;
    if (!dailyDraft.mood || !dailyDraft.energy || !dailyDraft.stress || !dailyDraft.preference) {
      checkinTitle.textContent = "再选一下心情、精力、压力和陪伴方式";
      return;
    }
    const record = {
      ...dailyDraft,
      note: dailyNote.value.trim(),
      date: localDateKey(),
      createdAt: Date.now()
    };
    activeProfile.dailyCheckins = [...activeProfile.dailyCheckins.filter((item) => item.date !== record.date), record].slice(-30);
    mood = record.mood <= 1 ? "storm" : record.mood === 2 ? "rainy" : record.mood === 3 ? "cloudy" : "sunny";
    setActive("moods", "mood", mood);
    document.body.dataset.mood = mood;
    saveProfile();
    finishCheckin(record);
  });

  document.querySelector("#skipCheckin").addEventListener("click", () => {
    if (!activeProfile) return;
    const record = { skipped: true, date: localDateKey(), createdAt: Date.now() };
    activeProfile.dailyCheckins = [...activeProfile.dailyCheckins.filter((item) => item.date !== record.date), record].slice(-30);
    saveProfile();
    checkinPanel.hidden = true;
    applyToolRecommendation(recommendTool({ daily: null }));
    renderPendingFollowup();
    addMessage("好，今天不填也可以。你想从哪一句开始都行。", "bot");
  });

  quietMode.addEventListener("click", () => {
    setQuietMode(!document.body.classList.contains("quiet-mode"));
  });

  logoutProfile.addEventListener("click", returnToProfileGate);

  document.querySelector("#openMemory").addEventListener("click", () => {
    renderMemoryList();
    openDialog(memoryDialog);
  });
  document.querySelector("#openSafety").addEventListener("click", () => openDialog(safetyDialog));
  document.querySelector("#closeMemory").addEventListener("click", closeDialogs);
  document.querySelector("#closeSafety").addEventListener("click", closeDialogs);
  modalBackdrop.addEventListener("click", closeDialogs);

  memoryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = memoryInput.value.trim();
    if (!text || !activeProfile) return;
    activeProfile.memories = [...(activeProfile.memories || []), { text, createdAt: Date.now() }].slice(-30);
    saveProfile();
    memoryInput.value = "";
    renderMemoryList();
  });

  memoryList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-memory-index]");
    if (!button || !activeProfile) return;
    activeProfile.memories.splice(Number(button.dataset.memoryIndex), 1);
    saveProfile();
    renderMemoryList();
  });

  memoryTabs.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-memory-tab]");
    if (!button) return;
    memoryTabs.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item === button));
    document.querySelectorAll("[data-memory-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.memoryPanel !== button.dataset.memoryTab;
    });
  });

  methodForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = methodInput.value.trim();
    if (!text) return;
    saveMethod(text, methodCategory.value, "manual");
    methodInput.value = "";
  });

  methodList.addEventListener("click", (event) => {
    if (!activeProfile) return;
    const effectButton = event.target.closest("[data-method-effect]");
    const deleteButton = event.target.closest("[data-method-delete]");
    if (effectButton) {
      const method = activeProfile.methods.find((item) => item.id === effectButton.dataset.methodId);
      if (!method) return;
      method.effectiveness = effectButton.dataset.methodEffect;
      method.lastRatedAt = Date.now();
      saveProfile();
      renderMemoryList();
      applyToolRecommendation(recommendTool());
      return;
    }
    if (deleteButton) {
      activeProfile.methods = activeProfile.methods.filter((item) => item.id !== deleteButton.dataset.methodDelete);
      saveProfile();
      renderMemoryList();
    }
  });

  actionList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action-delete]");
    if (!button || !activeProfile) return;
    activeProfile.actions = activeProfile.actions.filter((item) => item.id !== button.dataset.actionDelete);
    saveProfile();
    renderMemoryList();
    renderPendingFollowup();
  });

  followupPanel.addEventListener("click", (event) => {
    const button = event.target.closest("[data-followup-status]");
    if (!button || !activeProfile || !pendingFollowupId) return;
    const action = activeProfile.actions.find((item) => item.id === pendingFollowupId);
    if (!action) return;
    const result = button.dataset.followupStatus;
    action.status = result === "pending" ? "pending" : result;
    if (result === "pending") action.dueAt = Date.now() + 24 * 60 * 60 * 1000;
    action.lastResult = result;
    action.lastCheckedAt = Date.now();
    saveProfile();
    followupPanel.hidden = true;
    pendingFollowupId = null;
    const replies = {
      done: "你把这一步做完了。我更在意的是：这个动作有没有让事情轻一点，而不是完成得漂不漂亮。",
      partial: "做了一点也算真实推进。我们可以保留已经完成的部分，剩下的继续缩小。",
      pending: "没开始不等于失败。可能是太难、忘记了，或者今天确实没力气；这次先不追着你问。",
      cancelled: "可以取消。计划是为你服务的，不合适就放下，不需要向我交作业。"
    };
    addMessage(replies[result], "bot");
    renderMemoryList();
  });

  document.querySelector("#clearProfile").addEventListener("click", () => {
    if (!activeProfile || !window.confirm("确定清除这个昵称的全部记录吗？")) return;
    localStorage.removeItem(profileKey(activeProfile.name));
    localStorage.removeItem("heartAiriLastProfile");
    activeProfile = null;
    closeDialogs();
    welcomeGate.hidden = false;
    profileName.value = "";
    conversationHistory = [];
    sessionId = createSessionId();
    messages.innerHTML = "";
  });

  document.querySelector("#clearConversation").addEventListener("click", () => {
    if (!activeProfile || !window.confirm("确定清空最近对话吗？主动保存的长期记忆会保留。")) return;
    conversationHistory = [];
    sessionId = createSessionId();
    activeProfile.conversation = [];
    activeProfile.sessionId = sessionId;
    saveProfile();
    renderConversationHistory();
    renderMemoryList();
    addMessage(`我是心蕊。${activeProfile.name}，我们可以从现在重新开始。`, "bot");
  });

  document.querySelector("#copyHelpMessage").addEventListener("click", async (event) => {
    const contact = safetyContact.value.trim() || "你";
    const copied = await copyText(`${contact}，我现在状态不太好，不需要你马上解决问题，可以联系我并陪我十分钟吗？`);
    event.target.textContent = copied ? "已复制求助消息" : "复制失败，请手动复制";
  });

  document.querySelector("#saveSafetyPlan").addEventListener("click", () => {
    if (!activeProfile) return;
    activeProfile.safetyPlan = {
      warnings: safetyWarnings.value.trim(),
      calming: safetyCalming.value.trim(),
      place: safetyPlace.value.trim(),
      contact: safetyContact.value.trim(),
      professional: safetyProfessional.value.trim(),
      steps: [...document.querySelectorAll("[data-safety-step]")].filter((input) => input.checked).map((input) => input.dataset.safetyStep),
      updatedAt: Date.now()
    };
    saveProfile();
    safetySaved.textContent = "已保存在这台设备上。你随时可以回来修改或清除。";
  });
}

function parseSseEvent(rawEvent) {
  let event = "message";
  const data = [];
  for (const line of rawEvent.split(/\r?\n/)) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    if (line.startsWith("data:")) data.push(line.slice(5).trim());
  }
  if (!data.length) return null;
  return { event, data: JSON.parse(data.join("\n")) };
}

async function chatWithHeart(text) {
  spirit.dataset.state = "thinking";
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "text/event-stream" },
    body: JSON.stringify({
      text,
      mood,
      mode,
      stream: true,
      sessionId,
      nickname: activeProfile?.name || "",
      history: conversationHistory.slice(-24),
      memories: [
        ...(activeProfile?.memories || []).map((memory) => memory.text),
        ...(activeProfile?.methods || []).filter((method) => method.effectiveness !== "unsuitable").map((method) => `对我可能有用的方法：${method.text}`)
      ],
      dailyState: latestDailyCheckin(),
      preference: latestDailyCheckin()?.preference || ""
    })
  });
  if (!response.ok) throw new Error(`request failed: ${response.status}`);
  if (!response.body) throw new Error("stream is unavailable");

  const decoder = new TextDecoder();
  let buffer = "";
  let reply = "";
  let botMessage = null;
  let result = null;
  let streamContext = null;

  function handle(rawEvent) {
    const message = parseSseEvent(rawEvent);
    if (!message) return;
    if (message.event === "context") {
      streamContext = message.data;
      sessionId = message.data.sessionId || sessionId;
      applyKnot(message.data, { showReply: false });
    } else if (message.event === "delta") {
      reply += message.data.delta || "";
      botMessage ||= addMessage("", streamContext?.safety?.crisis ? "guard" : "bot");
      botMessage.textContent = reply;
      messages.scrollTop = messages.scrollHeight;
    } else if (message.event === "replace") {
      reply = message.data.reply || "";
      botMessage ||= addMessage("", "bot");
      botMessage.textContent = reply;
    } else if (message.event === "result") {
      result = message.data;
      reply = result.reply || reply;
      botMessage ||= addMessage(reply, result.safety?.crisis ? "guard" : "bot");
      botMessage.textContent = reply;
      if (result.fallback) runtimeStatus.textContent = "轻量陪伴中";
    } else if (message.event === "error") {
      throw new Error(message.data.message || "reply stream failed");
    }
  }

  for await (const chunk of response.body) {
    buffer += decoder.decode(chunk, { stream: true });
    const events = buffer.split(/\r?\n\r?\n/);
    buffer = events.pop() || "";
    events.forEach(handle);
  }
  buffer += decoder.decode();
  if (buffer.trim()) handle(buffer);
  if (!result || !reply) throw new Error("reply stream ended early");
  return { ...result, reply };
}

async function loadRuntime() {
  try {
    const runtime = await fetch("/api/runtime").then((response) => response.json());
    runtimeStatus.textContent = runtime.llm ? "深度陪伴已开启" : "轻量陪伴中";
    return runtime;
  } catch {
    runtimeStatus.textContent = "陪伴状态未知";
    return null;
  }
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function placePet(x, y) {
  const rect = floatingPet.getBoundingClientRect();
  const nextX = clamp(x, 8, window.innerWidth - rect.width - 8);
  const nextY = clamp(y, 8, window.innerHeight - rect.height - 8);
  floatingPet.style.left = `${nextX}px`;
  floatingPet.style.top = `${nextY}px`;
  floatingPet.style.bottom = "auto";
}

function restorePetPosition() {
  const saved = JSON.parse(localStorage.getItem("heartAiriPetPosition") || "null");
  if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)) {
    placePet(saved.x, saved.y);
    return;
  }
  window.requestAnimationFrame(() => {
    const rect = floatingPet.getBoundingClientRect();
    placePet(22, window.innerHeight - rect.height - 22);
  });
}

function dockPetForQuietMode() {
  window.requestAnimationFrame(() => {
    const petRect = floatingPet.getBoundingClientRect();
    const dialogueRect = dialoguePanel?.getBoundingClientRect();
    const composerRect = composer?.getBoundingClientRect();
    const left = (dialogueRect?.left || 0) + (window.innerWidth <= 760 ? 14 : 26);
    const lowerEdge = composerRect?.top || dialogueRect?.bottom || window.innerHeight;
    const minTop = (dialogueRect?.top || 0) + 80;
    const top = Math.max(minTop, lowerEdge - petRect.height - (window.innerWidth <= 760 ? 14 : 22));
    placePet(left, top);
    syncPetLayout();
  });
}

function setQuietMode(enabled) {
  document.body.classList.toggle("quiet-mode", enabled);
  quietMode.textContent = enabled ? "恢复完整模式" : "安静模式";
  spirit.dataset.state = enabled ? "soft" : "idle";
  if (enabled) {
    dockPetForQuietMode();
  } else {
    restorePetPosition();
    window.requestAnimationFrame(syncPetLayout);
  }
}

function fitLive2DModel() {
  if (!live2dModel || !live2dApp) return;
  // renderer.width/height are backing-buffer pixels and include devicePixelRatio.
  // Pixi positions display objects in logical screen pixels.
  const width = live2dApp.screen?.width || live2dApp.renderer.screen?.width || 1;
  const height = live2dApp.screen?.height || live2dApp.renderer.screen?.height || 1;
  const modelWidth = live2dBaseWidth;
  const modelHeight = live2dBaseHeight;

  // Fit the native model into the real outer canvas. The previous `* 2` plus
  // an oversized canvas made the model render outside the visible pet.
  const scale = Math.min(width / modelWidth, height / modelHeight) * 0.82;
  live2dModel.scale.set(scale);
  live2dModel.x = width * 0.5;
  live2dModel.y = height * 0.5;
}

function syncPetLayout() {
  const rect = floatingPet.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  live2dStage.width = width;
  live2dStage.height = height;
  if (live2dApp?.renderer) {
    live2dApp.renderer.resize(width, height);
  }
  fitLive2DModel();
}

function applyLive2DExpressionParams() {
  const coreModel = live2dModel?.internalModel?.coreModel;
  if (!coreModel) return;
  const smiling = ["soft", "relieved", "play"].includes(spirit.dataset.state);
  const thinking = spirit.dataset.state === "thinking";
  const guarded = spirit.dataset.state === "guard";
  coreModel.addParameterValueById("ParamMouthForm", smiling ? 0.72 : guarded ? -0.22 : 0.14, 0.72);
  coreModel.addParameterValueById("ParamMouthOpenY", smiling ? 0.08 : 0, 0.38);
  coreModel.addParameterValueById("ParamEyeLSmile", smiling ? 0.48 : 0, 0.5);
  coreModel.addParameterValueById("ParamEyeRSmile", smiling ? 0.48 : 0, 0.5);
  coreModel.addParameterValueById("ParamBrowLForm", thinking ? -0.18 : guarded ? -0.32 : 0.08, 0.45);
  coreModel.addParameterValueById("ParamBrowRForm", thinking ? -0.18 : guarded ? -0.32 : 0.08, 0.45);
}

function playLive2DMotion(state = spirit.dataset.state) {
  if (!live2dReady || !live2dModel || typeof live2dModel.motion !== "function") return;
  const groups = {
    idle: "Idle",
    soft: "Tap",
    thinking: "FlickUp",
    relieved: "Tap@Body",
    play: "Flick",
    guard: "FlickDown"
  };
  const motionGroups = new Set(["Idle", "Tap", "Tap@Body", "Flick", "FlickUp", "FlickDown", "Flick@Body"]);
  const group = motionGroups.has(state) ? state : groups[state] || "Idle";
  const priority = window.PIXI?.live2d?.MotionPriority?.FORCE;
  Promise.resolve(live2dModel.motion(group, undefined, priority)).catch(() => {});
}

function startLive2DIdleLoop() {
  window.clearInterval(live2dIdleTimer);
  live2dIdleTimer = window.setInterval(() => {
    if (!live2dReady || !live2dModel?.internalModel?.motionManager?.isFinished?.()) return;
    const calmState = ["idle", "soft", "relieved"].includes(spirit.dataset.state);
    playLive2DMotion(calmState ? "Idle" : spirit.dataset.state);
  }, 4200);
}

async function initLive2DCharacter() {
  if (!live2dStage || !window.PIXI?.Application) return;
  const Live2DModel = window.PIXI.live2d?.Live2DModel || window.Live2DModel;
  if (!Live2DModel?.from) return;
  try {
    live2dApp = new window.PIXI.Application({
      view: live2dStage,
      width: 360,
      height: 720,
      transparent: true,
      backgroundAlpha: 0,
      antialias: true,
      autoDensity: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2)
    });
    live2dModel = await Live2DModel.from("/live2d/hiyori/hiyori_pro_t11.model3.json", {
      autoInteract: false
    });
    live2dApp.stage.addChild(live2dModel);
    live2dModel.internalModel?.on?.("beforeModelUpdate", applyLive2DExpressionParams);
    live2dBaseWidth = Math.max(live2dModel.width || 1, 1);
    live2dBaseHeight = Math.max(live2dModel.height || 1, 1);
    live2dModel.anchor?.set(0.5, 0.5);
    syncPetLayout();
    live2dReady = true;
    spirit.classList.add("live2d-ready");
    playLive2DMotion("Idle");
    startLive2DIdleLoop();

    floatingPet.addEventListener("click", () => playLive2DMotion("Tap"));

    const stateObserver = new MutationObserver(() => playLive2DMotion());
    stateObserver.observe(spirit, { attributes: true, attributeFilter: ["data-state"] });
    window.addEventListener("resize", syncPetLayout);
  } catch (error) {
    console.warn("Live2D failed to load, using PNG fallback.", error);
    window.clearInterval(live2dIdleTimer);
    live2dReady = false;
    spirit.classList.remove("live2d-ready");
  }
}

function enablePetDrag() {
  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  floatingPet.addEventListener("pointerdown", (event) => {
    dragging = true;
    floatingPet.classList.add("dragging");
    floatingPet.setPointerCapture(event.pointerId);
    const rect = floatingPet.getBoundingClientRect();
    offsetX = event.clientX - rect.left;
    offsetY = event.clientY - rect.top;
  });

  floatingPet.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    placePet(event.clientX - offsetX, event.clientY - offsetY);
  });

  floatingPet.addEventListener("pointerup", (event) => {
    dragging = false;
    floatingPet.classList.remove("dragging");
    const rect = floatingPet.getBoundingClientRect();
    localStorage.setItem("heartAiriPetPosition", JSON.stringify({ x: rect.left, y: rect.top }));
    if (floatingPet.hasPointerCapture(event.pointerId)) {
      floatingPet.releasePointerCapture(event.pointerId);
    }
  });

  window.addEventListener("resize", () => {
    if (document.body.classList.contains("quiet-mode")) {
      dockPetForQuietMode();
      return;
    }
    const rect = floatingPet.getBoundingClientRect();
    placePet(rect.left, rect.top);
  });
}

function enableMiniGames() {
  bubbleGame.addEventListener("click", (event) => {
    const bubble = event.target.closest(".bubble");
    if (!bubble) return;
    bubble.classList.add("popped");
    spirit.dataset.state = "play";
    gameStatus.textContent = "啪，一点点压力被放掉了";
    window.setTimeout(() => {
      bubble.classList.remove("popped");
    }, 900);
  });

  breathGame.addEventListener("click", () => {
    breathing = !breathing;
    breathGame.classList.toggle("breathing", breathing);
    floatingPet.classList.toggle("breathing", breathing);
    spirit.dataset.state = breathing ? "relieved" : "idle";
    gameStatus.textContent = breathing ? "吸气四拍，呼气六拍" : "呼吸练习已暂停";
    if (breathing) {
      addMessage("我把呼吸灯打开了。吸气四拍，呼气六拍，跟三轮就够。", "bot");
    }
  });

  gardenGame.addEventListener("click", (event) => {
    if (!event.target.closest("button")) return;
    gardenLevel = Math.min(gardenLevel + 1, 3);
    gardenGame.dataset.level = String(gardenLevel);
    spirit.dataset.state = "relieved";
    gameStatus.textContent = gardenLevel >= 3 ? "花开了，今天已经照顾到一点自己" : "花园喝到水了";
    if (gardenLevel === 3) {
      addMessage("心情花园开了一点。不是所有事都好了，但你刚刚完成了一次照顾自己的动作。", "bot");
    }
  });
}

function applyKnot({ safety, knot, reply }, { showReply = true } = {}) {
  const needsHumanSupport = safety?.needsHumanSupport;
  spirit.dataset.state = safety?.crisis ? "guard" : needsHumanSupport ? "thinking" : "soft";
  safetyStatus.textContent = safety?.crisis ? "危机守护" : needsHumanSupport ? "建议找真人" : "陪伴梳理";
  knotTitle.textContent = knot.title || "今天的心结魔方";
  knotSummary.textContent = knot.fact || "已经抽取出一组心结线索。";
  feeling.textContent = knot.feeling || "起伏";
  need.textContent = knot.need || "被理解";
  tinyStep.textContent = knot.tinyStep || knot.controllable || "慢一点";
  renderCube(knot.tiles || ["事实", "感受", "需要", "猜测", "可控", "支持", "小步", "呼吸", "放下"]);
  if (needsHumanSupport && !safety?.crisis) addMessage(safety.message, "bot");
  if (showReply) addMessage(reply || knot.reply || "我在这里，我们一格一格来。", safety?.crisis ? "guard" : "bot");
  if (needsHumanSupport) renderFocusFlow("support");
}

function renderToolMock(tool) {
  const mock = toolMocks[tool] || toolMocks.hold;
  sampleConversation.innerHTML = `
    <div class="sample-title">
      <span>${escapeHtml(mock.title)}</span>
      <strong>${escapeHtml(mock.when)}</strong>
    </div>
    ${mock.flow.map(([who, text]) => `<article class="message ${who} sample">${escapeHtml(text)}</article>`).join("")}
    <div class="sample-outcome">${escapeHtml(mock.output)}。${escapeHtml(mock.result)}</div>
  `;
}

function renderAspectMock(tile, index) {
  const aspect = splitAspectTile(tile, index);
  sampleConversation.innerHTML = `
    <div class="sample-title">
      <span>${escapeHtml(aspect.name)}</span>
      <strong>${escapeHtml(aspect.mock.guide)}</strong>
    </div>
    <article class="message user sample">${escapeHtml(aspect.value)}</article>
    <article class="message bot sample">${escapeHtml(aspect.mock.question)}</article>
    <article class="message bot sample">${escapeHtml(aspect.mock.close)}</article>
    <div class="sample-outcome">正在查看第 ${index + 1} 格。每一格都有独立的整理入口。</div>
  `;
}

async function runSelectedTool() {
  const starterText = {
    breathe: "我想先让身体稳定一点",
    sleep: "我今晚脑子停不下来",
    letter: "我现在对自己很失望",
    boundary: "我想练习表达自己的边界",
    tiny: "我想开始，但现在很难动起来"
  };
  const payload = {
    text: input.value.trim() || starterText[mode] || "我想先照顾一下现在的状态",
    mood,
    tool: mode
  };
  const data = await fetch("/api/toolkit/run", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  }).then((response) => response.json());
  const result = data.result;
  safetyStatus.textContent = data.safety?.crisis ? "危机守护" : result.intent;
  addMessage(`${result.title}\n${result.prompt}\n\n${result.steps.map((step, index) => `${index + 1}. ${step}`).join("\n")}`, data.safety?.crisis ? "guard" : "bot");
  addMessage(result.reply, data.safety?.crisis ? "guard" : "bot");
  spirit.dataset.state = mode === "breathe" ? "relieved" : mode === "play" ? "play" : data.safety?.crisis ? "guard" : "soft";
}

async function handleToolWorkbenchAction(event) {
  const button = event.target.closest("[data-tool-action]");
  if (!button || !activeToolFlow) return;
  const action = button.dataset.toolAction;
  const flow = activeToolFlow;

  if (action === "exit") {
    activeToolFlow = null;
    renderToolWorkbench();
    addMessage("好，我们回到普通聊天。你可以照原来的节奏说。", "bot");
    input.focus();
    return;
  }

  if (action === "restart") {
    startGuidedTool(flow.tool);
    return;
  }

  if (action === "save-method") {
    if (!flow.methodCandidate) return;
    saveMethod(flow.methodCandidate, flow.tool === "support" ? "relationship" : "action", flow.tool);
    button.textContent = "已保存";
    button.disabled = true;
    addMessage("我把它放进“有效方法”了。以后你可以标记有效、一般或不适合，也可以随时删除。", "bot");
    return;
  }

  if (action === "save-action") {
    if (!flow.actionCandidate) return;
    saveAction(flow.actionCandidate, flow.tool);
    button.textContent = "已约定下次回访";
    button.disabled = true;
    addMessage("好。下次你打开心蕊时，我会问一次做起来怎么样；没做也可以直接说，不会追着你交作业。", "bot");
    return;
  }

  if (action === "pressure-class") {
    const index = Number(button.dataset.itemIndex);
    if (!Number.isNaN(index)) {
      flow.data.categories ||= {};
      flow.data.categories[index] = button.dataset.pressureClass;
      renderToolWorkbench();
    }
    return;
  }

  if (action === "pressure-done") {
    flow.step = 2;
    const grouped = getGroupedPressure(flow);
    const first = grouped.must[0] || flow.data.items[0] || "眼前这件事";
    flow.prompt = `现在只选一个最小动作。针对“${first}”，30 秒内能做的版本是什么？`;
    addMessage("分类完成。现在不要同时处理三栏，只从必须做里拿出一个小到能开始的动作。", "bot");
    renderToolWorkbench();
    input.focus();
    return;
  }

  if (action === "support-contact") {
    flow.data.contact = button.dataset.value;
    flow.step = 1;
    flow.prompt = "你希望对方怎么帮你？选一个：陪我说说话、一起想办法、尽快联系我。";
    addMessage(`好，先找“${flow.data.contact}”。我们把请求说具体一点。`, "bot");
    renderToolWorkbench();
    return;
  }

  if (action === "support-need") {
    flow.data.need = button.dataset.value;
    completeSupport(flow);
    renderToolWorkbench();
    return;
  }

  if (action === "support-tone") {
    flow.data.tone = button.dataset.tone;
    flow.data.draft = buildSupportDraft(flow, flow.data.tone);
    flow.memoryCandidate = `我可以求助时使用这句开口：${flow.data.draft}`;
    flow.methodCandidate = `需要求助时，我可以这样开口：${flow.data.draft}`;
    renderToolWorkbench();
    return;
  }

  if (action === "copy-support") {
    const copied = await copyText(flow.data.draft || "");
    button.textContent = copied ? "已复制" : "复制失败";
    return;
  }

  if (action === "open-safety") {
    openDialog(safetyDialog);
  }
}

toolGrid.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  applyToolRecommendation({ tool: button.dataset.tool, reason: toolMocks[button.dataset.tool]?.when || "按你的选择开始" });
  sampleConversation.hidden = true;
  spirit.dataset.state = mode === "play" ? "play" : mode === "breathe" ? "relieved" : "idle";
});

contextTool.addEventListener("click", () => startGuidedTool(contextTool.dataset.tool));

allToolsToggle.addEventListener("click", () => {
  const expanded = allToolsToggle.getAttribute("aria-expanded") === "true";
  allToolsToggle.setAttribute("aria-expanded", String(!expanded));
  allToolsToggle.textContent = expanded ? "更多工具" : "收起工具";
  toolGrid.hidden = expanded;
});

runTool.textContent = "开始";
runTool.addEventListener("click", () => startGuidedTool(mode));
sampleConversation.addEventListener("click", handleToolWorkbenchAction);

document.querySelector("#moods").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  mood = button.dataset.mood;
  setActive("moods", "mood", mood);
  document.body.dataset.mood = mood;
});

composer.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text || chatPending) return;
  chatPending = true;
  const submitButton = composer.querySelector("button[type='submit']");
  submitButton.disabled = true;
  submitButton.textContent = "回应中";
  addMessage(text, "user");
  input.value = "";
  try {
    if (activeToolFlow && !activeToolFlow.completed) {
      await processGuidedToolAnswer(text);
    } else {
      applyToolRecommendation(recommendTool({ text }));
      const result = await chatWithHeart(text);
      saveConversationTurn(text, result.reply);
    }
  } catch (error) {
    spirit.dataset.state = "guard";
    addMessage("我刚刚没接稳这句话。先别急，我们可以重新说短一点。", "bot");
    console.error(error);
  } finally {
    chatPending = false;
    submitButton.disabled = false;
    submitButton.textContent = activeToolFlow && !activeToolFlow.completed ? "继续" : "发送";
    input.focus();
  }
});

renderCube(["事实：等待一句话", "感受：等待命名", "需要：被理解", "猜测：先放旁边", "可控：慢慢说完", "支持：心蕊陪着", "小步：说出来", "身体：呼吸三轮", "收束：今天到这里"]);
sampleConversation.hidden = true;
applyToolRecommendation(recommendTool({ daily: null }));
restorePetPosition();
enablePetDrag();
initLive2DCharacter();
enableMiniGames();
initProfileAndMvp();
loadRuntime();
if (activeProfile) {
  if (!conversationHistory.length) addMessage(`我是心蕊。${activeProfile.name}，今天不用急着解决全部事情，我们先照顾一个小地方。`, "bot");
}
