# 参与贡献

感谢你帮助 Layntra 变得更可控、更容易使用。

提交修改前请运行：

```bash
npm run verify
```

运行时代码分为三个边界：`skills/layntra` 负责用户意图和确认策略，
`packages/mcp-bridge` 负责本地协议和传输，`apps/figma-plugin` 负责 Figma 文档
访问。不要绕过 `$layntra plan`、`$layntra apply` 和写入后的重新读取验证。

用户文档必须同时更新英文与简体中文版本。测试请使用可丢弃的个人 Starter 文件，
不要提交个人路径、邮箱、文件 ID、密钥或真实业务内容。
