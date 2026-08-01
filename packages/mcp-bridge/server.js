import crypto from "node:crypto";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

const HOST = "127.0.0.1";
const PORT = Number(process.env.LAYNTRA_PORT || process.env.AI_POSTER_PORT || 3846);
const clients = new Set();
const pending = new Map();

function sendFrame(socket, payload) {
  const body = Buffer.from(payload);
  let header;
  if (body.length < 126) {
    header = Buffer.from([0x81, body.length]);
  } else if (body.length <= 0xffff) {
    header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 126;
    header.writeUInt16BE(body.length, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x81;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(body.length), 2);
  }
  socket.write(Buffer.concat([header, body]));
}

function parseFrames(state, chunk, onMessage) {
  state.buffer = Buffer.concat([state.buffer, chunk]);
  while (state.buffer.length >= 2) {
    const first = state.buffer[0];
    const masked = Boolean(state.buffer[1] & 0x80);
    let length = state.buffer[1] & 0x7f;
    let offset = 2;
    if (length === 126) {
      if (state.buffer.length < 4) return;
      length = state.buffer.readUInt16BE(2);
      offset = 4;
    } else if (length === 127) {
      if (state.buffer.length < 10) return;
      length = Number(state.buffer.readBigUInt64BE(2));
      offset = 10;
    }
    const maskLength = masked ? 4 : 0;
    if (!Number.isSafeInteger(length) || state.buffer.length < offset + maskLength + length) return;
    const mask = masked ? state.buffer.subarray(offset, offset + 4) : null;
    const payload = Buffer.from(state.buffer.subarray(offset + maskLength, offset + maskLength + length));
    state.buffer = state.buffer.subarray(offset + maskLength + length);
    if (mask) for (let index = 0; index < payload.length; index += 1) payload[index] ^= mask[index % 4];
    const opcode = first & 0x0f;
    if (opcode === 0x8) return;
    if (opcode === 0x1) onMessage(payload.toString("utf8"));
  }
}

function activePlugin() {
  const client = [...clients].find((socket) => socket.isFigmaPlugin && !socket.destroyed);
  if (!client) throw new Error("Figma companion is not connected. Open the target file and run Plugins → Development → Layntra for Figma.");
  return client;
}

function callPlugin(command, args = {}) {
  const requestId = crypto.randomUUID();
  const client = activePlugin();
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      pending.delete(requestId);
      reject(new Error("等待 Figma 插件超时。请确认插件窗口仍处于打开状态。"));
    }, 30_000);
    pending.set(requestId, { resolve, reject, timeout });
    sendFrame(client, JSON.stringify({ type: "command", requestId, command, args }));
  });
}

function handleBridgeMessage(socket, raw) {
  try {
    const message = JSON.parse(raw);
    if (message.type === "hello" && ["layntra-figma", "ai-poster-assistant"].includes(message.client)) {
      socket.isFigmaPlugin = true;
      return;
    }
    if (message.type === "controller-command") {
      callPlugin(message.command, message.args)
        .then((data) => sendFrame(socket, JSON.stringify({ requestId: message.requestId, ok: true, data })))
        .catch((error) => sendFrame(socket, JSON.stringify({ requestId: message.requestId, ok: false, error: error.message })));
      return;
    }
    if (message.type !== "mcp-result" || !pending.has(message.requestId)) return;
    const request = pending.get(message.requestId);
    clearTimeout(request.timeout);
    pending.delete(message.requestId);
    message.ok ? request.resolve(message.data) : request.reject(new Error(message.data?.error || "Figma plugin failed"));
  } catch (error) {
    console.error("Invalid bridge message", error);
  }
}

const httpServer = createServer((_request, response) => {
  response.writeHead(404).end();
});
httpServer.on("upgrade", (request, socket) => {
  const key = request.headers["sec-websocket-key"];
  if (request.headers.upgrade?.toLowerCase() !== "websocket" || typeof key !== "string") {
    socket.destroy();
    return;
  }
  const accept = crypto.createHash("sha1").update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`).digest("base64");
  socket.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`);
  const state = { buffer: Buffer.alloc(0) };
  clients.add(socket);
  socket.on("data", (chunk) => parseFrames(state, chunk, (message) => handleBridgeMessage(socket, message)));
  socket.on("close", () => clients.delete(socket));
  socket.on("error", () => clients.delete(socket));
});
httpServer.listen(PORT, HOST, () => console.error(`Layntra bridge ready. WebSocket: ws://${HOST}:${httpServer.address().port}`));

const expectedContextSchema = {
  type: "object",
  properties: {
    pageId: { type: "string" },
    selectionIds: { type: "array", items: { type: "string" }, maxItems: 100 }
  },
  required: ["pageId", "selectionIds"]
};

const tools = [
  {
    name: "get_status",
    description: "Check whether the local bridge and Figma Desktop plugin are ready. Call this first when setup is uncertain.",
    inputSchema: { type: "object", properties: {} }
  },
  { name: "get_document", description: "Inspect a bounded tree of nodes on the current Figma page.", inputSchema: { type: "object", properties: {} } },
  { name: "get_selection", description: "Inspect the currently selected Figma nodes, including bounded descendants.", inputSchema: { type: "object", properties: {} } },
  {
    name: "create_nodes",
    description: "Create up to 100 editable FRAME, RECTANGLE, or TEXT nodes in the current Figma page.",
    inputSchema: {
      type: "object",
      properties: {
        expectedContext: expectedContextSchema,
        nodes: {
          type: "array", minItems: 1, maxItems: 100,
          items: {
            type: "object",
            required: ["type"],
            properties: {
              type: { type: "string", enum: ["FRAME", "RECTANGLE", "TEXT"] },
              parentId: { type: "string" }, name: { type: "string" },
              x: { type: "number" }, y: { type: "number" },
              width: { type: "number", exclusiveMinimum: 0 }, height: { type: "number", exclusiveMinimum: 0 },
              fill: { type: "string", pattern: "^#?[0-9A-Fa-f]{6}$" }, opacity: { type: "number", minimum: 0, maximum: 1 },
              cornerRadius: { type: "number", minimum: 0 }, text: { type: "string" },
              fontSize: { type: "number", exclusiveMinimum: 0 }, color: { type: "string", pattern: "^#?[0-9A-Fa-f]{6}$" }
            }
          }
        }
      },
      required: ["nodes"]
    }
  },
  {
    name: "update_nodes",
    description: "Update common properties of up to 100 existing Figma nodes by ID. This tool does not delete nodes.",
    inputSchema: {
      type: "object",
      properties: {
        expectedContext: expectedContextSchema,
        updates: {
          type: "array", minItems: 1, maxItems: 100,
          items: {
            type: "object", required: ["id"],
            properties: {
              id: { type: "string" }, name: { type: "string" }, visible: { type: "boolean" },
              x: { type: "number" }, y: { type: "number" },
              width: { type: "number", exclusiveMinimum: 0 }, height: { type: "number", exclusiveMinimum: 0 },
              fill: { type: "string", pattern: "^#?[0-9A-Fa-f]{6}$" }, opacity: { type: "number", minimum: 0, maximum: 1 },
              text: { type: "string" }
            }
          }
        }
      },
      required: ["updates"]
    }
  },
  { name: "list_templates", description: "List editable AI event templates on the current Figma page.", inputSchema: { type: "object", properties: {} } },
  { name: "replace_guest_photo", description: "Replace every PHOTO / Replace speaker portrait frame with one local image.", inputSchema: { type: "object", properties: { imagePath: { type: "string", description: "Absolute path to a PNG, JPG, or WebP guest photo." } }, required: ["imagePath"] } },
  { name: "set_event_details", description: "Update named speaker, date, and time text layers in the active Figma page.", inputSchema: { type: "object", properties: { guestName: { type: "string" }, date: { type: "string" }, time: { type: "string" }, dateTime: { type: "string" } } } },
  { name: "create_waic_template", description: "Create an editable 1080×1920 WAIC/AI community event poster template.", inputSchema: { type: "object", properties: {} } },
  { name: "create_crossborder_template", description: "Transform TEMPLATE 05 into an editable 1080×1440 cross-border founders event poster.", inputSchema: { type: "object", properties: { imagePath: { type: "string", description: "Optional absolute path to a transparent guest PNG." } } } },
  { name: "place_guest_asset", description: "Place a transparent guest PNG as a reusable image asset card.", inputSchema: { type: "object", properties: { imagePath: { type: "string", description: "Absolute path to a transparent PNG." } }, required: ["imagePath"] } },
  { name: "redesign_crossborder_cohosts", description: "Redesign the CROSS-BORDER TALK poster for two co-hosts.", inputSchema: { type: "object", properties: { siaImagePath: { type: "string" }, vickyImagePath: { type: "string" } }, required: ["siaImagePath", "vickyImagePath"] } },
  { name: "redesign_crossborder_preserve_copy", description: "Redesign CROSS-BORDER TALK while retaining the supplied source-poster copy.", inputSchema: { type: "object", properties: { siaImagePath: { type: "string" }, vickyImagePath: { type: "string" } }, required: ["siaImagePath", "vickyImagePath"] } }
];

async function toolCall(name, args = {}) {
  if (!tools.some((tool) => tool.name === name)) throw new Error(`Unknown tool: ${name}`);
  if (name === "get_status") {
    const pluginConnected = [...clients].some((socket) => socket.isFigmaPlugin && !socket.destroyed);
    if (!pluginConnected) return {
      bridge: "ready",
      figmaPlugin: "not_connected",
      nextStep: "Open Figma Desktop, open a Design file, then run Plugins → Development → Layntra for Figma."
    };
    return {
      bridge: "ready",
      figmaPlugin: "connected",
      ...await callPlugin("get_context", {})
    };
  }
  if (name === "create_nodes" && (!Array.isArray(args.nodes) || args.nodes.length < 1 || args.nodes.length > 100)) {
    throw new Error("create_nodes requires 1–100 node specifications.");
  }
  if (name === "update_nodes" && (!Array.isArray(args.updates) || args.updates.length < 1 || args.updates.length > 100)) {
    throw new Error("update_nodes requires 1–100 updates.");
  }
  if (["replace_guest_photo", "place_guest_asset", "create_crossborder_template"].includes(name) && args.imagePath) {
    args = { ...args, imageBase64: (await readFile(args.imagePath)).toString("base64") };
    delete args.imagePath;
  }
  if (["redesign_crossborder_cohosts", "redesign_crossborder_preserve_copy"].includes(name)) {
    args = {
      siaBase64: (await readFile(args.siaImagePath)).toString("base64"),
      vickyBase64: (await readFile(args.vickyImagePath)).toString("base64")
    };
  }
  return callPlugin(name, args);
}

function reply(id, result) {
  process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id, result })}\n`);
}

let stdinBuffer = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", async (chunk) => {
  stdinBuffer += chunk;
  const lines = stdinBuffer.split("\n");
  stdinBuffer = lines.pop();
  for (const line of lines.filter(Boolean)) {
    let request;
    try {
      request = JSON.parse(line);
      if (request.method === "initialize") {
        reply(request.id, { protocolVersion: "2025-06-18", capabilities: { tools: {} }, serverInfo: { name: "layntra", version: "0.1.0" } });
      } else if (request.method === "tools/list") {
        reply(request.id, { tools });
      } else if (request.method === "tools/call") {
        const data = await toolCall(request.params.name, request.params.arguments);
        reply(request.id, { content: [{ type: "text", text: JSON.stringify(data) }] });
      }
    } catch (error) {
      reply(request?.id ?? null, { content: [{ type: "text", text: error.message }], isError: true });
    }
  }
});
