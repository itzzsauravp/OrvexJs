import net from "node:net";
import { quickHash } from "../helpers/general.helper";
import {
  TRoutehandler,
  TYaloRoutes,
  TRouteDefinition,
  TYaloAppOptions,
  TYaloDynamicRoutes,
} from "./@yalo_types";
import { YaloRequest, YaloResponse, Branch } from ".";
import { HTTP } from "./@yalo_enums";
import { Middleware } from "./Middleware";

export class Yalo {
  /**
   * A data structure to hold all the `static` routes registered to the app.
   */
  private staticRoutes: TYaloRoutes = new Map<string, TRouteDefinition>();

  private dynamicRoutes: TYaloDynamicRoutes = [];

  // FIX: one branch one set of middleware.
  /**
   * An array of middlewares intended for specific branch.
   */
  private branchMiddlewares: Array<TRoutehandler> = [];

  /**
   * An array of middlewares intended for all the routes.
   */
  private globalMiddlewares: Array<TRoutehandler> = [];

  constructor(private readonly options?: TYaloAppOptions) {}

  /**
   * Gets the registered handler for the current incoming request.
   * * @param request - An instance of the YaloRequest.
   * @returns The route handler that is associated with the current request.
   * @throws {Error} Throws error indicating which method and url was not found.
   */
  private getCurrentRouteInfo(
    request: YaloRequest,
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
    throw new Error(`[Yalo] Route not found: ${request.method} ${request.url}`);
  }

  /**
   * Merges the branch routes with global app routes.
   * @param branchedRoutes Nested route handlers.
   */
  public mergeWithGlobalRoute(
    branchedRoutes: TYaloRoutes,
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
   * Creates a instance of new Yalo app.
   *
   * @returns An instance of the Yalo app.
   */
  public static async create() {
    const instance = new Yalo({ isRoot: true });
    return instance;
  }

  /**
   * Register an array of middleware to the current instance (could be the root app or a branch).
   * @param middlewares Array of middleware of type Array<TRoutehandler>.
   * @returns
   */
  public wire(middlewares: Array<TRoutehandler>): Yalo {
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
  public mount(url: string, branch: Branch) {
    branch.prefixUrlWith(url, this);
  }

  /**
   * Listens to a specified `port` and `_interface`.
   * @param port PORT number to listen to.
   * @param _interface Interface to listen to '127.0.0.1' by default.
   * @param callback Function to define some behavior right after server starts.
   */
  public async listen(port: number, _interface: string = "127.0.0.1", callback: () => void) {
    const server = net.createServer((socket) => {
      socket.on("data", (rawBuffer) => {
        const request = new YaloRequest(rawBuffer);
        const response = new YaloResponse(socket);

        const { handler, middlewares, extractedParams } = this.getCurrentRouteInfo(request);
        request.params = extractedParams;

        const chain = [...this.globalMiddlewares, ...middlewares, handler];

        const pipeline = new Middleware(chain);
        pipeline.exeMiddlewarePipeline(request, response);
      });
    });

    server.listen(port, _interface);
    console.log("Static Routes:", this.getStaticRoutes());
    console.log("Dynamic Routes:", this.getDynamicRoutes());
    callback();
  }
}
