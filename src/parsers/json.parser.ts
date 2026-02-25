export function jsonParser(buffered_json_data: string) {
  const btos = String(buffered_json_data);
  try {
    return JSON.parse(btos);
  } catch {
    return btos;
  }
}
