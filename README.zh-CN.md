# Layntra

**把产品想法变成可编辑的 Figma 设计，而且任何修改都要先给你看计划。**

Layntra 是为产品经理和非技术用户准备的 Codex 插件。用 `$layntra` 明确唤起，
选择作用范围，确认计划后再执行。生成结果始终是可继续编辑的 Figma 图层。

[English](README.md)

## 五分钟开始

需要 macOS、Node.js 20+、Codex Desktop 或 CLI，以及 Figma Desktop。如果公司的
Dev/Collab/View seat 不能运行 Design 插件，请切换到个人 Starter 免费空间。

1. 克隆本仓库，运行 `./scripts/install.sh`。
2. 在 Figma Desktop 中打开一个 Design 文件。
3. 选择 **Plugins → Development → Import plugin from manifest…**，导入
   `apps/figma-plugin/manifest.json`。

![Figma 配置路径：Plugins、Development、Import plugin from manifest](docs/assets/figma-import-manifest-path.png)

4. 运行 **Plugins → Development → Layntra for Figma**，保持窗口打开。
5. 新建 Codex 任务，输入：

```text
$layntra status
```

只检查、不修改：

```text
$layntra review selection
检查信息层级，以及是否缺少加载、空状态和错误状态。
不要修改 Figma。
```

计划和执行分开：

```text
$layntra plan selection
优化信息层级，保留全部文案和品牌颜色。
```

```text
$layntra apply
```

写入后 Layntra 会重新读取结果。需要立即撤销时输入 `$layntra undo`；如果执行后
Figma 目标已经改变，Layntra 会拒绝猜测要撤销哪一步。

## 为什么必须明确唤起？

普通聊天不是可靠的控制界面。`$layntra` 会把当前插件、文件、页面、选区、模式和
写入边界显示出来。只读命令永远不会修改 Figma，写入命令必须等待你的确认。

## 使用指南

- [新手入门](docs/zh-CN/getting-started.md)
- [产品经理使用手册](docs/zh-CN/product-manager-playbook.md)
- [故障排查](docs/zh-CN/troubleshooting.md)
- [从开发版迁移](docs/zh-CN/migration.md)
- [参与贡献](CONTRIBUTING.zh-CN.md)
- [安全说明](SECURITY.md)

## 架构与隐私

```text
Codex Skill → 本地 stdio/MCP Bridge → 本机 WebSocket → Figma 伴侣插件
```

Bridge 只监听 `127.0.0.1:3846`。Layntra 不需要 Figma API token、Layntra 云账号
或遥测。Codex 模型的数据处理仍由你的 Codex 配置决定；“本地 Bridge”不代表 AI
模型离线运行。

写入仅支持受约束的可编辑节点，每批最多 100 个。`v0.1.0` 不提供删除或任意代码
执行。

## 开发

```bash
npm run verify
```

架构和测试要求见 [CONTRIBUTING.zh-CN.md](CONTRIBUTING.zh-CN.md)。

## 许可证

[MIT](LICENSE)
