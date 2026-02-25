import net from "node:net";
import { initHasher, quickHash } from "../helpers/hashGenerator";
import { TRoutehandler, HTTP, TYaloRoutes, TRouteDefinition } from "../core/@yalo_common";
import { YaloRequest, YaloResponse, Branch } from ".";

export class Yalo {
  /**
   * A data structure to hold all the routes registered to the app.
   */
  private routes: TYaloRoutes = new Map<string, TRouteDefinition>();

  constructor(private readonly mode: "dev" | "prod" = "dev") {
    this.mode = mode;
  }

  /**
   * Retrieves the registered handler for the current incoming request.
   * * @param request - An instance of the YaloRequest.
   * @returns The route handler that is associated with the current request.
   * @throws {Error} Throws error indicating which method and url was not found.
   */
  private getCurrentRoutesHandler(request: YaloRequest): TRoutehandler {
    const route_hash = quickHash(`${request.method}-${request.url}`);
    const routeInfo = this.routes.get(route_hash);

    if (!routeInfo.url) {
      throw new Error(`[Yalo] Route not found: ${request.method} ${request.url}`);
    }

    return routeInfo.handler;
  }

  /**
   *  This method takes the nested route handlers and attaches them to the main app routes.
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
   * Creates a instance of new Yalo app along with a hasher.
   *
   * The hasher is used for creating hash map of the incoming request.
   * Example: `Map({<hash_value>: <http_method>-<requested_url>})`.
   * @returns An instance of the Yalo app.
   */
  public static async create() {
    const instance = new Yalo();
    // TODO: need to move this out of here, should happen when the instance itself is created.
    await initHasher();
    return instance;
  }

  /**
   *
   * @param method HTTP methods like 'GET', 'POST' etc, import from `./src/core`.
   * @param url Requested resource.
   * @param handler Function to define the behavior of the route.
   */
  public register(method: HTTP, url: string, handler: TRoutehandler) {
    const routeHash = quickHash(`${method}-${url}`);
    this.routes.set(routeHash, { url, handler, method });
  }

  /**
   *
   * @param url Requested resource.
   * @param branch a nested route dispatcher (idk what that means).
   */
  public plug(url: string, branch: Branch) {
    branch.prefixUrlWith(url, this);
  }

  /**
   *
   * @param port PORT number to listen to.
   * @param _interface Interface to listen to '127.0.0.1' by default.
   * @param callback Function to define some behavior right after server starts.
   */
  public async listen(port: number, _interface: string = "127.0.0.1", callback: () => void) {
    const server = net.createServer((socket) => {
      socket.on("data", (rawBuffer) => {
        const request = new YaloRequest(rawBuffer);
        const handler = this.getCurrentRoutesHandler(request);

        const response = handler(request, new YaloResponse());

        socket.write(response);
        socket.end();
      });
    });

    server.listen(port, _interface);
    console.log(this.getRoutes());
    callback();
  }
}
