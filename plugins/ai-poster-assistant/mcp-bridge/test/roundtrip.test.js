import assert from "node:assert/strict";
import crypto from "node:crypto";
import net from "node:net";
import { spawn } from "node:child_process";
import path from "node:path";
import test from "node:test";

const bridgeDir = path.resolve(import.meta.dirname, "..");

function maskedFrame(message) {
  const payload = Buffer.from(message);
  const mask = crypto.randomBytes(4);
  const header = payload.length < 126
    ? Buffer.from([0x81, 0x80 | payload.length])
    : Buffer.from([0x81, 0x80 | 126, payload.length >> 8, payload.length & 0xff]);
  const masked = Buffer.from(payload);
  for (let index = 0; index < masked.length; index += 1) masked[index] ^= mask[index % 4];
  return Buffer.concat([header, mask, masked]);
}

function readServerFrame(buffer) {
  if (buffer.length < 2) return null;
  let length = buffer[1] & 0x7f;
  let offset = 2;
  if (length === 126) {
    if (buffer.length < 4) return null;
    length = buffer.readUInt16BE(2);
    offset = 4;
  }
  if (buffer.length < offset + length) return null;
  return {
    message: buffer.subarray(offset, offset + length).toString("utf8"),
    rest: buffer.subarray(offset + length)
  };
}

test("MCP request completes through a simulated Figma plugin", async (t) => {
  const child = spawn(process.execPath, [path.join(bridgeDir, "server.js")], {
    env: { ...process.env, AI_POSTER_PORT: "0" },
    stdio: ["pipe", "pipe", "pipe"]
  });
  t.after(() => child.kill());

  const port = await new Promise((resolve, reject) => {
    let stderr = "";
    const timeout = setTimeout(() => reject(new Error(`Bridge startup timed out: ${stderr}`)), 3_000);
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
      const match = stderr.match(/127\.0\.0\.1:(\d+)/);
      if (!match) return;
      clearTimeout(timeout);
      resolve(Number(match[1]));
    });
    child.on("error", reject);
  });

  const socket = net.connect({ host: "127.0.0.1", port });
  t.after(() => socket.destroy());
  const websocketKey = crypto.randomBytes(16).toString("base64");
  socket.write(
    `GET / HTTP/1.1\r\nHost: 127.0.0.1:${port}\r\nUpgrade: websocket\r\n` +
    `Connection: Upgrade\r\nSec-WebSocket-Key: ${websocketKey}\r\nSec-WebSocket-Version: 13\r\n\r\n`
  );

  let websocketBuffer = Buffer.alloc(0);
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("WebSocket handshake timed out")), 3_000);
    const onData = (chunk) => {
      websocketBuffer = Buffer.concat([websocketBuffer, chunk]);
      const boundary = websocketBuffer.indexOf("\r\n\r\n");
      if (boundary < 0) return;
      clearTimeout(timeout);
      socket.off("data", onData);
      assert.match(websocketBuffer.subarray(0, boundary).toString("utf8"), /101 Switching Protocols/);
      websocketBuffer = websocketBuffer.subarray(boundary + 4);
      resolve();
    };
    socket.on("data", onData);
    socket.on("error", reject);
  });

  socket.write(maskedFrame(JSON.stringify({ type: "hello", client: "ai-poster-assistant" })));

  const commandReceived = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Bridge command timed out")), 3_000);
    socket.on("data", (chunk) => {
      websocketBuffer = Buffer.concat([websocketBuffer, chunk]);
      const frame = readServerFrame(websocketBuffer);
      if (!frame) return;
      clearTimeout(timeout);
      websocketBuffer = frame.rest;
      resolve(JSON.parse(frame.message));
    });
  });

  const mcpResponse = new Promise((resolve, reject) => {
    let stdout = "";
    const timeout = setTimeout(() => reject(new Error("MCP response timed out")), 3_000);
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
      const line = stdout.split("\n").find(Boolean);
      if (!line) return;
      clearTimeout(timeout);
      resolve(JSON.parse(line));
    });
  });

  child.stdin.write(`${JSON.stringify({
    jsonrpc: "2.0",
    id: 10,
    method: "tools/call",
    params: { name: "get_document", arguments: {} }
  })}\n`);

  const command = await commandReceived;
  assert.equal(command.command, "get_document");
  socket.write(maskedFrame(JSON.stringify({
    type: "mcp-result",
    requestId: command.requestId,
    ok: true,
    data: { fileName: "Disposable E2E", currentPage: { id: "0:1", name: "Page 1" }, nodes: [] }
  })));

  const response = await mcpResponse;
  assert.equal(response.id, 10);
  const data = JSON.parse(response.result.content[0].text);
  assert.equal(data.fileName, "Disposable E2E");
  assert.deepEqual(data.nodes, []);
});
