import { TRoutehandler } from "./@yalo_types";
import { YaloRequest } from "./Request";
import { YaloResponse } from "./Response";
import { LogLevel } from "./@yalo_enums";
import { term } from "../common";

export class Middleware {
  constructor(private readonly middlewares: Array<TRoutehandler>) {}

  private createPipeline() {
    return (req: YaloRequest, res: YaloResponse) => {
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
              "Yalo",
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
            "Yalo",
            `Middleware Pipeline crashed ${term.setBg("bgRed", error.message)}`,
          );
          res.code(500).relay({ error: "Internal Server Error", originalError: error.message });
        }
      };

      return dispatch(0);
    };
  }

  public exeMiddlewarePipeline(req: YaloRequest, res: YaloResponse) {
    const pipeline = this.createPipeline();
    pipeline(req, res);
  }
}
