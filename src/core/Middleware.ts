import { TRoutehandler } from "./@orvex_types";
import { OrvexRequest } from "./Request";
import { OrvexResponse } from "./Response";
import { LogLevel } from "./@orvex_enums";
import { term } from "../common";

export class OrvexMiddleware {
  constructor(private readonly middlewares: Array<TRoutehandler>) {}

  private createPipeline() {
    return (req: OrvexRequest, res: OrvexResponse) => {
      let index = -1;

      const dispatch = (i: number) => {
        try {
          if (i <= index) throw new Error("next() called multiple times");
          index = i;

          const fn = this.middlewares[i];
          if (!fn) return;

          if (fn.length < 3) {
            term.print(
              LogLevel.WARN,
              "Orvex",
              `Missing delegate() method for middleware ${term.setBg("bgCyan", fn.name)}`,
              "please add a delegate method to remove this warning",
            );
            fn(req, res, () => {});
            return dispatch(i + 1);
          }

          return fn(req, res, () => dispatch(i + 1));
        } catch (error) {
          term.print(
            LogLevel.ERROR,
            "Orvex",
            `Middleware Pipeline crashed ${term.setBg("bgRed", error.message)}`,
          );
          res.code(500).relay({ error: "Internal Server Error", originalError: error.message });
        }
      };

      return dispatch(0);
    };
  }

  public exeMiddlewarePipeline(req: OrvexRequest, res: OrvexResponse) {
    const pipeline = this.createPipeline();
    pipeline(req, res);
  }
}
