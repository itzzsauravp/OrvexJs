import { YaloStatus } from "../enums/yalo.enums";

export const YALO_STATUS_MESSAGES: Record<YaloStatus, string> = {
  [YaloStatus.OK]: "OK",
  [YaloStatus.CREATED]: "Created",
  [YaloStatus.ACCEPTED]: "Accepted",
  [YaloStatus.NO_CONTENT]: "No Content",

  [YaloStatus.MOVED_PERMANENTLY]: "Moved Permanently",
  [YaloStatus.FOUND]: "Found",

  [YaloStatus.BAD_REQUEST]: "Bad Request",
  [YaloStatus.UNAUTHORIZED]: "Unauthorized",
  [YaloStatus.FORBIDDEN]: "Forbidden",
  [YaloStatus.NOT_FOUND]: "Not Found",
  [YaloStatus.METHOD_NOT_ALLOWED]: "Method Not Allowed",
  [YaloStatus.CONFLICT]: "Conflict",

  [YaloStatus.INTERNAL_ERROR]: "Internal Server Error",
  [YaloStatus.NOT_IMPLEMENTED]: "Not Implemented",
  [YaloStatus.BAD_GATEWAY]: "Bad Gateway",
  [YaloStatus.SERVICE_UNAVAILABLE]: "Service Unavailable",
};

export const JUNK_ROUTES = ["./favicon.ico"];
