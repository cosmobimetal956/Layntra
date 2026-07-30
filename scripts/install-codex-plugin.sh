#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "${script_dir}/.." && pwd)"

if ! command -v node >/dev/null 2>&1; then
  echo "未找到 Node.js。请先安装 Node.js 20 或更高版本：https://nodejs.org/" >&2
  exit 1
fi

node_major="$(node -p 'Number(process.versions.node.split(".")[0])')"
if [ "${node_major}" -lt 20 ]; then
  echo "Node.js 版本过低。当前：$(node --version)，需要 20 或更高版本。" >&2
  exit 1
fi

if ! command -v codex >/dev/null 2>&1; then
  echo "未找到 Codex 命令。请先安装或更新 Codex Desktop。" >&2
  exit 1
fi

existing_root="$(codex plugin marketplace list | awk '$1 == "figma-local-mcp" { print $2 }')"
if [ -n "${existing_root}" ] && [ "${existing_root}" != "${repo_root}" ]; then
  echo "发现同名 marketplace，但它指向另一个目录：" >&2
  echo "${existing_root}" >&2
  echo "为保护你现有的 Codex 配置，安装已停止。" >&2
  exit 1
elif [ "${existing_root}" = "${repo_root}" ]; then
  echo "✓ Figma Local MCP marketplace 已存在"
else
  codex plugin marketplace add "${repo_root}"
  echo "✓ 已添加 Figma Local MCP marketplace"
fi

codex plugin add ai-poster-assistant@figma-local-mcp

echo
echo "✓ Codex 插件已安装"
echo "接下来："
echo "1. 在 Figma Desktop 导入 ${repo_root}/manifest.json"
echo "2. 运行 Plugins → Development → Figma Local MCP"
echo "3. 新建一个 Codex 任务，然后说：检查 Figma Local MCP 是否准备好了"
