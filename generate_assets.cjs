const zlib = require('zlib');
const fs = require('fs');

function generatePng(width, height, drawFn) {
  const IHDR = Buffer.alloc(13);
  IHDR.writeUInt32BE(width, 0);
  IHDR.writeUInt32BE(height, 4);
  IHDR.writeUInt8(8, 8);
  IHDR.writeUInt8(6, 9);
  IHDR.writeUInt8(0, 10);
  IHDR.writeUInt8(0, 11);
  IHDR.writeUInt8(0, 12);

  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0;
    for (let x = 0; x < width; x++) {
      const p = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawData[p] = r;
      rawData[p + 1] = g;
      rawData[p + 2] = b;
      rawData[p + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    table[i] = c;
  }
  function crc32(buf) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }
  function makeChunk(type, data) {
    const chunk = Buffer.alloc(8 + data.length + 4);
    chunk.writeUInt32BE(data.length, 0);
    chunk.write(type, 4);
    data.copy(chunk, 8);
    const crcVal = crc32(Buffer.concat([Buffer.from(type), data]));
    chunk.writeUInt32BE(crcVal, 8 + data.length);
    return chunk;
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    makeChunk('IHDR', IHDR),
    makeChunk('IDAT', deflated),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

function iconShader(x, y, w, h) {
  const cx = w / 2, cy = h / 2;
  const r = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
  const maxR = w * 0.44;
  if (r <= maxR) {
    if (r >= maxR - (w * 0.05)) return [56, 189, 248, 255];
    const ny = (y - cy) / (h * 0.35), nx = (x - cx) / (w * 0.35);
    const inBolt = ((ny >= -0.7 && ny <= 0.1 && Math.abs(nx - (-0.1 + ny * 0.4)) < 0.22) ||
                    (ny >= -0.1 && ny <= 0.8 && Math.abs(nx - (0.1 + ny * 0.3)) < 0.2) ||
                    (ny >= -0.15 && ny <= 0.05 && nx >= -0.5 && nx <= 0.5));
    if (inBolt) return Math.abs(nx) < 0.08 ? [254, 240, 138, 255] : [234, 179, 8, 255];
    return [15, 23, 42, 255];
  }
  return [18, 22, 32, 255];
}

function screenshotShader(x, y, w, h) {
  if (y < 48 || y > h - 32) return [15, 23, 42, 255];
  if ((x < 180 || x > w - 240) && w >= 1000) return [24, 30, 44, 255];
  if (x % 32 === 0 || y % 32 === 0) return [30, 41, 59, 255];
  if (Math.abs(y - h * 0.5) < 3 && x > 200 && x < w - 200) return [56, 189, 248, 255];
  return [18, 22, 32, 255];
}

fs.mkdirSync('public/icons', { recursive: true });
fs.mkdirSync('public/screenshots', { recursive: true });
fs.writeFileSync('public/icons/volt-flow-192.png', generatePng(192, 192, iconShader));
fs.writeFileSync('public/icons/volt-flow-512.png', generatePng(512, 512, iconShader));
fs.writeFileSync('public/screenshots/screenshot-desktop.png', generatePng(1280, 720, screenshotShader));
fs.writeFileSync('public/screenshots/screenshot-mobile.png', generatePng(720, 1280, screenshotShader));
console.log('✅ Generated 100% valid PNG files!');
