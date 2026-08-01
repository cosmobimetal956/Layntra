// The iframe stays hidden but remains alive as the local MCP transport.
// Launch this once after opening the Figma file; Codex then drives it through MCP.
figma.showUI(__html__, { width: 380, height: 560, visible: true, themeColors: true });

const TARGET_NAME = "PHOTO / Replace speaker portrait";
const HIDE_AFTER_REPLACE = [
  "PHOTO / Head placeholder",
  "PHOTO / Body placeholder",
  "PHOTO / Instruction"
];

function photoTargets() {
  const namedTargets = figma.currentPage
    .findAll((node) => node.name === TARGET_NAME && "fills" in node)
    .filter((node) => node.type !== "TEXT");
  if (namedTargets.length >= 2) return namedTargets;

  // Recover gracefully when a designer renamed or replaced the original
  // photo placeholder. The two template positions are deliberately fixed.
  const fallbackSpecs = [
    { template: "TEMPLATE 01 / SOCIAL 1:1 / 1080x1080", x: 350, y: 0, width: 405, height: 660 },
    { template: "TEMPLATE 02 / VERTICAL 4:5 / 1080x1350", x: 450, y: 325, width: 414, height: 591 }
  ];
  const recovered = [...namedTargets];
  for (const spec of fallbackSpecs) {
    const template = figma.currentPage.findOne((node) => node.name === spec.template);
    if (!template || !("appendChild" in template)) continue;
    const existing = template.findOne((node) => node.name === TARGET_NAME && "fills" in node);
    if (existing) {
      if (!recovered.includes(existing)) recovered.push(existing);
      continue;
    }
    const placeholder = figma.createRectangle();
    placeholder.name = TARGET_NAME;
    placeholder.resize(spec.width, spec.height);
    placeholder.x = spec.x;
    placeholder.y = spec.y;
    template.appendChild(placeholder);
    recovered.push(placeholder);
  }
  return recovered;
}

function nodesNamed(name) {
  return figma.currentPage.findAll((node) => node.name === name);
}

async function replacePhoto(bytes) {
  const image = figma.createImage(new Uint8Array(bytes));
  const targets = photoTargets();

  if (!targets.length) {
    throw new Error(
      `找不到图层“${TARGET_NAME}”。请在包含海报模板的页面运行插件。`
    );
  }

  for (const target of targets) {
    target.fills = [
      {
        type: "IMAGE",
        scaleMode: "FILL",
        imageHash: image.hash
      }
    ];

    // Only hide placeholder artwork within the same template frame.
    let ancestor = target.parent;
    while (ancestor && ancestor.type !== "PAGE") {
      const placeholders = ancestor.findAll(
        (node) => HIDE_AFTER_REPLACE.includes(node.name)
      );
      placeholders.forEach((node) => {
        if (node.id !== target.id) node.visible = false;
      });
      ancestor = ancestor.parent;
    }
  }

  return targets.length;
}

async function setText(name, value) {
  if (!value || !value.trim()) return 0;
  const targets = nodesNamed(name).filter((node) => node.type === "TEXT");
  for (const text of targets) {
    const segments = text.getStyledTextSegments(["fontName"]);
    const fonts = new Map(
      segments.map((segment) => [
        `${segment.fontName.family}::${segment.fontName.style}`,
        segment.fontName
      ])
    );
    await Promise.all([...fonts.values()].map((font) => figma.loadFontAsync(font)));
    text.characters = value.trim();
  }
  return targets.length;
}

async function applyDetails({ guestName, date, time, dateTime }) {
  const changed = await Promise.all([
    setText("TEXT / Speaker", guestName),
    setText("TEXT / Date", date),
    setText("TEXT / Date time", dateTime),
    setText("TEXT / Time", time)
  ]);
  return changed.reduce((sum, value) => sum + value, 0);
}

function listTemplates() {
  return figma.currentPage.children
    .filter((node) => node.name.startsWith("TEMPLATE"))
    .map((node) => ({ id: node.id, name: node.name, width: node.width, height: node.height }));
}

function solid(hex, opacity = 1) {
  const value = hex.replace("#", "");
  return {
    type: "SOLID",
    color: {
      r: parseInt(value.slice(0, 2), 16) / 255,
      g: parseInt(value.slice(2, 4), 16) / 255,
      b: parseInt(value.slice(4, 6), 16) / 255
    },
    opacity
  };
}

async function createWaicPoster() {
  const templateName = "TEMPLATE 05 / WAIC TALK / 1080x1920";
  if (figma.currentPage.findOne((node) => node.name === templateName)) {
    throw new Error("WAIC 海报模板已经存在；为避免覆盖现有设计，没有重复创建。");
  }

  await Promise.all([
    figma.loadFontAsync({ family: "Inter", style: "Regular" }),
    figma.loadFontAsync({ family: "Inter", style: "Bold" })
  ]);
  const pageRight = figma.currentPage.children.reduce((right, node) => Math.max(right, node.x + node.width), 0);
  const created = [];
  const frame = figma.createFrame();
  frame.name = templateName;
  frame.resize(1080, 1920);
  frame.x = pageRight + 220;
  frame.y = 220;
  frame.clipsContent = true;
  frame.fills = [solid("#020816")];
  figma.currentPage.appendChild(frame);
  created.push(frame.id);

  const rect = (name, x, y, width, height, fill, radius = 0, opacity = 1) => {
    const node = figma.createRectangle();
    node.name = name;
    node.resize(width, height);
    node.x = x; node.y = y;
    node.cornerRadius = radius;
    node.opacity = opacity;
    node.fills = [solid(fill)];
    frame.appendChild(node);
    created.push(node.id);
    return node;
  };
  const ellipse = (name, x, y, diameter, fill, stroke = "#7C5CFF") => {
    const node = figma.createEllipse();
    node.name = name;
    node.resize(diameter, diameter);
    node.x = x; node.y = y;
    node.fills = [solid(fill)];
    node.strokes = [solid(stroke)];
    node.strokeWeight = 4;
    frame.appendChild(node);
    created.push(node.id);
    return node;
  };
  const text = (name, value, x, y, width, size, color = "#FFFFFF", style = "Regular", align = "LEFT") => {
    const node = figma.createText();
    node.name = name;
    node.fontName = { family: "Inter", style };
    node.characters = value;
    node.fontSize = size;
    node.fills = [solid(color)];
    node.textAlignHorizontal = align;
    node.resize(width, Math.max(size * 1.45, node.height));
    node.x = x; node.y = y;
    frame.appendChild(node);
    created.push(node.id);
    return node;
  };

  // Editable navy tech backdrop.
  rect("BG / Electric blue glow", -60, -80, 1200, 510, "#0756E8", 0, 0.82);
  rect("BG / Shadow wash", 0, 335, 1080, 1000, "#020712", 0, 0.74);
  for (let i = 0; i < 7; i++) {
    const arc = ellipse(`BG / Orbit ${i + 1}`, 100 + i * 57, 620 + i * 20, 560 - i * 50, "#020816", "#0B58D8");
    arc.opacity = 0.22;
  }
  rect("BG / Bottom blue glow", 80, 1320, 920, 280, "#0639AF", 48, 0.50);

  // Header / sponsor strip.
  text("TEXT / Brand mark", "MΞ", 342, 92, 396, 180, "#FFFFFF", "Bold", "CENTER");
  rect("BAR / Partners", 64, 250, 952, 44, "#07398A", 14, 0.92);
  text("TEXT / Partners label", "支持机构", 84, 264, 105, 18, "#CBE2FF", "Regular");
  text("TEXT / Partners", "COPILOT   ·   GenOptima   ·   DeepLumen   ·   AI PEOPLE", 188, 262, 792, 19, "#70E6FF", "Bold");

  rect("PILL / Series", 64, 342, 240, 48, "#0647AF", 15);
  text("TEXT / Series", "AMA 预告  🔥", 83, 353, 205, 24, "#A8D5FF", "Regular");
  text("TEXT / Main title", "WAIC 2026 观察与分\n享：华语 AI 的拐点时刻", 64, 432, 950, 60, "#FFFFFF", "Bold");
  const datePill = rect("PILL / Date time", 64, 606, 952, 58, "#146DFA", 18);
  text("TEXT / Date time", "◷  Time:   2026 年 7 月 21 日 21:00 (UTC+8)", 88, 620, 900, 27, "#FFFFFF", "Bold");

  // Hosts row: editable identity/photo circles and labels.
  rect("PILL / Hosts", 380, 727, 320, 50, "#146DFA", 15);
  text("TEXT / Hosts", "🎙 主办方", 410, 739, 260, 25, "#FFFFFF", "Bold", "CENTER");
  const hosts = [
    ["PHOTO / Host 01", "ME NEWS", "@MetaFarCN", 295, "#31E2C8"],
    ["PHOTO / Host 02", "AgentOn", "@AgentON", 507, "#D9F63D"]
  ];
  hosts.forEach(([photoName, label, handle, x, color]) => {
    ellipse(photoName, x, 792, 150, color);
    text(`TEXT / ${label}`, label, x - 25, 958, 200, 26, "#FFFFFF", "Bold", "CENTER");
    text(`TEXT / ${label} handle`, `𝕏 ${handle}`, x - 25, 990, 200, 16, "#A9D0FF", "Regular", "CENTER");
  });
  text("TEXT / Robot cue", "AI", 820, 840, 140, 72, "#9CEBFF", "Bold", "CENTER");
  text("TEXT / Robot cue note", "AI AGENT", 790, 924, 200, 17, "#7BC1FF", "Bold", "CENTER");

  // Speaker panel; each speaker is intentionally individual and editable.
  rect("PANEL / Guests", 44, 1040, 992, 480, "#0644BE", 22, 0.94);
  text("TEXT / Guest section", "🎙 主持人     ♟ 特邀嘉宾", 76, 1066, 820, 29, "#D9ECFF", "Bold");
  const guests = [
    ["Enid", "CBO"], ["Jessica Young", "Founder & CEO"], ["Vito", "Co-CEO"], ["Cyber Yang", "Founder"],
    ["Joyism", "DeepLumen"], ["Eric Zheng", "North America"], ["Robin Luo", "AI Agent"], ["Will Sun", "Co-Founder"],
    ["Jack", "Founder"]
  ];
  guests.forEach(([name, role], index) => {
    const col = index % 4;
    const row = Math.floor(index / 4);
    const x = 92 + col * 230;
    const y = 1130 + row * 142;
    ellipse(`PHOTO / Guest ${String(index + 1).padStart(2, "0")}`, x, y, 90, ["#5F3FAA", "#0D719E", "#5B657D", "#245F58"][col]);
    text(`TEXT / Guest ${index + 1} name`, name, x - 30, y + 100, 150, 18, "#FFFFFF", "Bold", "CENTER");
    text(`TEXT / Guest ${index + 1} role`, role, x - 30, y + 123, 150, 13, "#BFD8FF", "Regular", "CENTER");
  });

  // Topic cards.
  rect("PILL / Topics", 44, 1564, 230, 48, "#146DFA", 15);
  text("TEXT / Topics", "⌁ 热点话题：", 65, 1575, 200, 22, "#FFFFFF", "Bold");
  const topics = [
    "本届 WAIC 参与后，最令你印象深刻的一个点是什么？",
    "从展览现场看，有哪些产品让你觉得 AI 真正落地？",
    "除了主论坛，今年有哪些交流活动值得分享？",
    "结合这几天观察，你认为下一个 AI 机会在哪里？",
    "相比其他海外 AI 行业活动，WAIC 最大的变化是什么？"
  ];
  topics.forEach((topic, index) => {
    const y = 1632 + index * 60;
    rect(`CARD / Topic ${index + 1}`, 44, y, 992, 52, "#051B48", 15, 0.96);
    text(`TEXT / Topic ${index + 1}`, `${index + 1}.  ${topic}`, 82, y + 13, 900, 16, "#E7F2FF", "Regular");
  });
  text("NOTE / Editable poster", "所有标题、时间、嘉宾、话题和色块均可编辑", 64, 1880, 700, 14, "#6EA5E9", "Regular");
  return { templateId: frame.id, createdNodeIds: created };
}

async function createCrossBorderPoster(imageBase64) {
  const oldName = "TEMPLATE 05 / WAIC TALK / 1080x1920";
  const newName = "TEMPLATE 05 / CROSS-BORDER TALK / 1080x1440";
  let frame = figma.currentPage.findOne((node) => node.name === oldName || node.name === newName);
  if (!frame) {
    for (const page of figma.root.children) {
      if (page.id === figma.currentPage.id) continue;
      await figma.setCurrentPageAsync(page);
      frame = figma.currentPage.findOne((node) => node.name === oldName || node.name === newName);
      if (frame) break;
    }
  }
  if (!frame || frame.type !== "FRAME") {
    throw new Error("找不到 TEMPLATE 05。请先创建 WAIC 模板，或在包含模板的工作台页面运行插件。");
  }
  await Promise.all([
    figma.loadFontAsync({ family: "Inter", style: "Regular" }),
    figma.loadFontAsync({ family: "Inter", style: "Bold" })
  ]);
  [...frame.children].forEach((node) => node.remove());
  frame.name = newName;
  frame.resize(1080, 1440);
  frame.clipsContent = true;
  frame.fills = [solid("#942C1B")];
  const created = [frame.id];
  const rect = (name, x, y, w, h, fill, radius = 0, opacity = 1) => {
    const node = figma.createRectangle();
    node.name = name; node.resize(w, h); node.x = x; node.y = y;
    node.fills = [solid(fill)]; node.cornerRadius = radius; node.opacity = opacity;
    frame.appendChild(node); created.push(node.id); return node;
  };
  const ellipse = (name, x, y, d, fill) => {
    const node = figma.createEllipse();
    node.name = name; node.resize(d, d); node.x = x; node.y = y; node.fills = [solid(fill)];
    frame.appendChild(node); created.push(node.id); return node;
  };
  const text = (name, value, x, y, width, size, color = "#FFF8E9", style = "Regular", align = "LEFT") => {
    const node = figma.createText();
    node.name = name; node.fontName = { family: "Inter", style }; node.characters = value;
    node.fontSize = size; node.fills = [solid(color)]; node.textAlignHorizontal = align;
    node.resize(width, Math.max(size * 1.45, node.height)); node.x = x; node.y = y;
    frame.appendChild(node); created.push(node.id); return node;
  };

  // Background grid and identity marks, all editable.
  rect("BG / Brick red", 0, 0, 1080, 1440, "#972E1C");
  rect("BG / Lower shade", 0, 1040, 1080, 400, "#090B0E");
  [270, 610, 850, 1080].forEach((y) => rect(`GRID / Horizontal ${y}`, 0, y, 1080, 2, "#D97855", 0, 0.45));
  rect("LOGO / Mark", 80, 66, 54, 54, "#FFF8E9", 14);
  text("TEXT / Brand", "AI\nCOMMUNITY", 148, 64, 210, 37, "#FFF8E9", "Bold");
  text("TEXT / Series", "CROSS-\nBORDER\nTALK ))", 834, 62, 180, 28, "#FFF8E9", "Bold", "RIGHT");
  ellipse("DECOR / Dot 01", 690, 220, 36, "#2D6F4D");
  ellipse("DECOR / Dot 02", 924, 493, 34, "#2D6F4D");

  text("TEXT / Main title", "跨境出海实战\n创业者闭门交流会", 78, 324, 650, 60, "#FFF8E9", "Bold");
  text("TEXT / Subtitle", "亿级操盘实战 · 选品投放 · 团队管理 · 行业趋势深度拆解", 80, 515, 840, 24, "#FFF8E9", "Bold");
  text("TEXT / Description", "聚焦跨境电商平台：Amazon、TK、独立站，等主流电商平台", 80, 558, 830, 22, "#FFE6D3", "Regular");

  text("TEXT / Date", "SUNDAY\n26 Jul. 2026", 80, 660, 250, 27, "#FFF8E9", "Regular");
  text("TEXT / Time", "14:00 — 17:00\nSHANGHAI", 405, 660, 330, 27, "#FFF8E9", "Regular");
  text("TEXT / Organizer", "CO-ORGANIZER\nSIIA", 80, 820, 270, 23, "#FFF8E9", "Regular");
  text("TEXT / Capacity", "LIMITATION\n15–20人", 405, 820, 250, 23, "#FFF8E9", "Regular");

  // Person is a replaceable image layer, populated from the local cutout.
  const portrait = rect("PHOTO / Guest portrait", 545, 400, 535, 640, "#702317");
  if (imageBase64) {
    const image = figma.createImage(Uint8Array.from(atob(imageBase64), (char) => char.charCodeAt(0)));
    portrait.fills = [{ type: "IMAGE", scaleMode: "FILL", imageHash: image.hash }];
  }
  text("NOTE / Portrait", "替换此图层即可更新嘉宾照片", 598, 1002, 420, 14, "#F4B89B", "Regular", "RIGHT");

  ellipse("CARD / Host", 68, 926, 232, "#181B1F");
  text("TEXT / Host label", "Host", 94, 1022, 150, 25, "#FFD638", "Bold");
  text("TEXT / Host name", "Vicky", 94, 1060, 180, 48, "#FFFFFF", "Bold");
  rect("CARD / Speaker experience", 245, 1056, 422, 96, "#FFCC36", 19);
  text("TEXT / Speaker experience", "跨境出海品牌创业者\n亿级跨境出海项目实战经验", 270, 1080, 370, 22, "#3B2507", "Bold");

  text("TEXT / Register URL", "AICommunity.com", 80, 1227, 300, 25, "#FFFFFF", "Regular");
  text("TEXT / CTA", "RESERVE A SEAT  →", 80, 1272, 360, 30, "#FFFFFF", "Bold");
  rect("QR / Editable placeholder", 468, 1216, 126, 126, "#FFFFFF", 4);
  for (let row = 0; row < 7; row++) for (let col = 0; col < 7; col++) {
    if ((row * 3 + col * 5) % 4 !== 0) rect(`QR / Pixel ${row}-${col}`, 482 + col * 15, 1230 + row * 15, 10, 10, "#0D0E11", 0);
  }
  text("TEXT / Footer", "AI Workshops · Talks · Demos · Community", 80, 1370, 900, 25, "#FFFFFF", "Regular");
  return { templateId: frame.id, createdNodeIds: created };
}

async function placeGuestAsset(imageBase64) {
  if (!imageBase64) throw new Error("缺少透明 PNG 数据。");
  await Promise.all([
    figma.loadFontAsync({ family: "Inter", style: "Regular" }),
    figma.loadFontAsync({ family: "Inter", style: "Bold" })
  ]);
  const image = figma.createImage(Uint8Array.from(atob(imageBase64), (char) => char.charCodeAt(0)));
  const existing = figma.currentPage.findOne((node) => node.name === "ASSET / GUEST / SUNGLASSES CUTOUT");
  if (existing) existing.remove();
  const right = figma.currentPage.children.reduce((max, node) => Math.max(max, node.x + node.width), 0);
  const card = figma.createFrame();
  card.name = "ASSET / GUEST / SUNGLASSES CUTOUT";
  card.resize(440, 820);
  card.x = right + 200; card.y = 220;
  card.fills = [solid("#111722")];
  card.cornerRadius = 18;
  card.clipsContent = true;
  figma.currentPage.appendChild(card);
  const label = figma.createText();
  label.name = "TEXT / Asset label";
  label.fontName = { family: "Inter", style: "Bold" };
  label.characters = "GUEST CUTOUT / 02";
  label.fontSize = 20;
  label.fills = [solid("#FFFFFF")];
  label.resize(360, 30); label.x = 28; label.y = 26;
  card.appendChild(label);
  const note = figma.createText();
  note.name = "TEXT / Asset note";
  note.fontName = { family: "Inter", style: "Regular" };
  note.characters = "透明背景 · 可复制至任意模板";
  note.fontSize = 14;
  note.fills = [solid("#A9BDD7")];
  note.resize(360, 24); note.x = 28; note.y = 58;
  card.appendChild(note);
  const portrait = figma.createRectangle();
  portrait.name = "PHOTO / Guest sunglasses cutout";
  portrait.resize(390, 690); portrait.x = 25; portrait.y = 108;
  portrait.fills = [{ type: "IMAGE", scaleMode: "FIT", imageHash: image.hash }];
  card.appendChild(portrait);
  return { assetFrameId: card.id, createdNodeIds: [card.id, label.id, note.id, portrait.id] };
}

async function redesignCrossBorderCohosts(siaBase64, vickyBase64) {
  const templateName = "TEMPLATE 05 / CROSS-BORDER TALK / 1080x1440";
  let frame = figma.currentPage.findOne((node) => node.name === templateName);
  if (!frame) {
    for (const page of figma.root.children) {
      if (page.id === figma.currentPage.id) continue;
      await figma.setCurrentPageAsync(page);
      frame = figma.currentPage.findOne((node) => node.name === templateName);
      if (frame) break;
    }
  }
  if (!frame || frame.type !== "FRAME") throw new Error("找不到 CROSS-BORDER TALK 模板。");
  if (!siaBase64 || !vickyBase64) throw new Error("需要两张 Co-host 透明人物图。");
  await Promise.all([
    figma.loadFontAsync({ family: "Inter", style: "Regular" }),
    figma.loadFontAsync({ family: "Inter", style: "Bold" })
  ]);
  const siaImage = figma.createImage(Uint8Array.from(atob(siaBase64), (char) => char.charCodeAt(0)));
  const vickyImage = figma.createImage(Uint8Array.from(atob(vickyBase64), (char) => char.charCodeAt(0)));
  [...frame.children].forEach((node) => node.remove());
  frame.fills = [solid("#742719")];
  frame.clipsContent = true;
  const ids = [frame.id];
  const rect = (name, x, y, w, h, hex, radius = 0, opacity = 1) => {
    const node = figma.createRectangle(); node.name = name; node.resize(w, h); node.x = x; node.y = y;
    node.fills = [solid(hex)]; node.cornerRadius = radius; node.opacity = opacity; frame.appendChild(node); ids.push(node.id); return node;
  };
  const text = (name, value, x, y, w, size, hex = "#FFF7ED", style = "Regular", align = "LEFT") => {
    const node = figma.createText(); node.name = name; node.fontName = { family: "Inter", style }; node.characters = value;
    node.fontSize = size; node.fills = [solid(hex)]; node.textAlignHorizontal = align;
    node.resize(w, Math.max(size * 1.45, node.height)); node.x = x; node.y = y; frame.appendChild(node); ids.push(node.id); return node;
  };
  const line = (name, y) => rect(name, 64, y, 952, 2, "#E47757", 0, 0.58);
  rect("BG / Deep brick", 0, 0, 1080, 1440, "#7B291A");
  rect("BG / Side glow", 730, 0, 350, 1440, "#9B3721", 0, 0.50);
  line("GRID / 01", 230); line("GRID / 02", 580); line("GRID / 03", 1010);
  rect("LOGO / Abstract mark", 66, 60, 54, 54, "#FFF7ED", 15);
  text("TEXT / Brand", "AI PEOPLE\nCLUB", 138, 58, 225, 31, "#FFF7ED", "Bold");
  text("TEXT / Series", "CROSS-BORDER\nFOUNDERS TALK ))", 753, 60, 260, 24, "#FFF7ED", "Bold", "RIGHT");
  text("TEXT / Eyebrow", "CO-HOSTED SESSION / 01", 68, 272, 460, 18, "#FFCD44", "Bold");
  text("TEXT / Main title", "跨境出海实战\n创业者闭门交流会", 64, 314, 720, 59, "#FFF7ED", "Bold");
  text("TEXT / Subtitle", "选品投放 · 团队管理 · 市场判断 · 增长策略", 68, 485, 750, 23, "#FFE3CF", "Regular");
  rect("PILL / Date", 68, 535, 450, 45, "#BE492B", 14);
  text("TEXT / Date time", "SUN 26 JUL · 14:00–17:00 · SHANGHAI", 91, 547, 405, 17, "#FFFFFF", "Bold");

  // Two independent transparent-image layers, designed as an asymmetric conversation pair.
  const sia = rect("PHOTO / Co-host SIA", 58, 640, 402, 535, "#682217", 0);
  sia.fills = [{ type: "IMAGE", scaleMode: "FIT", imageHash: siaImage.hash }];
  const vicky = rect("PHOTO / Co-host Vicky", 500, 570, 520, 670, "#8A2F1D", 0);
  vicky.fills = [{ type: "IMAGE", scaleMode: "FIT", imageHash: vickyImage.hash }];
  rect("TAG / SIA", 78, 1080, 255, 76, "#171A1E", 18);
  text("TEXT / Co-host 01 role", "CO-HOST", 100, 1094, 120, 14, "#FFCF3C", "Bold");
  text("TEXT / Co-host 01 name", "SIA", 99, 1113, 190, 31, "#FFFFFF", "Bold");
  rect("TAG / Vicky", 670, 1138, 290, 76, "#FFCB36", 18);
  text("TEXT / Co-host 02 role", "CO-HOST", 694, 1151, 130, 14, "#4A2D0B", "Bold");
  text("TEXT / Co-host 02 name", "Vicky", 694, 1171, 180, 31, "#302009", "Bold");
  text("TEXT / SIA bio", "跨境出海增长顾问\n品牌与社区运营", 74, 1198, 300, 18, "#FFE0D1", "Regular");
  text("TEXT / Vicky bio", "跨境品牌创业者\n亿级项目实战经验", 677, 1254, 270, 18, "#FFE0D1", "Regular");
  rect("BAR / Footer", 0, 1330, 1080, 110, "#090B0E");
  text("TEXT / CTA", "RESERVE A SEAT  →", 68, 1355, 430, 29, "#FFFFFF", "Bold");
  text("TEXT / Footer info", "AI Workshops · Talks · Demos · Community", 68, 1393, 860, 19, "#E4D3CB", "Regular");
  return { templateId: frame.id, createdNodeIds: ids };
}

async function redesignCrossBorderPreserveCopy(siaBase64, vickyBase64) {
  const templateName = "TEMPLATE 05 / CROSS-BORDER TALK / 1080x1440";
  let frame = figma.currentPage.findOne((node) => node.name === templateName);
  if (!frame) {
    for (const page of figma.root.children) {
      if (page.id === figma.currentPage.id) continue;
      await figma.setCurrentPageAsync(page);
      frame = figma.currentPage.findOne((node) => node.name === templateName);
      if (frame) break;
    }
  }
  if (!frame || frame.type !== "FRAME") throw new Error("找不到 CROSS-BORDER TALK 模板。");
  if (!siaBase64 || !vickyBase64) throw new Error("需要 SIA 与 Vicky 两张透明人物图。");
  await Promise.all([
    figma.loadFontAsync({ family: "Inter", style: "Regular" }),
    figma.loadFontAsync({ family: "Inter", style: "Bold" })
  ]);
  const siaImage = figma.createImage(Uint8Array.from(atob(siaBase64), (char) => char.charCodeAt(0)));
  const vickyImage = figma.createImage(Uint8Array.from(atob(vickyBase64), (char) => char.charCodeAt(0)));
  [...frame.children].forEach((node) => node.remove());
  frame.fills = [solid("#982D1B")]; frame.clipsContent = true;
  const ids = [frame.id];
  const rect = (name, x, y, w, h, hex, radius = 0, opacity = 1) => {
    const node = figma.createRectangle(); node.name = name; node.resize(w, h); node.x = x; node.y = y;
    node.fills = [solid(hex)]; node.cornerRadius = radius; node.opacity = opacity; frame.appendChild(node); ids.push(node.id); return node;
  };
  const text = (name, value, x, y, w, size, hex = "#FFF8EC", style = "Regular", align = "LEFT") => {
    const node = figma.createText(); node.name = name; node.fontName = { family: "Inter", style }; node.characters = value;
    node.fontSize = size; node.fills = [solid(hex)]; node.textAlignHorizontal = align;
    node.resize(w, Math.max(size * 1.45, node.height)); node.x = x; node.y = y; frame.appendChild(node); ids.push(node.id); return node;
  };
  const divider = (name, y) => rect(name, 0, y, 1080, 2, "#D57452", 0, 0.6);

  // Exact source copy preserved as editable text layers.
  rect("BG / Brick red", 0, 0, 1080, 1440, "#982D1B");
  divider("GRID / Header", 270); divider("GRID / Details", 620); divider("GRID / Hosts", 905); divider("GRID / Footer", 1215);
  rect("LOGO / H mark", 70, 64, 55, 55, "#FFF8EC", 15);
  text("TEXT / Brand", "Hurdle\nClub", 142, 64, 230, 34, "#FFF8EC", "Bold");
  text("TEXT / Series", "Cross-\nBorder\nTALK ))", 806, 60, 210, 28, "#FFF8EC", "Bold", "RIGHT");
  rect("DECOR / Green dot 01", 685, 212, 34, 34, "#2D6F4D", 17);
  rect("DECOR / Green dot 02", 936, 514, 34, 34, "#2D6F4D", 17);
  text("TEXT / Main title", "跨境出海实战\n创业者闭门交流会", 75, 320, 650, 58, "#FFF8EC", "Bold");
  text("TEXT / Subtitle", "亿级操盘实战 · 选品投放 · 团队管理 · 行业趋势深度拆解", 78, 495, 800, 23, "#FFF8EC", "Bold");
  text("TEXT / Description", "聚焦跨境电商平台：Amazon、TK、独立站、等主流电商平台", 78, 536, 825, 22, "#FFE5D3", "Regular");
  text("TEXT / Date", "SUNDAY\n26 Jul. 2026", 78, 673, 245, 26, "#FFF8EC", "Regular");
  text("TEXT / Time", "14:00 — 17:00\nSHANGHAI", 405, 673, 260, 26, "#FFF8EC", "Regular");
  text("TEXT / Co-organizer", "CO-ORGANIZER\nSIIA", 78, 835, 280, 22, "#FFF8EC", "Regular");
  text("TEXT / Capacity", "LIMITATION\n15–20人", 405, 835, 260, 22, "#FFF8EC", "Regular");

  // Vicky is the primary host as in the supplied layout; SIA becomes the secondary co-host without removing copy.
  const vicky = rect("PHOTO / Co-host Vicky", 605, 420, 475, 800, "#862816");
  vicky.fills = [{ type: "IMAGE", scaleMode: "FIT", imageHash: vickyImage.hash }];
  const sia = rect("PHOTO / Co-host SIA", 330, 910, 270, 310, "#7E2517");
  sia.fills = [{ type: "IMAGE", scaleMode: "FIT", imageHash: siaImage.hash }];
  rect("CARD / Host Vicky", 65, 950, 240, 218, "#191B1F", 120);
  text("TEXT / Vicky role", "Host", 94, 1038, 160, 24, "#FFCF3D", "Bold");
  text("TEXT / Vicky name", "Vicky", 94, 1071, 190, 43, "#FFFFFF", "Bold");
  rect("CARD / Vicky experience", 245, 1080, 405, 92, "#FFD03A", 18);
  text("TEXT / Vicky experience", "跨境出海品牌创业者\n亿级跨境出海项目实战经验", 270, 1101, 360, 20, "#3D2708", "Bold");
  rect("CARD / Co-host SIA", 500, 1012, 175, 70, "#6D2014", 16);
  text("TEXT / SIA role", "Co-host", 518, 1026, 130, 15, "#FFD03A", "Bold");
  text("TEXT / SIA name", "SIA", 518, 1045, 120, 24, "#FFFFFF", "Bold");
  text("TEXT / SIA note", "跨境增长与社群运营", 500, 1180, 260, 15, "#FFE5D3", "Regular");

  rect("BAR / Footer", 0, 1215, 1080, 225, "#090B0E");
  text("TEXT / Register URL", "HurdleClub.com", 78, 1255, 330, 23, "#FFFFFF", "Regular");
  text("TEXT / CTA", "RESERVE A SEAT  →", 78, 1294, 380, 28, "#FFFFFF", "Bold");
  const qr = rect("QR / Editable placeholder", 485, 1244, 120, 120, "#FFFFFF", 3);
  for (let row = 0; row < 7; row++) for (let col = 0; col < 7; col++) if ((row * 3 + col * 5) % 4 !== 0) rect(`QR / Pixel ${row}-${col}`, 498 + col * 14, 1257 + row * 14, 9, 9, "#0D0F12", 0);
  text("TEXT / Footer", "AI Workshops · Talks · Demos · Community", 78, 1390, 870, 22, "#FFFFFF", "Regular");
  return { templateId: frame.id, createdNodeIds: ids, preservedCopy: true };
}

async function createAug1AgentWorkshopPoster() {
  const templateName = "TEMPLATE / HURDLE AUG 01 AGENT WORKSHOP / 1080x1440";
  await Promise.all([
    figma.loadFontAsync({ family: "Inter", style: "Regular" }),
    figma.loadFontAsync({ family: "Inter", style: "Bold" })
  ]);

  let frame = figma.currentPage.findOne(
    (node) =>
      node.name === templateName ||
      node.name === "Hurdle Club｜8月1日 Agent 招募海报"
  );
  if (frame && frame.type !== "FRAME") {
    throw new Error("发现同名图层，但它不是画板。请先重命名该图层。");
  }

  if (!frame) {
    const pageRight = figma.currentPage.children.reduce(
      (right, node) => Math.max(right, node.x + node.width),
      0
    );
    frame = figma.createFrame();
    frame.x = pageRight + 220;
    frame.y = 220;
    figma.currentPage.appendChild(frame);
  } else {
    [...frame.children].forEach((node) => node.remove());
  }

  frame.name = templateName;
  frame.resize(1080, 1440);
  frame.clipsContent = true;
  frame.fills = [solid("#F8F5EF")];

  const ids = [frame.id];
  const rect = (name, x, y, w, h, fill, radius = 0, stroke = null, opacity = 1) => {
    const node = figma.createRectangle();
    node.name = name;
    node.resize(w, h);
    node.x = x;
    node.y = y;
    node.cornerRadius = radius;
    node.opacity = opacity;
    node.fills = [solid(fill)];
    if (stroke) {
      node.strokes = [solid(stroke)];
      node.strokeWeight = 1;
    }
    frame.appendChild(node);
    ids.push(node.id);
    return node;
  };
  const ellipse = (name, x, y, d, fill, stroke = null) => {
    const node = figma.createEllipse();
    node.name = name;
    node.resize(d, d);
    node.x = x;
    node.y = y;
    node.fills = [solid(fill)];
    if (stroke) {
      node.strokes = [solid(stroke)];
      node.strokeWeight = 1;
    }
    frame.appendChild(node);
    ids.push(node.id);
    return node;
  };
  const text = (
    name,
    value,
    x,
    y,
    w,
    h,
    size,
    color = "#171714",
    style = "Regular",
    align = "LEFT",
    lineHeight = null
  ) => {
    const node = figma.createText();
    node.name = name;
    node.fontName = { family: "Inter", style };
    node.characters = value;
    node.fontSize = size;
    node.lineHeight = { unit: "PIXELS", value: lineHeight || Math.round(size * 1.25) };
    node.fills = [solid(color)];
    node.textAlignHorizontal = align;
    node.resize(w, h);
    node.x = x;
    node.y = y;
    frame.appendChild(node);
    ids.push(node.id);
    return node;
  };

  const ink = "#171714";
  const muted = "#6B675E";
  const beige = "#D9D1C3";
  const paper = "#FBF9F4";
  const accent = "#8A7655";

  // Brand header.
  rect("LOGO / Hurdle left", 56, 56, 10, 36, ink, 5);
  rect("LOGO / Hurdle right", 72, 56, 10, 36, ink, 5);
  const bridge = rect("LOGO / Hurdle bridge", 63, 69, 18, 8, ink, 3);
  bridge.rotation = -18;
  text("TEXT / Brand", "Hurdle Club", 100, 57, 300, 38, 25, ink, "Bold");
  rect("PILL / Event", 790, 53, 234, 42, paper, 21, beige);
  text("TEXT / Event pill", "8月1日 · AGENT WORKSHOP", 802, 64, 210, 22, 15, ink, "Bold", "CENTER");

  // Hero.
  text("TEXT / Kicker", "AI AGENT PRACTICE WORKSHOP", 56, 150, 560, 26, 16, accent, "Bold");
  text("TEXT / Main title", "搭建自己的\n第一个 Agent", 54, 190, 850, 174, 72, ink, "Bold", "LEFT", 78);
  text(
    "TEXT / Lead",
    "从一个真实任务出发，完成你的第一个可用 AI Agent",
    57,
    385,
    900,
    36,
    24,
    ink,
    "Bold"
  );

  // Date and format card.
  rect("CARD / Event information", 56, 448, 968, 126, paper, 18, beige);
  text("TEXT / Date", "8月1日（周六）", 86, 481, 270, 36, 28, ink, "Bold");
  text("TEXT / Format", "线下 Workshop｜线上同步", 86, 525, 280, 25, 17, muted, "Regular");
  rect("DIVIDER / Event information", 390, 473, 1, 76, beige);
  text("TEXT / Promise", "带着一个真实问题来，现场把它搭出来", 424, 484, 530, 30, 21, ink, "Bold");
  text("TEXT / Notice", "具体时间、地点及线上链接将在报名后通知", 424, 524, 530, 24, 15, muted, "Regular");

  // Workshop steps.
  rect("PANEL / Workshop steps", 56, 598, 493, 420, paper, 20, beige);
  text("TEXT / Steps heading", "现场会完成", 86, 632, 300, 32, 25, ink, "Bold");
  const steps = [
    ["01", "找到一个值得交给 AI 的任务", "从工作、创作或个人业务的真实场景出发"],
    ["02", "拆解 Agent 的目标与执行步骤", "明确输入、判断、行动与交付结果"],
    ["03", "连接资料、提示词与工作流程", "让 Agent 能够调用你的经验与方法"],
    ["04", "完成一个可实际使用的原型", "现场测试、修正，并获得后续迭代清单"]
  ];
  steps.forEach(([number, title, note], index) => {
    const y = 692 + index * 76;
    ellipse(`NUMBER / Step ${number}`, 86, y, 34, ink);
    text(`TEXT / Step ${number}`, number, 88, y + 8, 30, 18, 13, "#F8F5EF", "Bold", "CENTER");
    text(`TEXT / Step ${number} title`, title, 138, y - 1, 360, 26, 17, ink, "Bold");
    text(`TEXT / Step ${number} note`, note, 138, y + 28, 360, 34, 13, muted, "Regular");
  });

  // Agent workflow diagram.
  rect("PANEL / Agent workflow", 571, 598, 453, 420, "#20201D", 20);
  text("TEXT / Workflow heading", "把 AI 带进真实工作", 601, 632, 380, 34, 25, "#F8F5EF", "Bold");
  text(
    "TEXT / Workflow note",
    "内容选题、资料整理、需求分析、知识问答、\n项目复盘、销售研究……任选一个任务开始。",
    601,
    680,
    375,
    52,
    14,
    "#C7C0B2",
    "Regular",
    "LEFT",
    21
  );
  const workflowNodes = [
    ["CARD / Real problem", "真实问题", 602, 770, 105, 62],
    ["CARD / Personal data", "个人资料", 888, 770, 105, 62],
    ["CARD / Your agent", "你的\nAgent", 745, 850, 112, 76],
    ["CARD / Steps", "执行步骤", 602, 936, 105, 62],
    ["CARD / Result", "可用结果", 888, 936, 105, 62]
  ];
  workflowNodes.forEach(([name, label, x, y, w, h], index) => {
    rect(name, x, y, w, h, "#292925", 14, index === 2 ? "#D0B578" : "#6C675E");
    text(`${name} label`, label, x + 5, y + (index === 2 ? 16 : 22), w - 10, index === 2 ? 42 : 20, 13, index === 2 ? "#FFE6AD" : "#EEE8DC", "Bold", "CENTER");
  });
  [
    [690, 812, 84, 1, 24],
    [824, 885, 82, 1, -24],
    [690, 962, 84, 1, -26],
    [824, 892, 82, 1, 26]
  ].forEach(([x, y, w, h, rotation], index) => {
    const line = rect(`CONNECTOR / ${index + 1}`, x, y, w, h, "#777064");
    line.rotation = rotation;
  });

  // Takeaways.
  const outputs = [
    ["TAKEAWAY 01", "一个属于自己的\nAgent 原型"],
    ["TAKEAWAY 02", "一份清晰、可复用的\n任务工作流"],
    ["FOR WHOM", "创作者 · 开发者\n自由职业者 · Founder"]
  ];
  outputs.forEach(([tag, value], index) => {
    const x = 56 + index * 328;
    rect(`CARD / ${tag}`, x, 1042, 312, 138, paper, 17, beige);
    text(`TEXT / ${tag}`, tag, x + 22, 1066, 260, 20, 13, accent, "Bold");
    text(`TEXT / ${tag} value`, value, x + 22, 1101, 270, 58, 19, ink, "Bold", "LEFT", 26);
  });

  // CTA and partner strip.
  rect("DIVIDER / Footer", 56, 1236, 968, 1, beige);
  text(
    "TEXT / Preparation",
    "带上电脑，以及一个你真正想解决的问题",
    56,
    1262,
    660,
    31,
    22,
    ink,
    "Bold"
  );
  text("TEXT / Capacity", "名额有限｜欢迎加入 8 月第一场 AI 实践", 56, 1302, 620, 22, 14, muted);
  rect("BUTTON / Register", 870, 1263, 154, 54, ink, 27);
  text("TEXT / Register", "立即报名", 882, 1279, 130, 22, 16, "#FFFFFF", "Bold", "CENTER");
  rect("DIVIDER / Partners", 56, 1350, 968, 1, beige);
  const partners = [
    ["Hurdle Club", 56, 240, ink],
    ["CODE FORGE", 298, 240, ink],
    ["Mulan", 540, 240, "#66527F"],
    ["ZERORE", 782, 242, ink]
  ];
  partners.forEach(([label, x, w, color], index) => {
    if (index > 0) rect(`DIVIDER / Partner ${index}`, x, 1370, 1, 28, beige);
    text(`TEXT / Partner ${label}`, label, x + 12, 1373, w - 24, 24, index === 2 ? 20 : 17, color, "Bold", "CENTER");
  });

  figma.currentPage.selection = [frame];
  figma.viewport.scrollAndZoomIntoView([frame]);
  return { templateId: frame.id, createdNodeIds: ids };
}

const GENERIC_NODE_LIMIT = 100;
const INSPECTION_DEPTH_LIMIT = 4;

function summarizeNode(node, depth = 0) {
  const summary = {
    id: node.id,
    name: node.name,
    type: node.type,
    visible: node.visible,
    x: Math.round(node.x || 0),
    y: Math.round(node.y || 0),
    width: Math.round(node.width || 0),
    height: Math.round(node.height || 0)
  };
  if (node.type === "TEXT") summary.characters = node.characters.slice(0, 2000);
  if ("fills" in node && Array.isArray(node.fills)) summary.fills = node.fills;
  if ("children" in node && depth < INSPECTION_DEPTH_LIMIT) {
    summary.children = node.children.slice(0, GENERIC_NODE_LIMIT).map((child) => summarizeNode(child, depth + 1));
    summary.childrenTruncated = node.children.length > GENERIC_NODE_LIMIT;
  }
  return summary;
}

function getDocumentSummary() {
  const children = figma.currentPage.children.slice(0, GENERIC_NODE_LIMIT);
  return {
    fileName: figma.root.name,
    currentPage: { id: figma.currentPage.id, name: figma.currentPage.name },
    nodes: children.map((node) => summarizeNode(node)),
    truncated: figma.currentPage.children.length > GENERIC_NODE_LIMIT
  };
}

function getSelectionSummary() {
  return {
    currentPage: { id: figma.currentPage.id, name: figma.currentPage.name },
    nodes: figma.currentPage.selection.slice(0, GENERIC_NODE_LIMIT).map((node) => summarizeNode(node)),
    truncated: figma.currentPage.selection.length > GENERIC_NODE_LIMIT
  };
}

async function parentFor(parentId) {
  if (!parentId) return figma.currentPage;
  const parent = await figma.getNodeByIdAsync(parentId);
  if (!parent || !("appendChild" in parent)) throw new Error(`父节点不存在或不能包含子节点：${parentId}`);
  return parent;
}

function getContextSnapshot() {
  const selection = figma.currentPage.selection.map(({ id, name, type }) => ({ id, name, type }));
  return {
    fileName: figma.root.name,
    page: { id: figma.currentPage.id, name: figma.currentPage.name },
    selection,
    fingerprint: `${figma.currentPage.id}|${selection.map(({ id }) => id).sort().join(",")}`
  };
}

function assertExpectedContext(expectedContext) {
  if (!expectedContext) return;
  if (typeof expectedContext.pageId !== "string" || !Array.isArray(expectedContext.selectionIds)) {
    throw new Error("Invalid expected Figma context. Inspect again before applying.");
  }
  const current = getContextSnapshot();
  const expectedIds = [...expectedContext.selectionIds].sort();
  const actualIds = current.selection.map(({ id }) => id).sort();
  if (
    expectedContext.pageId !== current.page.id ||
    JSON.stringify(expectedIds) !== JSON.stringify(actualIds)
  ) {
    throw new Error("Figma context changed after planning. Inspect again before applying.");
  }
}

async function createGenericNodes(specs) {
  if (!Array.isArray(specs) || specs.length === 0) throw new Error("nodes 必须是非空数组。");
  if (specs.length > GENERIC_NODE_LIMIT) throw new Error(`单次最多创建 ${GENERIC_NODE_LIMIT} 个节点。`);
  const needsText = specs.some((spec) => spec.type === "TEXT");
  if (needsText) await figma.loadFontAsync({ family: "Inter", style: "Regular" });

  const created = [];
  for (const spec of specs) {
    let node;
    if (spec.type === "FRAME") node = figma.createFrame();
    else if (spec.type === "RECTANGLE") node = figma.createRectangle();
    else if (spec.type === "TEXT") node = figma.createText();
    else throw new Error(`不支持的节点类型：${spec.type}`);

    node.name = String(spec.name || spec.type).slice(0, 200);
    (await parentFor(spec.parentId)).appendChild(node);
    if (Number.isFinite(spec.width) && Number.isFinite(spec.height)) {
      node.resize(Math.max(1, spec.width), Math.max(1, spec.height));
    }
    if (Number.isFinite(spec.x)) node.x = spec.x;
    if (Number.isFinite(spec.y)) node.y = spec.y;
    if ("cornerRadius" in node && Number.isFinite(spec.cornerRadius)) node.cornerRadius = Math.max(0, spec.cornerRadius);
    if ("fills" in node && spec.fill) node.fills = [solid(spec.fill, Number.isFinite(spec.opacity) ? spec.opacity : 1)];
    if (node.type === "TEXT") {
      node.characters = String(spec.text || "");
      if (Number.isFinite(spec.fontSize)) node.fontSize = Math.max(1, spec.fontSize);
      if (spec.color) node.fills = [solid(spec.color)];
    }
    created.push(summarizeNode(node));
  }
  figma.currentPage.selection = (await Promise.all(created.map(({ id }) => figma.getNodeByIdAsync(id)))).filter(Boolean);
  return { created };
}

async function updateGenericNodes(updates) {
  if (!Array.isArray(updates) || updates.length === 0) throw new Error("updates 必须是非空数组。");
  if (updates.length > GENERIC_NODE_LIMIT) throw new Error(`单次最多更新 ${GENERIC_NODE_LIMIT} 个节点。`);
  const resolvedNodes = await Promise.all(updates.map(({ id }) => figma.getNodeByIdAsync(id)));
  const textNodes = resolvedNodes
    .filter((node) => node?.type === "TEXT");
  const fonts = new Map();
  textNodes.forEach((node) => node.getStyledTextSegments(["fontName"]).forEach((segment) => {
    fonts.set(`${segment.fontName.family}:${segment.fontName.style}`, segment.fontName);
  }));
  await Promise.all([...fonts.values()].map((font) => figma.loadFontAsync(font)));

  const changed = [];
  for (let index = 0; index < updates.length; index += 1) {
    const update = updates[index];
    const node = resolvedNodes[index];
    if (!node || node.type === "DOCUMENT" || node.type === "PAGE") throw new Error(`找不到可更新节点：${update.id}`);
    if (typeof update.name === "string") node.name = update.name.slice(0, 200);
    if (typeof update.visible === "boolean") node.visible = update.visible;
    if (Number.isFinite(update.x)) node.x = update.x;
    if (Number.isFinite(update.y)) node.y = update.y;
    if (Number.isFinite(update.width) && Number.isFinite(update.height)) {
      node.resize(Math.max(1, update.width), Math.max(1, update.height));
    }
    if ("fills" in node && update.fill) node.fills = [solid(update.fill, Number.isFinite(update.opacity) ? update.opacity : 1)];
    if (node.type === "TEXT" && typeof update.text === "string") node.characters = update.text;
    changed.push(summarizeNode(node));
  }
  return { updated: changed };
}

function replyToBridge(requestId, ok, data) {
  figma.ui.postMessage({ type: "mcp-result", requestId, ok, data });
}

figma.ui.onmessage = async (message) => {
  try {
    if (message.type === "replace-photo") {
      const count = await replacePhoto(message.bytes);
      figma.ui.postMessage({ type: "success", message: `已替换 ${count} 个照片框。` });
      return;
    }

    if (message.type === "apply-details") {
      const changed = await applyDetails(message);
      figma.ui.postMessage({
        type: "success",
        message: `已更新 ${changed} 个文字图层。`
      });
      return;
    }

    if (message.type === "mcp-command") {
      const { requestId, command, args = {} } = message;
      if (command === "replace_guest_photo") {
        const bytes = Uint8Array.from(atob(args.imageBase64), (char) => char.charCodeAt(0));
        const count = await replacePhoto(bytes);
        replyToBridge(requestId, true, { replacedPhotoFrames: count });
        return;
      }
      if (command === "set_event_details") {
        const count = await applyDetails(args);
        replyToBridge(requestId, true, { updatedTextLayers: count });
        return;
      }
      if (command === "list_templates") {
        replyToBridge(requestId, true, { templates: listTemplates() });
        return;
      }
      if (command === "get_document") {
        replyToBridge(requestId, true, getDocumentSummary());
        return;
      }
      if (command === "get_context") {
        replyToBridge(requestId, true, getContextSnapshot());
        return;
      }
      if (command === "get_selection") {
        replyToBridge(requestId, true, getSelectionSummary());
        return;
      }
      if (command === "create_nodes") {
        assertExpectedContext(args.expectedContext);
        replyToBridge(requestId, true, await createGenericNodes(args.nodes));
        return;
      }
      if (command === "update_nodes") {
        assertExpectedContext(args.expectedContext);
        replyToBridge(requestId, true, await updateGenericNodes(args.updates));
        return;
      }
      if (command === "create_waic_template") {
        replyToBridge(requestId, true, await createWaicPoster());
        return;
      }
      if (command === "create_crossborder_template") {
        replyToBridge(requestId, true, await createCrossBorderPoster(args.imageBase64));
        return;
      }
      if (command === "place_guest_asset") {
        replyToBridge(requestId, true, await placeGuestAsset(args.imageBase64));
        return;
      }
      if (command === "redesign_crossborder_cohosts") {
        replyToBridge(requestId, true, await redesignCrossBorderCohosts(args.siaBase64, args.vickyBase64));
        return;
      }
      if (command === "redesign_crossborder_preserve_copy") {
        replyToBridge(requestId, true, await redesignCrossBorderPreserveCopy(args.siaBase64, args.vickyBase64));
        return;
      }
      if (command === "create_aug1_agent_workshop") {
        replyToBridge(requestId, true, await createAug1AgentWorkshopPoster());
        return;
      }
      throw new Error(`不支持的 MCP 命令：${command}`);
    }

    if (message.type === "close") figma.closePlugin();
  } catch (error) {
    if (message.type === "mcp-command") {
      replyToBridge(message.requestId, false, { error: error.message || String(error) });
      return;
    }
    figma.ui.postMessage({ type: "error", message: error.message || String(error) });
  }
};
