const crisisPatterns = [
  /自杀|轻生|不想活|活不下去|结束生命|死了算了|想死|没必要活/,
  /伤害自己|自残|割腕|吞药|跳楼|上吊/,
  /杀了|报复|伤害别人|弄死|伤害他人/
];

const supportPattern = /撑不住|崩溃|不安全|不想一个人|绝望|没有意义|消失|活着好累/;

export function safetyCheck(value) {
  const text = String(value || "");
  const immediate = crisisPatterns.some((pattern) => pattern.test(text));
  const support = supportPattern.test(text);

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

export function crisisKnot(safety) {
  return {
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
  };
}
