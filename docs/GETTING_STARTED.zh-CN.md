# 零基础开始使用 Figma Local MCP

你不需要懂代码，也不需要购买 Figma 的 MCP 套餐。整个过程只在你的
电脑上运行。

## 先确认 Figma 空间

免费使用请选择个人 **Starter** 空间。Figma 官方允许 Starter 用户在
Figma Design 中运行插件。

如果你加入了公司组织，但只有 **Dev、Collab 或 View seat**，Figma
Design 会阻止导入插件，并显示申请 Full seat。此时不要申请付费席位，
切换到个人 Starter 空间即可。Full seat 用户也可以正常使用。

## 第一次安装

### 1. 安装 Codex 插件

在项目文件夹打开终端，运行：

```bash
./scripts/install-codex-plugin.sh
```

看到“Codex 插件已安装”就可以关闭终端。

### 2. 导入 Figma 插件

1. 打开 Figma Desktop。
2. 在个人 Starter 空间打开一个用于测试的 Design 文件。
3. 选择 **Plugins → Development → Import plugin from manifest…**。
4. 选择项目根目录中的 `manifest.json`。

这个操作只需做一次。

## 每次使用

1. 打开你想编辑的 Figma 文件。
2. 运行 **Plugins → Development → Figma Local MCP**。
3. 保持状态窗口打开。
4. 新建一个 Codex 任务。
5. 用日常语言描述你想完成的结果。

例如：

- “看看我选中的卡片，帮我把标题和正文层级整理清楚。”
- “在当前页面做一张简洁、可编辑的课程介绍卡。”
- “先不要修改，告诉我这个页面的信息结构有什么问题。”

## 连接不上怎么办

在 Codex 里说：

> 检查 Figma Local MCP 是否准备好了，并告诉我下一步。

Codex 会区分是本地桥没有启动，还是 Figma 插件没有打开，并只告诉你
当前需要做的一步。

## 隐私

设计内容通过本机 `127.0.0.1` 传递，不需要 Figma Token，也不会由这个
插件上传到第三方服务。请不要在打开敏感设计文件时同时运行不可信的
本地软件。
