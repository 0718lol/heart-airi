# AIRI 二开记录

上游候选: https://github.com/moeru-ai/airi

当前结论:

- `moeru-ai/airi` 是最适合心蕊二开的上游：MIT、TypeScript、Web/macOS/Windows、Live2D/VRM、实时语音、agent/runtime 分层完整。
- 2026-08-11 通过 GitHub API 核验：约 47.6k stars、4.7k forks，今天仍有提交，社区活跃度和工程完成度都高。
- 已在 `/workspace/upstreams/airi` 建 partial clone，上游 Git 元数据和根配置可用。
- 已在 `/workspace/upstreams/airi-selected` 下载精选源码，约 1234 个文件、9.5MB，适合本地阅读和定向迁移。
- 精选源码包含 `apps/stage-web`、`apps/stage-tamagotchi`、`packages/core-agent`、`packages/core-character`、`packages/stage-ui`、`packages/stage-ui-live2d`、server/runtime/shared 包。
- 大模型、媒体、Live2D/3D 二进制素材已跳过；后续如果要真实 Live2D 角色，需要另行选择可授权模型素材。

实际尝试:

- `git clone --depth 1 --single-branch --no-checkout` 在当前网络下长时间未完成。
- `git clone --depth 1 --filter=blob:none --sparse` 可拿到 Git 元数据，但 checkout 大量文件耗时过长。
- `main.tar.gz` 下载 2 分钟约 3MB，速度不足以稳定拉完整仓库。
- 2026-08-11 后续重试 partial clone 成功；sparse checkout 大目录仍偏慢，所以改用 GitHub tree/raw API 下载精选源码。

当前策略:

保持心蕊的轻量产品形态，选择性迁移 AIRI 的核心思想，而不是合并整套 Vue/pnpm monorepo:

- `public/` 是角色舞台层。
- `server.js` 只负责 HTTP 路由和 SSE 传输。
- `src/agent.js` 负责会话边界、上下文编排和模型降级。
- `src/providers/` 提供模型无关边界，当前先实现 OpenAI 兼容接口。
- `src/safety.js` 在模型调用前执行确定性危机判断。
- 对话与长期记忆保存在浏览器本地，服务端不持久化心理内容。
- API 路径保留为后续接 AIRI core-agent 或 stage-web 的边界:
  - `/api/safety/check`
  - `/api/knot/extract`
  - `/api/chat`

已完成的 AIRI 思路迁移:

- 多轮上下文与会话 ID。
- Provider 边界、SSE 流式回复和失败降级。
- 固定角色人格与模型外安全层。
- 用户可清除的本地对话、可显式管理的长期记忆。

后续迁移点:

- 用 AIRI `stage-ui-live2d` 替换当前 CSS/SVG 角色。
- 参考 AIRI `core-character` 扩展角色配置和 Live2D 状态映射。
- 参考 AIRI `core-agent` 增加受控工具调用与更多模型 Provider。
- 在现有本地记忆控制之上增加摘要压缩和可关闭的记忆开关。
- 为语音增加按住说话、可打断播放和 ASteam bridge/browser 双路径。
