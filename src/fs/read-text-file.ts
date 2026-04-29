import fs from "fs";

function isProbablyBinary(buf: Buffer): boolean {
  // Heuristic: presence of NULL bytes is a strong signal.
  return buf.includes(0);
}

export function readTextFileBestEffort(
  absolutePath: string,
  maxBytes: number,
): { content: string; skippedReason?: string } {
  let buf: Buffer;
  try {
    buf = fs.readFileSync(absolutePath);
  } catch {
    return { content: "", skippedReason: "unreadable" };
  }

  if (buf.byteLength > maxBytes) return { content: "", skippedReason: "too large" };
  if (isProbablyBinary(buf)) return { content: "", skippedReason: "binary" };

  try {
    return { content: buf.toString("utf8") };
  } catch {
    return { content: "", skippedReason: "unreadable" };
  }
}
