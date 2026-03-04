import { TRoutehandler } from "./@orvex_types";
import { OrvexRequest } from "./Request";
import { OrvexResponse } from "./Response";
import { LogLevel } from "./@orvex_enums";
import { term } from "../common";

export class OrvexMiddleware {
  constructor(private readonly middlewares: Array<TRoutehandler>) {}

  private createPipeline() {
    return async (req: OrvexRequest, res: OrvexResponse) => {
      let index = -1;

      const dispatch = async (i: number): Promise<void> => {
        try {
          if (i <= index) throw new Error("next() called multiple times");
          index = i;

          const fn = this.middlewares[i];
          if (!fn) return;

          const lastIndex = this.middlewares.length - 1;

          if (i !== lastIndex && fn.length < 3) {
            term.print(
              LogLevel.WARN,
              "Orvex",
              `Missing next() method for middleware ${term.setBg("bgCyan", fn.name)}`,
            );
            await fn(req, res, () => {});
            return await dispatch(i + 1);
          }

          await fn(req, res, () => dispatch(i + 1));
        } catch (error) {
          term.print(
            LogLevel.ERROR,
            "Orvex",
            `Middleware Pipeline crashed: ${term.setBg("bgRed", error.message)}`,
          );
          res.code(500).relay({ error: "Internal Server Error" });
        }
      };

      return await dispatch(0);
    };
  }

  public async exeMiddlewarePipeline(req: OrvexRequest, res: OrvexResponse) {
    const pipeline = this.createPipeline();
    await pipeline(req, res);
  }
}
