# 迁移到 Layntra

Layntra 取代开发阶段的 `ai-poster-assistant` 和 `figma-local-mcp` 名称。迁移
不会修改你的 Figma 文件。

## 1. 检查旧安装

```bash
codex plugin marketplace list
codex plugin list
```

如果旧插件仍在，只删除已知的旧项目：

```bash
codex plugin remove ai-poster-assistant@figma-local-mcp
codex plugin marketplace remove figma-local-mcp
```

不要删除其他 marketplace 或插件。

## 2. 安装 Layntra

在仓库根目录运行：

```bash
./scripts/install.sh
```

在 Figma Desktop 中打开一个 Design 文件，选择 **Plugins → Development →
Import plugin from manifest…**，导入 `apps/figma-plugin/manifest.json`。然后运行
**Plugins → Development → Layntra for Figma** 并保持窗口打开。

新建 Codex 任务并输入：

```text
$layntra status
```

## 回滚

公开发布 `v0.1.0` 前，上一条通过验证的本地 Git 提交是回滚来源。切回旧提交，
重新导入旧 manifest 并安装旧 Codex 插件即可。Figma 文档数据不需要迁移。
