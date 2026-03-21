#!/usr/bin/env node
/**
 * One-off: 32×32 teal #0A8080 favicon with white "t" (matches src/app/icon.tsx).
 * Writes public/favicon.png and public/favicon.ico (ICO embeds PNG).
 */
import fs from "fs";
import path from "path";
import zlib from "zlib";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const publicDir = path.join(root, "public");

const W = 32;
const H = 32;
const teal = [0x0a, 0x80, 0x80, 0xff];
const white = [0xff, 0xff, 0xff, 0xff];

/** Rounded rect mask: inside rounded box like icon.tsx borderRadius ~6 on 32px */
function inRoundedRect(px, py) {
  const r = 5;
  const x0 = 0;
  const y0 = 0;
  const x1 = W - 1;
  const y1 = H - 1;
  if (px < x0 + r && py < y0 + r) {
    const dx = px - (x0 + r);
    const dy = py - (y0 + r);
    return dx * dx + dy * dy <= r * r;
  }
  if (px > x1 - r && py < y0 + r) {
    const dx = px - (x1 - r);
    const dy = py - (y0 + r);
    return dx * dx + dy * dy <= r * r;
  }
  if (px < x0 + r && py > y1 - r) {
    const dx = px - (x0 + r);
    const dy = py - (y1 - r);
    return dx * dx + dy * dy <= r * r;
  }
  if (px > x1 - r && py > y1 - r) {
    const dx = px - (x1 - r);
    const dy = py - (y1 - r);
    return dx * dx + dy * dy <= r * r;
  }
  return px >= x0 && px <= x1 && py >= y0 && py <= y1;
}

function pixel(px, py) {
  if (!inRoundedRect(px, py)) return [0, 0, 0, 0];
  // Minimal "t": crossbar + stem (matches OG icon feel)
  const cx = 16;
  const cy = 16;
  // crossbar y = cy - 5, x from cx-4 to cx+4
  const onCross = py === cy - 5 && px >= cx - 4 && px <= cx + 4;
  // stem x = cx-1,cx, y from cy-4 to cy+6
  const onStem =
    (px === cx - 1 || px === cx) && py >= cy - 4 && py <= cy + 6;
  if (onCross || onStem) return white;
  return teal;
}

function crc32(buf) {
  let c = 0xffffffff;
  const table = crc32.table || (crc32.table = makeCrcTable());
  for (let i = 0; i < buf.length; i++) {
    c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeCrcTable() {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    t[n] = c >>> 0;
  }
  return t;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  const combined = Buffer.concat([typeBuf, data]);
  crc.writeUInt32BE(crc32(combined), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function buildPng() {
  const raw = Buffer.alloc((W * 4 + 1) * H);
  let o = 0;
  for (let y = 0; y < H; y++) {
    raw[o++] = 0; // filter None
    for (let x = 0; x < W; x++) {
      const [r, g, b, a] = pixel(x, y);
      raw[o++] = r;
      raw[o++] = g;
      raw[o++] = b;
      raw[o++] = a;
    }
  }
  const compressed = zlib.deflateSync(raw, { level: 9 });

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", compressed),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function buildIco(pngBuf) {
  // ICO: 1 image, PNG type (0 = BMP DIB, 1 = PNG in modern Windows)
  const pngOffset = 6 + 16;
  const fileSize = pngOffset + pngBuf.length;

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // count

  const entry = Buffer.alloc(16);
  entry[0] = W === 256 ? 0 : W; // width (0 = 256)
  entry[1] = H === 256 ? 0 : H;
  entry[2] = 0; // palette
  entry[3] = 0;
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bpp
  entry.writeUInt32LE(pngBuf.length, 8); // size of image
  entry.writeUInt32LE(pngOffset, 12); // offset

  return Buffer.concat([header, entry, pngBuf]);
}

const png = buildPng();
const ico = buildIco(png);

fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, "favicon.png"), png);
fs.writeFileSync(path.join(publicDir, "favicon.ico"), ico);
console.log("Wrote public/favicon.png and public/favicon.ico");
