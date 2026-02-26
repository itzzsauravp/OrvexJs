import { PicoWrapper } from "../utils/PicoWrapper";
import { TRoutehandler } from "./@yalo_types";
import { YaloRequest } from "./Request";
import { YaloResponse } from "./Response";
import { LogLevel } from "./@yalo_enums";

export class Middleware {
  constructor(private readonly middlewares: Array<TRoutehandler>) {}

  /**
   *
   * @returns A dispatch, Dispatch is a single middlware in the pipelines of middlware that get executed when delegated (calling next)
   */
  private createPipeline() {
    // TODO: probably can move this outside this function (probably can make this better with just one instance)
    const picoWarn = new PicoWrapper({ type: LogLevel.WARN });
    const printWarn = picoWarn.print;

    const picoError = new PicoWrapper({ type: LogLevel.ERROR });
    const printError = picoError.print;

    return (req: YaloRequest, res: YaloResponse) => {
      let index = -1;

      const dispatch = (i: number) => {
        try {
          if (i <= index) throw new Error("next() called multiple times");

          index = i;
          const fn = this.middlewares[i];
          if (!fn) return;

          if (fn.length < 3) {
            printWarn(
              "Yalo",
              `Missing delegate() method for middleware ${picoWarn.bgCyan(fn.name)}`,
              "please add a delegate method to remove this warning",
            );
            fn(req, res, () => {});
            return dispatch(i + 1);
          }

          return fn(req, res, () => dispatch(i + 1));
        } catch (error) {
          printError("Yalo", `Middleware Pipeline crashed ${picoError.bgRed(error.message)}`);
          // TODO: Have to make some kind of generic error handler middlware
          res.code(500).relay({ error: "Internal Server Error", originalError: error.message });
        }
      };

      return dispatch(0);
    };
  }

  /**
   *  Initializes a middleware pipeline and then executes them
   *
   * NOTE: The middlewares when defined require a `delegate` method to call the next one in the chain
   * @param req YaloRequest instance
   * @param res YaloResponse Instance
   */
  public exeMiddlewarePipeline(req: YaloRequest, res: YaloResponse) {
    const pipeline = this.createPipeline();
    pipeline(req, res);
  }
}
