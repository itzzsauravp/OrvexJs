import xxhash from "xxhash-wasm";

let hasher: Awaited<ReturnType<typeof xxhash>> | null = null;

export async function initHasher() {
  if (!hasher) {
    hasher = await xxhash();
  }
  return hasher;
}

export function quickHash(data: string) {
  if (!hasher) {
    throw new Error("xxhash-wasm not initialized");
  }
  return hasher.h64ToString(data);
}
