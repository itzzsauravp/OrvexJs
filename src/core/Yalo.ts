import net from "node:net";
import { quickHash } from "../helpers/general.helper";
import {
  TRoutehandler,
  TYaloRoutes,
  TRouteDefinition,
  TYaloMiddelware,
  TYaloAppOptions,
} from "./@yalo_types";
import { YaloRequest, YaloResponse, Branch } from ".";
import { HTTP } from "./@yalo_enums";
import { Middleware } from "./Middleware";

export class Yalo {
  /**
   * A data structure to hold all the routes registered to the app.
   */
  private routes: TYaloRoutes = new Map<string, TRouteDefinition>();

  // FIX: one branch one set of middleware.
  /**
   * An array of middlewares intended for specific branch.
   */
  private branchMiddlewares: TYaloMiddelware = [];

  /**
   * An array of middlewares intended for all the routes.
   */
  private globalMiddlewares: TYaloMiddelware = [];

  constructor(private readonly options?: TYaloAppOptions) {}

  /**
   * Gets the registered handler for the current incoming request.
   * * @param request - An instance of the YaloRequest.
   * @returns The route handler that is associated with the current request.
   * @throws {Error} Throws error indicating which method and url was not found.
   */
  private getCurrentRouteInfo(request: YaloRequest): TRouteDefinition {
    const route_hash = quickHash(`${request.method}-${request.url}`);
    const routeInfo = this.routes.get(route_hash);

    // TODO: fix the url thing, this breaks when using browser,
    // also need to handle the case for dynamic routes, GET user/1 and GET user/2 would be same 2 routes in this case,
    // have to use regex or trie trees some bs like that to make it work
    if (!routeInfo.url) {
      throw new Error(`[Yalo] Route not found: ${request.method} ${request.url}`);
    }

    return routeInfo;
  }

  /**
   * Merges the branch routes with global app routes.
   * @param branchedRoutes Nested route handlers.
   */
  public mergeWithGlobalRoute(branchedRoutes: TYaloRoutes) {
    this.routes = new Map([...this.routes, ...branchedRoutes]);
  }

  /**
   *
   * @returns A new map for all the registered routes.
   */
  public getRoutes() {
    return new Map(this.routes);
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
   * @param middlewares Array of middleware of type TYaloMiddelware.
   * @returns
   */
  public wire(middlewares: TYaloMiddelware): Yalo {
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
    middlewares: TYaloMiddelware = [],
  ) {
    const routeHash = quickHash(`${method}-${url}`);
    this.routes.set(routeHash, {
      url,
      handler,
      method,
      middlewares: [...this.branchMiddlewares, ...middlewares],
    });
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
        const response = new YaloResponse();

        const { handler, middlewares } = this.getCurrentRouteInfo(request);

        if (this.globalMiddlewares.length) {
          const globalMiddlewareInstance = new Middleware(this.globalMiddlewares);
          globalMiddlewareInstance.exeMiddlewarePipeline(request, response);
        }

        if (middlewares.length) {
          const localMiddlewareInstace = new Middleware(middlewares);
          localMiddlewareInstace.exeMiddlewarePipeline(request, response);
        }

        const writable = handler(request, new YaloResponse());
        socket.write(writable);
        socket.end();
      });
    });

    server.listen(port, _interface);
    console.log(this.getRoutes());
    callback();
  }
}
