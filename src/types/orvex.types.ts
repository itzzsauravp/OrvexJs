import { OrvexRequest, OrvexResponse } from "../core";
import { LogLevel } from "../core/@orvex_enums";

export type TRoutehandler = (req: OrvexRequest, res: OrvexResponse, delegate: OrvexDelegate) => any;

export type OrvexDelegate = () => void | Promise<void>;

// export type TMiddlewarehandler = (
//   req: OrvexRequest,
//   res: OrvexResponse,
//   delegate: OrvexDelegate,
// ) => void;

export type TRouteDefinition = {
  url: string;
  handler: TRoutehandler;
  method: string;
  middlewares: Array<TRoutehandler>;
};

export type TOrvexStaticRoute = Map<string, TRouteDefinition>;

export type TOrvexAppOption = {
  isRoot: boolean;
};

export type TPicoOption = {
  type: LogLevel;
};

export type TOrvexDynamicRoute = Array<{
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
