import net from "node:net";
import { OrvexStatus } from "./@orvex_enums";
import { ORVEX_STATUS_MESSAGES } from "./@orvex_constants";

export class OrvexResponse {
  private status: number = 200;
  private headers: Record<string, string> = {
    "Content-Type": "text/plain",
  };
  constructor(private readonly socket: net.Socket) {}

  /**
   *  This is just a helper method to deal with all the status codes
   * @param code Status code for the response
   * @param data Data to stream to the client
   */
  private send(code: OrvexStatus, data?: any): void {
    const response = this.constructResponse(data || "", code);
    this.socket.write(response);
    this.socket.end();
  }

  /**
   *
   * @param data Data to send over to client.
   * @param code Status code Ex: 200 | 404 etc.
   * @param message
   * @returns
   */
  private constructResponse(data: any, code?: number) {
    let body = data;
    if (typeof data === "object" && data !== null) {
      body = JSON.stringify(data);
      this.headers["Content-Type"] = "application/json";
    } else {
      body = String(data);
    }
    const bodyContent = body || "";
    this.headers["Content-Length"] = Buffer.byteLength(body).toString();
    const statusMessage = ORVEX_STATUS_MESSAGES[code];
    const headerString = Object.entries(this.headers)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\r\n");
    const response = `HTTP/1.1 ${code || this.status} ${statusMessage}\r\n${headerString}\r\n\r\n${bodyContent}`;
    return response;
  }

  /**
   * This method sets the status code for response.
   * @param status a HTTP status code.
   * @returns Returns an instance of the OrvexRespose itself.
   */
  public code(status: OrvexStatus): OrvexResponse {
    this.status = status;
    return this;
  }
  /**
   *  This method can be used to tune/fuse headers to the reponse
   * @param headers A Record<string, string> or headers
   * @returns Returns an instance of the OrvexRespose itself.
   */
  public setHeaders(headers: Record<string, string>): OrvexResponse {
    // TODO: probably have to check the headers here may be
    this.headers = { ...this.headers, ...headers };
    return this;
  }

  /**
   *  This method writes the reponse to the socket
   * @param data Data to send to the client
   */
  public relay(data: any): void {
    const response = this.constructResponse(data);
    this.socket.write(response);
    this.socket.end();
  }

  // --- 2xx Success ---

  /**
   * 200 OK: The request has succeeded.
   * @param data Optional response body (string or object).
   */
  public ok(data?: any) {
    this.send(OrvexStatus.OK, data);
  }

  /**
   * 201 Created: The request has been fulfilled and resulted in a new resource being created.
   * @param data Optional response body, typically the created resource.
   */
  public created(data?: any) {
    this.send(OrvexStatus.CREATED, data);
  }

  /**
   * 202 Accepted: The request has been accepted for processing, but processing is not yet complete.
   */
  public accepted(data?: any) {
    this.send(OrvexStatus.ACCEPTED, data);
  }

  /**
   * 204 No Content: The server successfully processed the request, but is not returning any content.
   */
  public noContent() {
    this.send(OrvexStatus.NO_CONTENT);
  }

  // --- 3xx Redirection ---

  /**
   * 301 Moved Permanently: The resource has been assigned a new permanent URI.
   * @param location The new URL where the resource resides.
   */
  public movedPermanently(location: string) {
    this.setHeaders({ Location: location });
    this.send(OrvexStatus.MOVED_PERMANENTLY);
  }

  /**
   * 302 Found (Temporary Redirect): The resource resides temporarily under a different URI.
   * @param location The temporary URL to redirect to.
   */
  public found(location: string) {
    this.setHeaders({ Location: location });
    this.send(OrvexStatus.FOUND);
  }

  // --- 4xx Client Errors ---

  /**
   * 400 Bad Request: The server cannot process the request due to client error (e.g., malformed syntax).
   * @param data Error details or message.
   */
  public badRequest(data?: any) {
    this.send(OrvexStatus.BAD_REQUEST, data);
  }

  /**
   * 401 Unauthorized: The request requires user authentication.
   */
  public unauthorized(data?: any) {
    this.send(OrvexStatus.UNAUTHORIZED, data);
  }

  /**
   * 403 Forbidden: The server understood the request but refuses to authorize it.
   */
  public forbidden(data?: any) {
    this.send(OrvexStatus.FORBIDDEN, data);
  }

  /**
   * 404 Not Found: The server cannot find the requested resource.
   */
  public notFound(data?: any) {
    this.send(OrvexStatus.NOT_FOUND, data || "Not Found");
  }

  /**
   * 405 Method Not Allowed: The request method is not supported for the requested resource.
   */
  public methodNotAllowed(data?: any) {
    this.send(OrvexStatus.METHOD_NOT_ALLOWED, data);
  }

  /**
   * 409 Conflict: The request could not be completed due to a conflict with the current state of the resource.
   */
  public conflict(data?: any) {
    this.send(OrvexStatus.CONFLICT, data);
  }

  // --- 5xx Server Errors ---

  /**
   * 500 Internal Server Error: The server encountered an unexpected condition that prevented it from fulfilling the request.
   */
  public internalError(data?: any) {
    this.send(OrvexStatus.INTERNAL_ERROR, data);
  }

  /**
   * 501 Not Implemented: The server does not support the functionality required to fulfill the request.
   */
  public notImplemented(data?: any) {
    this.send(OrvexStatus.NOT_IMPLEMENTED, data);
  }

  /**
   * 502 Bad Gateway: The server received an invalid response from an upstream server.
   */
  public badGateway(data?: any) {
    this.send(OrvexStatus.BAD_GATEWAY, data);
  }

  /**
   * 503 Service Unavailable: The server is currently unable to handle the request (due to overload or maintenance).
   */
  public serviceUnavailable(data?: any) {
    this.send(OrvexStatus.SERVICE_UNAVAILABLE, data);
  }
}
