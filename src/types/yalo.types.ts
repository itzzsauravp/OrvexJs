import { YaloRequest, YaloResponse } from "../core";
import { LogLevel } from "../core/@yalo_enums";

export type TRoutehandler = (
  req: YaloRequest,
  res: YaloResponse,
  delegate: DelegateFunction,
) => any;

export type DelegateFunction = () => void | Promise<void>;

// export type TMiddlewarehandler = (
//   req: YaloRequest,
//   res: YaloResponse,
//   delegate: DelegateFunction,
// ) => void;

export type TRouteDefinition = {
  url: string;
  handler: TRoutehandler;
  method: string;
  middlewares: Array<TRoutehandler>;
};

export type TYaloRoutes = Map<string, TRouteDefinition>;

export type TYaloAppOptions = {
  isRoot: boolean;
};

export type TPicoOptions = {
  type: LogLevel;
};

export type TYaloDynamicRoutes = Array<{
  segments: string[];
  paramNames: string[];
  definition: TRouteDefinition;
}>;

export type PicoColor =
  | "red"
  | "green"
  | "blue"
  | "yellow"
  | "cyan"
  | "magenta"
  | "white"
  | "black"
  | "gray";
export type PicoBgColor =
  | "bgRed"
  | "bgGreen"
  | "bgBlue"
  | "bgYellow"
  | "bgCyan"
  | "bgMagenta"
  | "bgWhite"
  | "bgBlack";
