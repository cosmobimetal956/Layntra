# 故障排查

伴侣 manifest 位于 `apps/figma-plugin/manifest.json`。从 **Plugins → Development**
导入或运行，然后检查：

```text
$layntra status
```

## 伴侣插件未连接

打开目标 Design 文件，运行 **Layntra for Figma** 并保持窗口打开。如果已经打开，
先关闭再重新运行，然后新建 Codex 任务。断开状态下不要执行计划。

## 3846 端口被占用

用 `lsof -nP -iTCP:3846 -sTCP:LISTEN` 安全检查。不要自动结束未知进程。只关闭你
确认属于旧 Layntra 的 Bridge，或另开诊断会话。

## Figma 要求 Design 权限

公司的 Dev、Collab 或 View seat 可能不能运行 Design 插件。切换到个人 Starter
空间即可走免费路径。除非你确实愿意付费，不要提交可能升级席位的请求。

## 没有选区

运行 `$layntra plan selection` 前先选中目标 Frame，或者使用 `new-frame`。首版不
支持整页写入。

## 计划后上下文发生变化

页面或选区变化后，Layntra 会在写入前停止。重新运行 `$layntra status`，再次检查
并创建新的 `$layntra plan`，不要复用旧计划。

## 属性不支持或输入无效

移除不支持的内容并重新制定计划。`v0.1.0` 不提供删除或任意代码执行。

## 超时或只完成一部分

不要自动重试写入。先重新读取页面，对照实际节点和计划。如有意外变化，按
`Command + Z`。连接恢复后重新制定计划，确认无误再输入 `$layntra apply`。

如果不确定是否导入成功，重新选择 **Plugins → Development → Import plugin from
manifest…** 并导入 `apps/figma-plugin/manifest.json`。
