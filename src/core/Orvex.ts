import net from "node:net";
import { quickHash } from "../helpers/general.helper";
import {
  TRoutehandler,
  TOrvexStaticRoute,
  TRouteDefinition,
  TOrvexAppOption,
  TOrvexDynamicRoute,
} from "./@orvex_types";
import { OrvexBranch, OrvexRequest, OrvexResponse } from ".";
import { HTTP } from "./@orvex_enums";
import { OrvexMiddleware } from "./Middleware";
import { JUNK_ROUTES, MAX_PAYLOAD_SIZE, RAW_HTTP_RESPONSE } from "./@orvex_constants";

export class Orvex {
  private prefixString: string = "";

  /**
   * `isRoot` true indicates the root Orvex instance
   *
   * Is `true` by default for `Orvex.create()` method but not for `new Orvex()`
   */
  private readonly isRoot: boolean;

  constructor(options?: TOrvexAppOption) {
    this.isRoot = options.isRoot;
  }

  /**
   * A data structure to hold all the `static` routes registered to the app.
   */
  private staticRoutes: TOrvexStaticRoute = new Map<string, TRouteDefinition>();

  private dynamicRoutes: TOrvexDynamicRoute = [];

  /**
   * An array of middlewares intended for specific branch.
   */
  private branchMiddlewares: Array<TRoutehandler> = [];

  /**
   * An array of middlewares intended for all the routes.
   */
  private globalMiddlewares: Array<TRoutehandler> = [];

  /**
   * This is to ignore specific routes like /favicon.co when request sent from browser
   * @param req OrvexRequest instance
   * @param res OrvexResponse instance
   * @returns void
   */
  private ignoreRoutes(req: OrvexRequest, res: OrvexResponse): void {
    const junk = JUNK_ROUTES.some((route) => req.url.includes(route));
    if (junk) return res.noContent();
  }

  /**
   * Gets the registered handler for the current incoming request.
   * * @param request - An instance of the OrvexRequest.
   * @returns The route handler that is associated with the current request.
   * @throws {Error} Throws error indicating which method and url was not found.
   */
  private getCurrentRouteInfo(
    request: OrvexRequest,
  ): TRouteDefinition & { extractedParams: Record<string, string> } {
    const cleanUrl = request.url.split("?")[0];
    const routeHash = quickHash(`${request.method}-${cleanUrl}`);
    const staticMatch = this.staticRoutes.get(routeHash);

    if (staticMatch) {
      return { ...staticMatch, extractedParams: {} };
    }

    const incomingSegments = cleanUrl.split("/").filter(Boolean);
    for (const route of this.dynamicRoutes) {
      if (route.definition.method !== request.method) continue;
      if (route.segments.length !== incomingSegments.length) continue;

      const params: Record<string, string> = {};
      let matched = true;

      for (let i = 0; i < route.segments.length; i++) {
        const routeSegement = route.segments[i];
        const incomingSegment = incomingSegments[i];

        if (routeSegement.startsWith("$")) {
          const paramName = routeSegement.slice(1);
          params[paramName] = incomingSegment;
        } else if (routeSegement !== incomingSegment) {
          matched = false;
          break;
        }
      }
      if (matched) {
        return { ...route.definition, extractedParams: params };
      }
    }
    throw new Error(`[Orvex] Route not found: ${request.method} ${request.url}`);
  }

  /**
   * Helper to trigger the middleware pipeline once data is fully received.
   */
  private async handleRequestExecution(socket: net.Socket, rawData: Buffer) {
    try {
      const request = new OrvexRequest(rawData);
      const response = new OrvexResponse(socket);

      this.ignoreRoutes(request, response);

      const { handler, middlewares, extractedParams } = this.getCurrentRouteInfo(request);
      request.params = extractedParams;

      const chain = [...this.globalMiddlewares, ...middlewares, handler];
      const pipeline = new OrvexMiddleware(chain);
      await pipeline.exeMiddlewarePipeline(request, response);
    } catch (err) {
      console.error("Pipeline Error:", err);
      socket.end(RAW_HTTP_RESPONSE.INTERNAL_SERVER_ERROR);
    }
  }

  public prefix(prefixString: string): Orvex {
    this.prefixString = prefixString;
    return this;
  }

  /**
   * Merges the branch routes with global app routes.
   * @param branchedRoutes Nested route handlers.
   */
  public mergeWithGlobalRoute(
    branchedRoutes: TOrvexStaticRoute,
    branchedDynamicRoutes: typeof this.dynamicRoutes = [],
  ) {
    this.staticRoutes = new Map([...this.staticRoutes, ...branchedRoutes]);
    this.dynamicRoutes = [...this.dynamicRoutes, ...branchedDynamicRoutes];
  }

  /**
   *
   * @returns A new map for all the registered static routes.
   */
  public getStaticRoutes() {
    return new Map(this.staticRoutes);
  }

  /**
   *
   * @returns A array for all the registered dynamic routes.
   */
  public getDynamicRoutes() {
    return [...this.dynamicRoutes];
  }

  /**
   * Creates a root instance of Orvex app.
   *
   * @returns An instance of the Orvex app.
   */
  public static create() {
    const instance = new Orvex({ isRoot: true });
    return instance;
  }

  /**
   * Register an array of middleware to the current instance (could be the root app or a branch).
   * @param middlewares Array of middleware of type Array<TRoutehandler>.
   * @returns
   */
  public wire(middlewares: Array<TRoutehandler>): Orvex {
    // TODO: find a better way to do this.
    if (this.isRoot) {
      this.globalMiddlewares = [...this.globalMiddlewares, ...middlewares];
    } else {
      // TODO: probably have to deal with which sets of middleware for which branch problem here
      // every created branch will share a single common branchMiddleware
      this.branchMiddlewares = [...this.branchMiddlewares, ...middlewares];
    }
    return this;
  }

  /**
   * Registers a route to the current instance (could be the root app or a branch).
   * @param method HTTP methods like 'GET', 'POST' etc, import from `./src/core`.
   * @param url Requested resource.
   * @param handler Function to define the behavior of the route.
   */
  public register(
    method: HTTP,
    url: string,
    handler: TRoutehandler,
    middlewares: Array<TRoutehandler> = [],
  ) {
    const prefixedUrl = this.prefixString ? `${this.prefixString}${url}` : url;
    const definition: TRouteDefinition = {
      url: prefixedUrl,
      handler,
      method,
      middlewares: [...this.branchMiddlewares, ...middlewares],
    };

    if (prefixedUrl.includes("$")) {
      const segments = url.split("/").filter(Boolean);
      const paramNames = segments.filter((s) => s.startsWith("$")).map((s) => s.slice(1));
      this.dynamicRoutes.push({ segments, paramNames, definition });
      return;
    }
    const routeHash = quickHash(`${method}-${prefixedUrl}`);
    this.staticRoutes.set(routeHash, definition);
  }

  /**
   * Registers a branch to the root app with a prefixed `url`.
   * @param url Requested resource.
   * @param branch a nested route dispatcher (idk what that means).
   */
  public mount(url: string, branch: OrvexBranch) {
    //TODO: run some other validation checks here for the prefix.

    if (!url) throw new Error("Global prefix url cannnot be empty");
    if (url === "/") url = "";
    const formattedPrefixUrl = `${this.prefixString}${url}`;
    branch.prefixUrlWith(formattedPrefixUrl, this);
  }

  /**
   * Overload 1: All arguments provided
   */
  public async listen(port: number, _interface: string, callback?: () => void): Promise<void>;

  /**
   * Overload 2: Port and Callback only (Skips interface)
   */
  public async listen(port: number, callback?: () => void): Promise<void>;

  /**
   * Listens to a specified `port` and `_interface`.
   * @param port PORT number to listen to.
   * @param interfaceOrCallback Interface to listen to '127.0.0.1' by default. Or A Function to define some behavior right after server starts.
   * @param callback A Function to define some behavior right after server starts.
   */
  public async listen(
    port: number,
    interfaceOrCallback?: string | (() => void),
    callback?: () => void,
  ): Promise<void> {
    let host = "127.0.0.1";
    let actualCallback = callback;

    if (typeof interfaceOrCallback === "function") {
      actualCallback = interfaceOrCallback;
    } else if (typeof interfaceOrCallback === "string") {
      host = interfaceOrCallback;
    }

    const server = net.createServer((socket) => {
      let requestBuffer = Buffer.alloc(0);
      let expectedSize = -1;

      // setting timeout for 30s
      socket.setTimeout(30000);
      socket.on("timeout", () => {
        console.log("Request took too long. Closing connection.");
        socket.write(RAW_HTTP_RESPONSE.REQUEST_TIMEOUT);
        socket.destroy();
      });

      socket.on("data", async (chunk) => {
        requestBuffer = Buffer.concat([requestBuffer, chunk as any]);

        // in case if the user lies about the content length
        if (requestBuffer.length + chunk.length > MAX_PAYLOAD_SIZE) {
          console.error("Payload too large");
          socket.write(RAW_HTTP_RESPONSE.PAYLOAD_TOO_LARGE);
          return socket.destroy();
        }

        if (expectedSize === -1) {
          const headerEndIndex = requestBuffer.indexOf(Buffer.from("\r\n\r\n"));
          if (headerEndIndex !== -1) {
            const headersString = requestBuffer.slice(0, headerEndIndex).toString();
            const contentLengthMatch = headersString.match(/Content-Length: (\d+)/i);

            if (contentLengthMatch) {
              const contentLength = parseInt(contentLengthMatch[1], 10);

              // if the user claims to send something larger than the defined max payload size
              if (contentLength > MAX_PAYLOAD_SIZE) {
                socket.write(RAW_HTTP_RESPONSE.PAYLOAD_TOO_LARGE);
                return socket.destroy();
              }

              expectedSize = headerEndIndex + 4 + contentLength;
            } else {
              // this is for the get route as it has no body
              await this.handleRequestExecution(socket, requestBuffer);
              requestBuffer = Buffer.alloc(0);
              return;
            }
          }
        }
        // check to see if the request has been completed
        if (expectedSize !== -1 && requestBuffer.length >= expectedSize) {
          await this.handleRequestExecution(socket, requestBuffer);
          requestBuffer = Buffer.alloc(0);
          expectedSize = -1;
        }
      });

      socket.on("error", (err) => console.error("Socket Error:", err));
    });

    server.listen(port, host, () => {
      console.log(`Orvex Server running on http://${host}:${port}`);
      if (actualCallback) actualCallback();
    });
  }
}
