import { YaloRequest, YaloResponse } from "src/core";

export type TRoutehandler = (req: YaloRequest, res: YaloResponse) => any;

export type TMiddlewarehandler = (req: YaloRequest, res: YaloResponse) => any;

export type TYaloMiddelware = Array<TMiddlewarehandler>;

export type TRouteDefinition = {
  url: string;
  handler: TRoutehandler;
  method: string;
  middlewares: TYaloMiddelware;
};

export type TYaloRoutes = Map<string, TRouteDefinition>;

export enum HTTP {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
  OPTIONS = "OPTIONS",
}
