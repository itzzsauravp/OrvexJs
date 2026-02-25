export class YaloResponse {
  constructor() {}

  public send(body: string, status = 200, contentType = "text/plain") {
    const statusText = status === 200 ? "OK" : "Not Found";

    const response = [
      `HTTP/1.1 ${status} ${statusText}`,
      `Content-Type: ${contentType}`,
      `Content-Length: ${Buffer.byteLength(body)}`,
      // `Connection: Keep-Alive`,
      "",
      body,
    ].join("\r\n");
    return response;
  }

  public json(data: object) {
    return this.send(JSON.stringify(data), 200, "application/json");
  }
}
