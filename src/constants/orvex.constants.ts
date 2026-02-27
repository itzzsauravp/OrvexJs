import { OrvexStatus } from "../core/@orvex_enums";

export const ORVEX_STATUS_MESSAGES: Record<OrvexStatus, string> = {
  [OrvexStatus.OK]: "OK",
  [OrvexStatus.CREATED]: "Created",
  [OrvexStatus.ACCEPTED]: "Accepted",
  [OrvexStatus.NO_CONTENT]: "No Content",

  [OrvexStatus.MOVED_PERMANENTLY]: "Moved Permanently",
  [OrvexStatus.FOUND]: "Found",

  [OrvexStatus.BAD_REQUEST]: "Bad Request",
  [OrvexStatus.UNAUTHORIZED]: "Unauthorized",
  [OrvexStatus.FORBIDDEN]: "Forbidden",
  [OrvexStatus.NOT_FOUND]: "Not Found",
  [OrvexStatus.METHOD_NOT_ALLOWED]: "Method Not Allowed",
  [OrvexStatus.CONFLICT]: "Conflict",

  [OrvexStatus.INTERNAL_ERROR]: "Internal Server Error",
  [OrvexStatus.NOT_IMPLEMENTED]: "Not Implemented",
  [OrvexStatus.BAD_GATEWAY]: "Bad Gateway",
  [OrvexStatus.SERVICE_UNAVAILABLE]: "Service Unavailable",
};

export const JUNK_ROUTES = ["/favicon.ico"];
