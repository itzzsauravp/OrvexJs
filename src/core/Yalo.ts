import net from "node:net";
import { initHasher, quickHash } from "../helpers/hashGenerator";
import type { Routehandler, HTTP } from "../core/@yalo_common";
import { YaloResponse } from "./Response";
import { YaloRequest } from ".";

export class Yalo {
  constructor() { }

  /**
   * A data structure to hold all the routes registered to the app;
   */
  private routes = new Map<string, Routehandler>();

  /**
     * Retrieves the registered handler for the current incoming request.
     * * @param request - An instance of the YaloRequest.
     * @returns The route handler that is associated with the current request 
     * @throws {Error} Throws error indicating which method and url was not found.
     */
  private getCurrentRoutesHandler(request: YaloRequest): Routehandler {
    const route_hash = quickHash(`${request.method}-${request.url}`);
    const handler = this.routes.get(route_hash);

    if (!handler) {
      throw new Error(`[Yalo] Route not found: ${request.method} ${request.url}`);
    }

    return handler;
  }

  /**
   * Creates a instance of new Yalo app along with a haser
   * 
   * The hasher is used for creating hash map of the incoming request
   * Example: `Map({<hash_value>: <http_method>-<requested_url>})`
   * @returns An instance of the Yalo app
   */
  public static async create() {
    const instance = new Yalo();
    await initHasher();
    return instance;
  }

  public register(http_verb: HTTP, route_name: string, handler: Routehandler) {
    const route_hash = quickHash(`${http_verb}-${route_name}`);
    this.routes.set(route_hash, handler);
  }

  public async listen(port: number, _interface: string = "127.0.0.1", callback: () => void) {
    const server = net.createServer((socket) => {
      socket.on("data", (rawBuffer) => {
        const request = new YaloRequest(rawBuffer);
        const handler = this.getCurrentRoutesHandler(request);
        const response = handler(request.getRequestObject(), new YaloResponse());

        socket.write(response);
        socket.end();
      });
    });

    server.listen(port, _interface);
    callback();
  }

  public getRoutes() {
    return this.routes;
  }
}
