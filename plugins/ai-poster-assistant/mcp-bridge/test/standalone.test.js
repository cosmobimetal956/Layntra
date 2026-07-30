import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { cp, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

const bridgeDir = path.resolve(import.meta.dirname, "..");

test("bridge starts and answers MCP initialize without installed packages", async (t) => {
  const isolatedDir = await mkdtemp(path.join(tmpdir(), "ai-poster-bridge-"));
  const serverPath = path.join(isolatedDir, "server.mjs");
  await cp(path.join(bridgeDir, "server.js"), serverPath);

  const child = spawn(process.execPath, [serverPath], {
    env: { ...process.env, AI_POSTER_PORT: "0" },
    stdio: ["pipe", "pipe", "pipe"]
  });
  t.after(async () => {
    child.kill();
    await rm(isolatedDir, { recursive: true, force: true });
  });

  const response = await new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";
    const timeout = setTimeout(() => reject(new Error(`Timed out. stderr: ${stderr}`)), 3_000);
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
      const line = stdout.split("\n").find(Boolean);
      if (!line) return;
      clearTimeout(timeout);
      resolve(JSON.parse(line));
    });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code !== 0) {
        clearTimeout(timeout);
        reject(new Error(`Bridge exited with ${code}. stderr: ${stderr}`));
      }
    });
    child.stdin.write(`${JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "test", version: "1.0.0" } }
    })}\n`);
  });

  assert.equal(response.id, 1);
  assert.equal(response.result.serverInfo.name, "ai-poster-mcp-bridge");
  assert.ok(response.result.capabilities.tools);
});

test("bridge advertises bounded generic design tools", async (t) => {
  const child = spawn(process.execPath, [path.join(bridgeDir, "server.js")], {
    env: { ...process.env, AI_POSTER_PORT: "0" },
    stdio: ["pipe", "pipe", "pipe"]
  });
  t.after(() => child.kill());

  const response = await new Promise((resolve, reject) => {
    let stdout = "";
    const timeout = setTimeout(() => reject(new Error("Timed out waiting for tools/list")), 3_000);
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
      const line = stdout.split("\n").find(Boolean);
      if (!line) return;
      clearTimeout(timeout);
      resolve(JSON.parse(line));
    });
    child.on("error", reject);
    child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list" })}\n`);
  });

  const names = response.result.tools.map((tool) => tool.name);
  assert.deepEqual(["get_document", "get_selection", "create_nodes", "update_nodes"].filter((name) => !names.includes(name)), []);
  const createNodes = response.result.tools.find((tool) => tool.name === "create_nodes");
  assert.equal(createNodes.inputSchema.properties.nodes.maxItems, 100);
});
