import { cookieParser } from "./cookie.parser";
import { jsonParser } from "./json.parser";
export function requestParser(request_string: string | Buffer<ArrayBuffer>) {
  /*
    GET /about HTTP/1.1
    HOST: localhost:8000
    User-Agent: Chrome
    \r\n -> empty line that tells the servers headers are over;
    {"username":"something"} 
*/

  let request_object = {};
  const parsed_request = String(request_string).split("\r\n");

  // The first line of request information about the http method, request resource and the http version
  const [requested_method, requested_resource, http_version] = parsed_request[0].split(" ");

  request_object = {
    ...request_object,
    method: requested_method,
    resource: requested_resource, // how to define this for path params????
    version: http_version,
  };

  // The body of the request if there is any
  if (requested_method.toUpperCase() !== "GET") {
    const raw_json_body = parsed_request[parsed_request.length - 1];
    const parsed_request_body = jsonParser(raw_json_body);
    request_object = { ...request_object, body: parsed_request_body };
  }

  // handling case for query params
  if (requested_resource.includes("?")) {
    let query_object = {};
    const query_strings = requested_resource.split("?")[1];
    query_strings
      .split("&")
      .map((item) => item.split("="))
      .map((each) => {
        const key = each[0].trim();
        const value = each[1].trim();
        query_object = { ...query_object, [key]: value };
      });
    request_object = { ...request_object, query: query_object };
  }

  // the rest of the request goes here
  const parsed_request_without_httpinfo_and_rawbody = parsed_request.slice(
    1,
    parsed_request.length - 2,
  );
  parsed_request_without_httpinfo_and_rawbody.map((item) => {
    const header = item.split(":");
    const key = header[0].trim().toLowerCase();
    const value = header[1].trim();
    request_object = { ...request_object, [key]: value };
  });

  // temp fix with any here
  if ((request_object as any).cookie) {
    const cookie = cookieParser((request_object as any).cookie);
    request_object = { ...request_object, cookie };
  }

  return request_object;
}
