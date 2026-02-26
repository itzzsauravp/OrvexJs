import { PicoWrapper } from "../utils/PicoWrapper";
import { TYaloMiddelware } from "./@yalo_types";
import { YaloRequest } from "./Request";
import { YaloResponse } from "./Response";
import { LogLevel } from "./@yalo_enums";

export class Middleware {
  constructor(private readonly middlewares: TYaloMiddelware) {}

  /**
   *
   * @returns A dispatch, Dispatch is a single middlware in the pipelines of middlware that get executed when delegated (calling next)
   */
  private createPipeline() {
    // TODO: probably can move this outside this function
    const pico = new PicoWrapper({ type: LogLevel.WARN });
    const print = pico.print;
    return (req: YaloRequest, res: YaloResponse) => {
      let index = -1;

      const dispatch = (i: number) => {
        if (i <= index) throw new Error("next() called multiple times");

        index = i;
        const fn = this.middlewares[i];
        if (!fn) return;

        if (fn.length < 3) {
          print(
            "Yalo",
            `Missing delegate() method for middlware ${pico.bgCyan(fn.name)}`,
            "please add a delegate method to remove this warning",
          );
          fn(req, res, () => {});
          return dispatch(i + 1);
        }

        return fn(req, res, () => dispatch(i + 1));
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
