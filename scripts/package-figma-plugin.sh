#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
repo_root="$(cd "${script_dir}/.." && pwd -P)"
source_dir="${repo_root}/apps/figma-plugin"
output_path="${1:-${repo_root}/dist/layntra-figma-plugin.zip}"

if ! command -v zip >/dev/null 2>&1; then
  printf '%s\n' "zip is required to package the Figma companion." >&2
  exit 1
fi

case "${output_path}" in
  ""|"/")
    printf '%s\n' "Refusing an unsafe output path." >&2
    exit 1
    ;;
esac

package_root="$(mktemp -d "${TMPDIR:-/tmp}/layntra-figma-package.XXXXXX")"
cleanup() {
  rm -rf "${package_root}"
}
trap cleanup EXIT

bundle_dir="${package_root}/layntra-figma-plugin"
mkdir -p "${bundle_dir}" "$(dirname "${output_path}")"
cp \
  "${source_dir}/manifest.json" \
  "${source_dir}/code.js" \
  "${source_dir}/ui.html" \
  "${source_dir}/README-INSTALL.txt" \
  "${bundle_dir}/"

# Stable timestamps and stripped zip metadata keep repeated builds comparable.
touch -t 198001010000 "${bundle_dir}" "${bundle_dir}"/*
rm -f "${output_path}"
(
  cd "${package_root}"
  zip -X -q -r "${output_path}" layntra-figma-plugin
)

printf 'Created %s\n' "${output_path}"
