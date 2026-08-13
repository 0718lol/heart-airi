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
const gameStatus = document.querySelector("#gameStatus");
const bubbleGame = document.querySelector("#bubbleGame");
const breathGame = document.querySelector("#breathGame");
const gardenGame = document.querySelector("#gardenGame");
const welcomeGate = document.querySelector("#welcomeGate");
const profileForm = document.querySelector("#profileForm");
const profileName = document.querySelector("#profileName");
const greetingName = document.querySelector("#greetingName");
const quickActions = document.querySelector("#quickActions");
const focusFlow = document.querySelector("#focusFlow");
const quietMode = document.querySelector("#quietMode");
const modalBackdrop = document.querySelector("#modalBackdrop");
const memoryDialog = document.querySelector("#memoryDialog");
const memoryForm = document.querySelector("#memoryForm");
const memoryInput = document.querySelector("#memoryInput");
const memoryList = document.querySelector("#memoryList");
const safetyDialog = document.querySelector("#safetyDialog");
const safetyContact = document.querySelector("#safetyContact");
const safetySaved = document.querySelector("#safetySaved");

let activeProfile = null;

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
  play: "变轻点 · 减压游戏",
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
    when: "适合压力很满，但暂时不想严肃分析的时候。",
    input: "我烦得不行，什么都不想做",
    output: "一个 20 秒减压动作 + 一个轻一点的说法",
    result: "先把情绪强度降下来，再决定要不要继续聊。",
    flow: [
      ["user", "我烦得不行，什么都不想做。"],
      ["bot", "先不解决人生。我们先把这团烦躁变小一点。"],
      ["bot", "给它起个外号，比如“乱飞的纸团”。然后找房间里一个绿色的东西，看它 10 秒。"],
      ["user", "我看到桌上的绿色杯子。"],
      ["bot", "很好。你已经从脑内风暴回到现实物体了。下一步只做一个轻动作：喝一口水，或者把肩膀放下来。"]
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
  activeProfile = profile;
  greetingName.textContent = profile.name;
  profileName.value = profile.name;
  welcomeGate.hidden = true;
  renderMemoryList();
  if (profile.safetyPlan) {
    safetyContact.value = profile.safetyPlan.contact || "";
    document.querySelectorAll("[data-safety-step]").forEach((input) => {
      input.checked = profile.safetyPlan.steps?.includes(input.dataset.safetyStep) || false;
    });
  }
}

function renderMemoryList() {
  if (!activeProfile) return;
  const memories = activeProfile.memories || [];
  memoryList.innerHTML = memories.length
    ? memories.map((memory, index) => `<div class="memory-item"><span>${escapeHtml(memory.text)}</span><button type="button" data-memory-index="${index}">删除</button></div>`).join("")
    : `<p class="dialog-copy">还没有保存的内容。只有你主动点击“记住这件事”，心蕊才会把它放进这里。</p>`;
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
  if (!flow) return;
  const initial = flowName === "support"
    ? "我现在状态不太好，不需要你解决问题，可以陪我十分钟吗？如果你方便，能不能给我回个消息或陪我去一个有人在的地方？"
    : "";
  focusFlow.hidden = false;
  focusFlow.dataset.flow = flowName;
  focusFlow.dataset.step = "0";
  focusFlow.innerHTML = `
    <div class="focus-flow-head"><h3>${escapeHtml(flow.title)}</h3><button class="text-button" type="button" data-flow-close>收起</button></div>
    <p>${escapeHtml(flow.intro)}</p>
    <div class="flow-progress"><span></span></div>
    <div class="flow-step"><strong></strong><button type="button" data-flow-next>完成这一步</button></div>
    ${flowName === "support" ? `<div class="support-message"><textarea id="supportMessage" rows="3">${escapeHtml(initial)}</textarea><button type="button" data-copy-support>复制消息</button></div>` : ""}
  `;
  updateFocusStep();
  focusFlow.scrollIntoView({ behavior: "smooth", block: "nearest" });
  spirit.dataset.state = flowName === "steady" ? "relieved" : flowName === "support" ? "soft" : "thinking";
}

function updateFocusStep() {
  const flowName = focusFlow.dataset.flow;
  const stepIndex = Number(focusFlow.dataset.step || 0);
  const flow = focusFlows[flowName];
  if (!flow) return;
  const step = focusFlow.querySelector(".flow-step strong");
  const progress = focusFlow.querySelector(".flow-progress span");
  const next = focusFlow.querySelector("[data-flow-next]");
  step.textContent = `${stepIndex + 1}. ${flow.steps[stepIndex]}`;
  progress.style.width = `${((stepIndex + 1) / flow.steps.length) * 100}%`;
  next.textContent = stepIndex === flow.steps.length - 1 ? "完成陪伴" : "完成这一步";
}

function initProfileAndMvp() {
  const lastName = localStorage.getItem("heartAiriLastProfile");
  const existing = lastName ? loadProfile(lastName) : null;
  if (existing) showProfile(existing);

  profileForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = profileName.value.trim();
    if (!name) return;
    const existingProfile = loadProfile(name);
    activeProfile = existingProfile || { name, memories: [], safetyPlan: null, createdAt: Date.now() };
    localStorage.setItem("heartAiriLastProfile", name);
    saveProfile();
    showProfile(activeProfile);
    addMessage(`你好，${name}。今天不用表现得很好，我们先从一个小地方开始。`, "bot");
  });

  quickActions.addEventListener("click", (event) => {
    const button = event.target.closest("[data-flow]");
    if (!button) return;
    renderFocusFlow(button.dataset.flow);
  });

  focusFlow.addEventListener("click", async (event) => {
    if (event.target.closest("[data-flow-close]")) {
      focusFlow.hidden = true;
      return;
    }
    if (event.target.closest("[data-flow-next]")) {
      const flow = focusFlows[focusFlow.dataset.flow];
      const nextStep = Number(focusFlow.dataset.step || 0) + 1;
      if (nextStep >= flow.steps.length) {
        addMessage("你已经完成了一个小小的照顾动作。现在不用急着继续，给自己一点缓冲。", "bot");
        focusFlow.hidden = true;
        spirit.dataset.state = "relieved";
      } else {
        focusFlow.dataset.step = String(nextStep);
        updateFocusStep();
      }
    }
    if (event.target.closest("[data-copy-support]")) {
      const copied = await copyText(document.querySelector("#supportMessage").value);
      event.target.textContent = copied ? "已复制，可以发给对方了" : "复制失败，请手动复制";
    }
  });

  quietMode.addEventListener("click", () => {
    document.body.classList.toggle("quiet-mode");
    quietMode.textContent = document.body.classList.contains("quiet-mode") ? "恢复完整模式" : "安静模式";
  });

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

  document.querySelector("#clearProfile").addEventListener("click", () => {
    if (!activeProfile || !window.confirm("确定清除这个昵称的全部记录吗？")) return;
    localStorage.removeItem(profileKey(activeProfile.name));
    localStorage.removeItem("heartAiriLastProfile");
    activeProfile = null;
    closeDialogs();
    welcomeGate.hidden = false;
    profileName.value = "";
  });

  document.querySelector("#copyHelpMessage").addEventListener("click", async (event) => {
    const contact = safetyContact.value.trim() || "你信任的人";
    const copied = await copyText(`我现在状态不太好，不需要你解决问题，可以陪我十分钟吗？我想和${contact}联系一下。`);
    event.target.textContent = copied ? "已复制求助消息" : "复制失败，请手动复制";
  });

  document.querySelector("#saveSafetyPlan").addEventListener("click", () => {
    if (!activeProfile) return;
    activeProfile.safetyPlan = {
      contact: safetyContact.value.trim(),
      steps: [...document.querySelectorAll("[data-safety-step]")].filter((input) => input.checked).map((input) => input.dataset.safetyStep),
      updatedAt: Date.now()
    };
    saveProfile();
    safetySaved.textContent = "已保存在这台设备上。你随时可以回来修改或清除。";
  });
}

async function extractKnot(text) {
  spirit.dataset.state = "thinking";
  const response = await fetch("/api/knot/extract", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text, mood, mode })
  });
  if (!response.ok) throw new Error(`request failed: ${response.status}`);
  return response.json();
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

function applyKnot({ safety, knot }) {
  const needsHumanSupport = safety?.needsHumanSupport;
  spirit.dataset.state = safety?.crisis ? "guard" : needsHumanSupport ? "thinking" : "soft";
  safetyStatus.textContent = safety?.crisis ? "危机守护" : needsHumanSupport ? "建议找真人" : "陪伴梳理";
  knotTitle.textContent = knot.title || "今天的心结魔方";
  knotSummary.textContent = knot.fact || "已经抽取出一组心结线索。";
  feeling.textContent = knot.feeling || "起伏";
  need.textContent = knot.need || "被理解";
  tinyStep.textContent = knot.tinyStep || knot.controllable || "慢一点";
  renderCube(knot.tiles || ["事实", "感受", "需要", "猜测", "可控", "支持", "小步", "呼吸", "放下"]);
  if (needsHumanSupport) addMessage(safety.message, safety.crisis ? "guard" : "bot");
  addMessage(knot.reply || "我在这里，我们一格一格来。", safety?.crisis ? "guard" : "bot");
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
  const payload = {
    text: input.value.trim() || "我最近很焦虑，感觉没人懂我",
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

toolGrid.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  mode = button.dataset.tool;
  toolGrid.querySelectorAll("button").forEach((toolButton) => {
    toolButton.classList.toggle("active", toolButton === button);
  });
  selectedTool.textContent = toolLabels[mode];
  renderToolMock(mode);
  spirit.dataset.state = mode === "play" ? "play" : mode === "breathe" ? "relieved" : "idle";
});

runTool.addEventListener("click", runSelectedTool);

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
  if (!text) return;
  addMessage(text, "user");
  input.value = "";
  try {
    applyKnot(await extractKnot(text));
  } catch (error) {
    spirit.dataset.state = "guard";
    addMessage("我刚刚没接稳这句话。先别急，我们可以重新说短一点。", "bot");
    console.error(error);
  }
});

renderCube(["事实：等待一句话", "感受：等待命名", "需要：被理解", "猜测：先放旁边", "可控：慢慢说完", "支持：心蕊陪着", "小步：说出来", "身体：呼吸三轮", "收束：今天到这里"]);
renderToolMock(mode);
restorePetPosition();
enablePetDrag();
initLive2DCharacter();
enableMiniGames();
initProfileAndMvp();
loadRuntime();
if (activeProfile) {
  addMessage(`我是心蕊。${activeProfile.name}，今天不用急着解决全部事情，我们先照顾一个小地方。`, "bot");
}
