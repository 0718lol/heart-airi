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

先做一个 AIRI-style 的本地承接版，而不是空等完整上游:

- `public/` 是角色舞台层。
- `server.js` 是 agent / safety / knot extraction 网关。
- API 路径保留为后续接 AIRI core-agent 或 stage-web 的边界:
  - `/api/safety/check`
  - `/api/knot/extract`
  - `/api/chat`

后续迁移点:

- 用 AIRI `stage-ui-live2d` 替换当前 CSS/SVG 角色。
- 用 AIRI `core-character` 管理角色人格和状态。
- 用 AIRI `core-agent` 接 LLM 工具调用。
- 用 AIRI memory 方案前，必须先实现用户可查看、可删除、可关闭的心理记忆层。
