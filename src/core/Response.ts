import { YaloStatus } from "./@yalo_enums";

export class YaloResponse {
  private status: number = 200;
  private headers: Record<string, string> = {
    "Content-Type": "text/plain",
  };
  constructor() {}

  /**
   * This method sets the status code for response.
   * @param status a HTTP status code.
   * @returns Returns an instance of the YaloRespose itself.
   */
  public code(status: YaloStatus): YaloResponse {
    this.status = status;
    return this;
  }
  /**
   *  This method can be used to tune/fuse headers to the reponse
   * @param headers A Record<string, string> or headers
   * @returns Returns an instance of the YaloRespose itself.
   */
  public setHeaders(headers: Record<string, string>): YaloResponse {
    // TODO: probably have to check the headers here may be
    this.headers = { ...this.headers, ...headers };
    return this;
  }

  /**
   *  This method takes data of any type and formats and send it to the client.
   * @param data Data to send over to client.
   * @returns
   */
  public relay(data: any): string {
    let body = data;

    if (typeof data === "object" && data !== null) {
      body = JSON.stringify(data);
      this.headers["Content-Type"] = "application/json";
    } else {
      body = String(data);
    }

    this.headers["Content-Length"] = Buffer.byteLength(body).toString();

    const statusMessage = this.status === 200 ? "OK" : "Error";

    const headerString = Object.entries(this.headers)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\r\n");

    const response = `HTTP/1.1 ${this.status} ${statusMessage}\r\n${headerString}\r\n\r\n${body}`;
    return response;
  }
}
