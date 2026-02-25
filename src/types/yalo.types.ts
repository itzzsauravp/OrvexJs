import { YaloRequest, YaloResponse } from "src/core";

export type TRoutehandler = (req: YaloRequest, res: YaloResponse) => any;

export type TMiddlewarehandler = (req: YaloRequest, res: YaloResponse) => void;

export type TYaloMiddelware = Array<TMiddlewarehandler>;

export type TRouteDefinition = {
  url: string;
  handler: TRoutehandler;
  method: string;
  middlewares: TYaloMiddelware;
};

export type TYaloRoutes = Map<string, TRouteDefinition>;

export type TYaloAppOptions = {
  isRoot: boolean;
};
