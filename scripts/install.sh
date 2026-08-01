#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "${script_dir}/.." && pwd)"

language="${LAYNTRA_LANG:-}"
if [ -z "${language}" ]; then
  locale_value="${LC_ALL:-${LC_MESSAGES:-${LANG:-en}}}"
  case "${locale_value}" in
    zh*) language="zh-CN" ;;
    *) language="en" ;;
  esac
fi

fail() {
  printf '%s\n' "$1" >&2
  exit 1
}

if ! command -v node >/dev/null 2>&1; then
  fail "Node.js 20 or later is required. / 需要 Node.js 20 或更高版本。"
fi

node_major="$(node -p 'Number(process.versions.node.split(".")[0])')"
if [ "${node_major}" -lt 20 ]; then
  fail "Node.js 20 or later is required; found $(node --version). / 需要 Node.js 20 或更高版本。"
fi

if ! command -v codex >/dev/null 2>&1; then
  fail "Codex is not installed or is not on PATH. Install or update Codex Desktop first. / 未找到 Codex，请先安装或更新 Codex Desktop。"
fi

existing_root="$(codex plugin marketplace list | awk '$1 == "layntra" { print $2 }')"
if [ -n "${existing_root}" ] && [ "${existing_root}" != "${repo_root}" ]; then
  fail "Layntra is already registered from a different repository: ${existing_root}\nExisting Codex configuration was not changed."
fi

if [ "${existing_root}" = "${repo_root}" ]; then
  marketplace_added=false
else
  codex plugin marketplace add "${repo_root}"
  marketplace_added=true
fi

codex plugin add layntra@layntra

manifest_path="${repo_root}/apps/figma-plugin/manifest.json"
if [ "${language}" = "zh-CN" ]; then
  if [ "${marketplace_added}" = true ]; then
    echo "✓ 已注册 Layntra Codex marketplace"
  else
    echo "✓ Layntra Codex marketplace 已存在"
  fi
  echo "✓ Layntra 已安装"
  echo
  echo "接下来："
  echo "1. 在 Figma Desktop 打开一个 Design 文件"
  echo "2. 选择 Plugins → Development → Import plugin from manifest…"
  echo "3. 导入 ${manifest_path}"
  echo "4. 运行 Layntra for Figma，并保持窗口打开"
  echo '5. 新建 Codex 任务并输入：$layntra status'
else
  if [ "${marketplace_added}" = true ]; then
    echo "✓ Registered the Layntra Codex marketplace"
  else
    echo "✓ Layntra Codex marketplace is already registered"
  fi
  echo "✓ Layntra is installed"
  echo
  echo "Next:"
  echo "1. Open a Design file in Figma Desktop"
  echo "2. Choose Plugins → Development → Import plugin from manifest…"
  echo "3. Import ${manifest_path}"
  echo "4. Run Layntra for Figma and keep its window open"
  echo '5. Start a new Codex task and enter: $layntra status'
fi
