import { cookieParser } from "../parsers/cookie.parser";
import { jsonParser } from "../parsers/json.parser";

interface IYaloRequest {
  method: string;
  url: string;
  version: string;
  body: any;
  query: any;
  params: any;
  cookie: any;
}

export class YaloRequest {
  private requestObject: IYaloRequest;

  constructor(private rawRequest: string | Buffer<ArrayBufferLike>) {
    const parsedRequest = String(this.rawRequest).split("\r\n");
    const [method, url, version] = parsedRequest[0].split(" ");

    this.requestObject = {
      ...this.requestObject,
      method,
      url,
      version,
    };

    if (method.toUpperCase() !== "GET") {
      const rawBody = parsedRequest[parsedRequest.length - 1];
      const parsedRequest_body = jsonParser(rawBody);
      this.requestObject = { ...this.requestObject, body: parsedRequest_body };
    }

    if (url.includes("?")) {
      let query_object = {};
      const query_strings = url.split("?")[1];
      query_strings
        .split("&")
        .map((item) => item.split("="))
        .map((each) => {
          const key = each[0].trim();
          const value = each[1].trim();
          query_object = { ...query_object, [key]: value };
        });
      this.requestObject = { ...this.requestObject, query: query_object };
    }

    const requestSignature = parsedRequest.slice(1, parsedRequest.length - 2);
    requestSignature.map((item) => {
      const header = item.split(":");
      const key = header[0].trim().toLowerCase();
      const value = header[1].trim();
      this.requestObject = { ...this.requestObject, [key]: value };
    });

    // temp fix with any here
    if (this.requestObject.cookie) {
      const cookie = cookieParser(this.requestObject.cookie);
      this.requestObject = { ...this.requestObject, cookie };
    }
  }

  getRequestObject() {
    return this.requestObject;
  }

  get method() {
    return this.requestObject.method;
  }

  get url() {
    return this.requestObject.url;
  }

  get version() {
    return this.requestObject.version;
  }

  get body() {
    return this.requestObject.body;
  }

  set body(val: any) {
    this.requestObject.body = val;
  }

  get query() {
    return this.requestObject.query;
  }

  set query(val: any) {
    this.requestObject.query = val;
  }

  get params() {
    return this.requestObject.params;
  }

  set params(val: Record<string, string>) {
    this.requestObject.params = { ...this.requestObject.params, ...val };
  }

  get cookie() {
    return this.requestObject.cookie;
  }
}
