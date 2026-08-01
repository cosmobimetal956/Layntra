import crypto from "node:crypto";
import { readFile } from "node:fs/promises";
import WebSocket from "ws";

const [command, json = "{}"] = process.argv.slice(2);
if (!command) throw new Error("Usage: node send-command.js <command> '<json arguments>'");
const args = JSON.parse(json);
if ((command === "replace_guest_photo" || command === "create_crossborder_template" || command === "place_guest_asset") && args.imagePath) {
  args.imageBase64 = (await readFile(args.imagePath)).toString("base64");
  delete args.imagePath;
}
if (command === "redesign_crossborder_cohosts" || command === "redesign_crossborder_preserve_copy") {
  args.siaBase64 = (await readFile(args.siaImagePath)).toString("base64");
  args.vickyBase64 = (await readFile(args.vickyImagePath)).toString("base64");
  delete args.siaImagePath;
  delete args.vickyImagePath;
}
const socket = new WebSocket("ws://127.0.0.1:3846");
const requestId = crypto.randomUUID();

socket.on("open", () => {
  socket.send(JSON.stringify({ type: "controller-command", requestId, command, args }));
});

socket.on("message", (raw) => {
  const message = JSON.parse(raw.toString());
  if (message.requestId !== requestId) return;
  if (!message.ok) {
    console.error(message.error);
    process.exitCode = 1;
  } else {
    console.log(JSON.stringify(message.data));
  }
  socket.close();
});

socket.on("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
