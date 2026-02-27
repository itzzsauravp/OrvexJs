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
import { JUNK_ROUTES } from "./@orvex_constants";

export class Orvex {
  constructor(private readonly options?: TOrvexAppOption) {}

  /**
   * A data structure to hold all the `static` routes registered to the app.
   */
  private staticRoutes: TOrvexStaticRoute = new Map<string, TRouteDefinition>();

  private dynamicRoutes: TOrvexDynamicRoute = [];

  // FIX: one branch one set of middleware.
  /**
   * An array of middlewares intended for specific branch.
   */
  private branchMiddlewares: Array<TRoutehandler> = [];

  /**
   * An array of middlewares intended for all the routes.
   */
  private globalMiddlewares: Array<TRoutehandler> = [];

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
    // TODO: reivew this claudes magic later
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
    if (this.options.isRoot) {
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
    const definition: TRouteDefinition = {
      url,
      handler,
      method,
      middlewares: [...this.branchMiddlewares, ...middlewares],
    };

    if (url.includes("$")) {
      const segments = url.split("/").filter(Boolean);
      const paramNames = segments.filter((s) => s.startsWith("$")).map((s) => s.slice(1));
      this.dynamicRoutes.push({ segments, paramNames, definition });
      return;
    }
    const routeHash = quickHash(`${method}-${url}`);
    this.staticRoutes.set(routeHash, definition);
  }

  /**
   * Registers a branch to the root app with a prefixed `url`.
   * @param url Requested resource.
   * @param branch a nested route dispatcher (idk what that means).
   */
  // TODO: may be rename this to mount
  public mount(url: string, branch: OrvexBranch) {
    branch.prefixUrlWith(url, this);
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
      socket.on("data", (rawBuffer) => {
        const request = new OrvexRequest(rawBuffer);
        const response = new OrvexResponse(socket);

        this.ignoreRoutes(request, response);

        const { handler, middlewares, extractedParams } = this.getCurrentRouteInfo(request);
        request.params = extractedParams;

        const chain = [...this.globalMiddlewares, ...middlewares, handler];

        const pipeline = new OrvexMiddleware(chain);
        pipeline.exeMiddlewarePipeline(request, response);
      });
    });

    server.listen(port, host, () => {
      console.log("Static Routes:", this.getStaticRoutes());
      console.log("Dynamic Routes:", this.getDynamicRoutes());
      if (actualCallback) actualCallback();
    });
  }
}
