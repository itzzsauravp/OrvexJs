![npm version](https://img.shields.io/npm/v/@itzzsauravp/alpha-orvexjs?label=alpha&color=orange)
![npm license](https://img.shields.io/npm/l/@itzzsauravp/alpha-orvexjs)
![npm downloads](https://img.shields.io/npm/dm/@itzzsauravp/alpha-orvexjs)
[![Install from npm](https://img.shields.io/badge/npm-@itzzsauravp/alpha--orvexjs-cb3837?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@itzzsauravp/alpha-orvexjs)

# OrvexJs

**OrvexJs** is a personal exploration into the internals of the HTTP protocol. Instead of reaching for a high-level framework, I wanted to see if I could build a functional, Express-like experience starting from nothing but raw Node.js TCP sockets.

## TL;DR

- what: A "from-scratch" web framework that talks directly to Node's net module.

- goal: Purely educational—built to understand how raw bytes become HTTP requests.

- tech: Zero dependencies. Powered by native net, buffer, and path modules.

- status: Experimental/Alpha. Built for curiosity and learning, not for production.

### The Goal

The mission was simple: build a modular web server using **zero external dependencies**. By sticking strictly to native Node.js modules (`net`, `buffer`, `path`), I was able to focus on the mechanics of request/response cycles and middleware pipelines.

---

### Basic Implementation

The API is designed to be intuitive, borrowing the familiar registration pattern used by frameworks like Express or Hono.

```javascript
const orvex = Orvex.create();

// Simple GET route
orvex.register(HTTP.GET, "/", (req, res) => {
  res.ok("Hello World!");
});

orvex.listen(8000);
```

### Middleware & Routing logic

Orvex supports a middleware pipeline that can be applied globally or scoped to specific endpoints.

```javascript
const orvex = Orvex.create();

// Global middleware: Runs on every incoming request
orvex.wire([globalTrafficMonitor]);

orvex.register(
  HTTP.GET,
  "/health",
  (req, res) => {
    return res
      .setHeader("Content-Type", "text/html")
      .ok("<h1>Server is Healthy</h1>");
  },
  // Route-specific middleware
  [validateHealthCheckAccess],
);

orvex.listen(8000, "0.0.0.0", () => {
  console.log("Orvex server active on port 8000");
});
```

---

### Modular Architecture (Branches)

To keep the logic organized, Orvex uses a "Branching" system. This allows for prefixing routes and grouping related logic together.

```javascript
const authBranch = new OrvexBranch();

// Branch-level middleware: Applies to all routes within /auth/*
authBranch.wire([traceAuthSession, checkApiKeys]);

authBranch.register(HTTP.POST, "/login", (req, res) => {
  const { username } = req.body;
  res.ok({ message: `Welcome ${username}` });
});

// Mount the branch with a prefix
app.mount("/auth", authBranch);
```

---

### API Reference (Response Helpers)

Orvex implementes a suite of semantic helpers to manage standard HTTP status codes effectively.

| Method                | Status Code | Description                       |
| --------------------- | ----------- | --------------------------------- |
| `ok(data)`            | 200         | Request fulfilled successfully    |
| `created(data)`       | 201         | Resource created successfully     |
| `noContent()`         | 204         | Request handled, no body returned |
| `badRequest(data)`    | 400         | Client-side error                 |
| `notFound(data)`      | 404         | Resource not found                |
| `internalError(data)` | 500         | Server-side error                 |

---

### Installation & Development

If you're interested in the TCP socket implementation or the routing logic, you can run the project locally:

```bash
# Setup
git clone http://github.com/itzzsauravp/OrvexJs.git && cd OrvexJs
npm install

# Run the example server
npm run orvex

# Start in development mode (hot-reload)
npm run orvex:dev

```

> **Note:** This project is currently in **Alpha**. It is an educational tool and experimental implementation. It is not recommended for production environments or security-critical applications.

---

## Using OrvexJs Locally

If you want to test OrvexJs in your own project you can use `npm link`.

### 1. Prepare OrvexJs

First, navigate to your local OrvexJs directory and create a global link:

```bash
cd path/to/OrvexJs
npm install
npm run build
npm link
```

### 2. Connect to your Project

Now, go to the project where you want to use OrvexJs and "link" it:

```bash
cd path/to/your-test-app
npm link @itzzsauravp/alpha-orvexjs
```

### 3. Usage

You can now import it just like a regular package:

```javascript
const Orvex = require("@itzzsauravp/alpha-orvexjs");
// or if using ESM/TypeScript
import { Orvex } from "@itzzsauravp/alpha-orvexjs";
```

> **Pro Tip:** If you make changes to the OrvexJs source code, remember to run `npm run build` again so the linked `dist` folder updates!

---
