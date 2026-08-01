# 参与贡献

感谢你帮助 Layntra 变得更可控、更容易使用。

开发环境需要 Node.js 20+；真实 E2E 还需要 Codex 和 Figma Desktop。提交修改前
请运行：

```bash
npm install --ignore-scripts --package-lock=false
npm --prefix packages/mcp-bridge ci --ignore-scripts
npm run verify
```

运行时代码分为三个边界：`skills/layntra` 负责用户意图和确认策略，
`packages/mcp-bridge` 负责本地协议和传输，`apps/figma-plugin` 负责 Figma 文档
访问。不要绕过 `$layntra plan`、`$layntra apply` 和写入后的重新读取验证。

用户文档必须同时更新英文与简体中文版本。测试请使用可丢弃的个人 Starter 文件，
不要提交个人路径、邮箱、文件 ID、密钥或真实业务内容。

维护者使用 `bd` 跟踪任务，普通贡献者不必安装 `bd`，可以直接创建 GitHub Issue。
提交代码即表示同意以 MIT License 提供贡献。
