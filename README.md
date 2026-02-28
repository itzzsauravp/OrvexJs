# OrvexJs

OrvexJs is a low-level, high-performance implementation of an HTTP server built directly on top of Node.js TCP sockets. It provides an Express-like interface while maintaining a transparent connection to the underlying HTTP protocol.

## Features

- **Zero Dependencies** (almost): Built exclusively using native Node.js modules (`net`, `buffer`, `path`).
- **Template Literal Routing**: Define dynamic routes using `$variable`.
- **Middleware Pipeline**: Support for global wiring and route-specific execution chains.
- **Semantic Response Helpers**: A comprehensive suite of methods for standard HTTP status codes.

---

## Usage

### Basic Server Setup

```ts
const orvex = Orvex.create();

orvex.register(HTTP.GET, "/", (req, res) => {
  res.ok("Hello World!");
});

orvex.listen(8000);
```

### Details

```ts
const orvex = Orvex.create();

// Global middleware: Runs on every single incoming request
orvex.wire([globalTrafficMonitor]);

// Standard route registration
orvex.register(
  HTTP.GET,
  "/health",
  (req, res) => {
    return res.setHeader("Content-Type", "text/html").ok("<h1>Server is Healthy</h1>");
  },
  // Route-specific middleware: Runs ONLY for this specific GET /health endpoint
  [validateHealthCheckAccess],
);

orvex.listen(8000, "0.0.0.0", () => {
  console.log("Orvex server active on port 8000");
});
```

### Branching and Modularization

Orvex supports "Branches" to help organize large codebases into modular sections.

```ts
const authBranch = new OrvexBranch();

// Branch-level middleware: Applies to ALL routes defined within this branch (e.g., /auth/*)
authBranch.wire([traceAuthSession, checkApiKeys]);

authBranch.register(HTTP.POST, "/login", (req, res) => {
  const { username } = req.body;
  res.ok({ message: `Welcome ${username}` });
});

// Mount back to the app
// All routes inside 'authBranch' will now be prefixed with '/auth'
app.mount("/auth", authBranch);
```

## API Reference

### Response Object (`OrvexResponse`)

The response object includes built-in methods that automatically set the correct status codes and reason phrases.

| Method                | Status Code | RFC Description       |
| --------------------- | ----------- | --------------------- |
| `ok(data)`            | 200         | OK                    |
| `created(data)`       | 201         | Created               |
| `noContent()`         | 204         | No Content            |
| `badRequest(data)`    | 400         | Bad Request           |
| `unauthorized(data)`  | 401         | Unauthorized          |
| `forbidden(data)`     | 403         | Forbidden             |
| `notFound(data)`      | 404         | Not Found             |
| `internalError(data)` | 500         | Internal Server Error |

---

## Installation and Development

### Repository Setup

```bash
git clone http://github.com/itzzsauravp/OrvexJs.git && cd OrvexJs

npm install
```

### Running the Project

```bash
# Start the example server
npm run orvex

# Start in development mode with hot-reloading
npm run orvex:dev
```

---

### Project Status: Alpha

> **Note**: This project is currently in active development. The API is not yet stable and is subject to breaking changes without notice. It is intended for educational purposes and experimental use only; it is not recommended for production environments.
