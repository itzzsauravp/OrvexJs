import { OrvexFileMagicSignature } from "src/types/orvex.types";
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

export const MAX_PAYLOAD_SIZE = 50 * 1024 * 1024;

export const RAW_HTTP_RESPONSE = {
  PAYLOAD_TOO_LARGE: "HTTP/1.1 413 Payload Too Large\r\nConnection: close\r\n\r\n",
  REQUEST_TIMEOUT: "HTTP/1.1 408 Request Timeout\r\nConnection: close\r\n\r\n",
  INTERNAL_SERVER_ERROR: "HTTP/1.1 500 Internal Server Error\r\n\r\n",
};

export const SIGNATURES: OrvexFileMagicSignature[] = [
  // Images
  { mimePrefix: "image/jpeg", offset: 0, bytes: [0xff, 0xd8, 0xff] },
  { mimePrefix: "image/png", offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mimePrefix: "image/gif", offset: 0, bytes: [0x47, 0x49, 0x46, 0x38] },
  { mimePrefix: "image/webp", offset: 8, bytes: [0x57, 0x45, 0x42, 0x50] },
  { mimePrefix: "image/bmp", offset: 0, bytes: [0x42, 0x4d] },
  { mimePrefix: "image/svg", offset: -1, bytes: [] }, // Text-based, skip binary check
  { mimePrefix: "image/x-icon", offset: 0, bytes: [0x00, 0x00, 0x01, 0x00] },

  // Video
  { mimePrefix: "video/mp4", offset: 4, bytes: [0x66, 0x74, 0x79, 0x70] }, // ftyp
  { mimePrefix: "video/webm", offset: 0, bytes: [0x1a, 0x45, 0xdf, 0xa3] },
  { mimePrefix: "video/x-matroska", offset: 0, bytes: [0x1a, 0x45, 0xdf, 0xa3] },
  { mimePrefix: "video/quicktime", offset: 4, bytes: [0x66, 0x74, 0x79, 0x70] },
  { mimePrefix: "video/x-msvideo", offset: 0, bytes: [0x52, 0x49, 0x46, 0x46] }, // RIFF

  // Audio
  { mimePrefix: "audio/mpeg", offset: 0, bytes: [0x49, 0x44, 0x33] }, // ID3
  { mimePrefix: "audio/wav", offset: 0, bytes: [0x52, 0x49, 0x46, 0x46] },
  { mimePrefix: "audio/ogg", offset: 0, bytes: [0x4f, 0x67, 0x67, 0x53] },
  { mimePrefix: "audio/flac", offset: 0, bytes: [0x66, 0x4c, 0x61, 0x43] },
  { mimePrefix: "audio/aac", offset: 0, bytes: [0xff, 0xf1] },

  // Documents
  { mimePrefix: "application/pdf", offset: 0, bytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  { mimePrefix: "application/zip", offset: 0, bytes: [0x50, 0x4b, 0x03, 0x04] }, // PK
  { mimePrefix: "application/x-7z", offset: 0, bytes: [0x37, 0x7a, 0xbc, 0xaf] },
  { mimePrefix: "application/gzip", offset: 0, bytes: [0x1f, 0x8b] },
  { mimePrefix: "application/x-tar", offset: 257, bytes: [0x75, 0x73, 0x74, 0x61, 0x72] }, // ustar

  // MS Office / OpenDocument (ZIP-based)
  { mimePrefix: "application/vnd.openxmlformats", offset: 0, bytes: [0x50, 0x4b, 0x03, 0x04] },
  { mimePrefix: "application/vnd.oasis.opendocument", offset: 0, bytes: [0x50, 0x4b, 0x03, 0x04] },
];

// Text-based MIME types that are exempt from binary magic number checks
export const TEXT_MIMES = [
  "text/",
  "application/json",
  "application/xml",
  "application/javascript",
  "application/typescript",
  "image/svg",
  "application/x-yaml",
  "application/toml",
];
