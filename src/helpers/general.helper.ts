import { createHash } from "node:crypto";

export function quickHash(data: string) {
  return createHash("sha256").update(data).digest("hex");
}
