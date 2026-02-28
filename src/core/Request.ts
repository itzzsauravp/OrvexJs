import { cookieParser } from "../parsers/cookie.parser";
import { OrvexFile, OrvexFileCollection } from "./File";

interface IOrvexRequest {
  method: string;
  url: string;
  version: string;
  body: any;
  files: OrvexFileCollection;
  query: Record<string, string>;
  params: Record<string, string>;
  cookie: any;
  [key: string]: any;
}

export class OrvexRequest {
  private requestObject: IOrvexRequest = {
    method: "",
    url: "",
    version: "",
    files: new OrvexFileCollection(),
    body: {},
    query: {},
    params: {},
    cookie: null,
  };

  constructor(private readonly rawBuffer: Buffer) {
    const headerEndIndex = rawBuffer.indexOf(Buffer.from("\r\n\r\n"));
    if (headerEndIndex === -1) return;

    const headerString = rawBuffer.slice(0, headerEndIndex).toString();
    const bodyBuffer = rawBuffer.slice(headerEndIndex + 4);

    // 1. Parse Request Line
    const headersPart = headerString.split("\r\n");
    const [method, fullUrl, version] = headersPart[0].split(" ");

    this.requestObject.method = method;
    this.requestObject.url = fullUrl.split("?")[0]; // Clean URL
    this.requestObject.version = version;

    // 2. Parse Headers
    for (let i = 1; i < headersPart.length; i++) {
      const line = headersPart[i];
      const index = line.indexOf(":");
      if (index <= 0) continue;
      const key = line.slice(0, index).trim().toLowerCase();
      const value = line.slice(index + 1).trim();
      this.requestObject[key] = value;
    }

    // 3. Handle Query Parameters
    if (fullUrl.includes("?")) {
      this.parseQuery(fullUrl);
    }

    // 4. Handle Cookies
    if (this.requestObject.cookie) {
      this.requestObject.cookie = cookieParser(this.requestObject.cookie);
    }

    // 5. Handle Body & Files
    if (this.method !== "GET") {
      const contentType = this.requestObject["content-type"];

      if (contentType?.includes("application/json")) {
        try {
          this.requestObject.body = JSON.parse(bodyBuffer.toString());
        } catch {
          this.requestObject.body = {};
        }
      } else if (contentType?.includes("multipart/form-data")) {
        const { fields, files } = this.parseMultipart(bodyBuffer, contentType);
        this.requestObject.body = fields;
        this.requestObject.files = files;
      } else {
        this.requestObject.body = bodyBuffer.toString();
      }
    }
  }

  private parseQuery(url: string) {
    const queryString = url.split("?")[1];
    if (!queryString) return;
    queryString
      .split("&")
      .filter(Boolean)
      .forEach((item) => {
        const [key, value] = item.split("=");
        if (key)
          this.requestObject.query[decodeURIComponent(key)] = decodeURIComponent(value || "");
      });
  }

  // example: req that has files and stuff
  /*
    POST /upload HTTP/1.1
    Host: localhost:3000
    Content-Type: multipart/form-data; boundary=----OrvexBoundary777
    Content-Length: 345

    ------OrvexBoundary777\r\n
    Content-Disposition: form-data; name="username"\r\n
    \r\n
    Saurav\r\n
    ------OrvexBoundary777\r\n
    Content-Disposition: form-data; name="avatar"; filename="pfp.png"\r\n
    Content-Type: image/png\r\n
    \r\n
    PNG\r\nIHDR... (BINARY DATA) ...\r\n
    ------OrvexBoundary777--
  */
  private parseMultipart(body: Buffer, contentType: string) {
    const boundaryMatch = contentType.match(/boundary=(.+)/);
    if (!boundaryMatch) return { fields: {}, files: new OrvexFileCollection() };

    const boundary = Buffer.from("--" + boundaryMatch[1]);
    const fields: Record<string, string> = {};
    const files = new OrvexFileCollection();

    let start = body.indexOf(boundary);
    while (start !== -1) {
      start += boundary.length + 2;
      let end = body.indexOf(boundary, start);
      if (end === -1) break;

      const part = body.slice(start, end);
      const headerEnd = part.indexOf(Buffer.from("\r\n\r\n"));
      if (headerEnd === -1) break;

      const rawHeaders = part.slice(0, headerEnd).toString();
      const data = part.slice(headerEnd + 4, part.length - 2);

      const headerMap: Record<string, string> = {};
      rawHeaders.split("\r\n").forEach((line) => {
        const [k, v] = line.split(": ");
        if (k) headerMap[k.toLowerCase()] = v;
      });

      const disposition = headerMap["content-disposition"] || "";
      const params: Record<string, string> = {};
      disposition.split(";").forEach((p) => {
        const [k, v] = p.trim().split("=");
        if (v) params[k] = v.replace(/"/g, "");
      });

      if (params.filename) {
        const fileInstance = new OrvexFile({
          fieldname: params.name || "file",
          originalname: params.filename,
          mimetype: headerMap["content-type"] || "application/octet-stream",
          size: data.length,
          buffer: data,
        });
        files.push(fileInstance);
      } else if (params.name) {
        fields[params.name] = data.toString();
      }
      start = end;
    }
    return { fields, files };
  }

  // Getters
  get method() {
    return this.requestObject.method;
  }
  get url() {
    return this.requestObject.url;
  }
  get body() {
    return this.requestObject.body;
  }
  get files() {
    return this.requestObject.files;
  }
  get query() {
    return this.requestObject.query;
  }
  get cookie() {
    return this.requestObject.cookie;
  }
  get params() {
    return this.requestObject.params;
  }
  set params(val: Record<string, string>) {
    this.requestObject.params = { ...this.requestObject.params, ...val };
  }
}
