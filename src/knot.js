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
  solve: {
    title: "一起想办法",
    intent: "现实问题",
    steps: ["确定一个具体问题", "分清今天能控制的部分", "选择一个最小动作", "准备更容易的备用动作"],
    prompt: "不同时解决全部，我们只推进今天能控制的一格。"
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
    return "这里可能需要一点边界。可以先写：“我理解你的期待，但我现在能做到的是____，不能做到的是____。”";
  }
  if (mode === "tiny") {
    return `我们把目标缩到很小：${action}。不是为了立刻变好，是为了让你重新感觉自己还能动一下。`;
  }
  if (mode === "support") {
    return "我们准备一条求助消息：“我现在状态不太好，不需要你解决问题，可以陪我十分钟吗？”";
  }
  if (mode === "solve") {
    return `我们先处理“${fact}”里你能控制的部分。今天不用解决全部，只选一个能推进的小动作：${action}。如果做不动，就把它再缩小一半。`;
  }
  if (mode === "untangle") {
    return `我把它拆成三层：事实是“${fact}”，感受像“${feeling}”，需要可能是“${need}”。先不要急着评判，今天只做一步：${action}。`;
  }
  if (mode === "play") {
    return `这团心事有点重，我们先让身体回来。它里面有“${feeling}”，也有“${need}”。先做一个很小的动作：${action}。`;
  }
  return `我先接住这句话。它外面是“${fact}”，里面像是“${feeling}”。你现在不需要马上变好，先允许自己需要“${need}”。`;
}

export function localKnot(text, mood = "cloudy", mode = "hold") {
  const feeling = findRule(text, feelingRules, mood === "sunny" ? "起伏" : "沉重");
  const need = findRule(text, needRules, "被好好接住");
  const fact = summarize(text);
  const guess = /是不是|可能|应该|肯定|一定|总是|从来/.test(text) ? "这里混着猜测" : "猜测先放旁边";
  const actionMap = {
    play: "摸到一个真实颜色",
    solve: "写下一个能推进的动作",
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

export function mergeModelKnot(local, candidate) {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return local;
  const merged = { ...local };
  for (const key of ["title", "fact", "feeling", "need", "guess", "controllable", "support", "tinyStep", "reply"]) {
    const value = candidate[key];
    if (typeof value === "string" && value.trim()) merged[key] = value.trim().slice(0, key === "reply" ? 800 : 160);
  }
  if (Array.isArray(candidate.tiles) && candidate.tiles.length === 9 && candidate.tiles.every((tile) => typeof tile === "string" && tile.trim())) {
    merged.tiles = candidate.tiles.map((tile) => tile.trim().slice(0, 80));
  }
  return merged;
}

export function runToolkit(text, tool = "hold", mood = "cloudy") {
  const selected = toolkit[tool] || toolkit.hold;
  const knot = localKnot(text, mood, tool);
  return {
    tool: toolkit[tool] ? tool : "hold",
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
