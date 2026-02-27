import pc from "picocolors";
import { LogLevel } from "../core/@orvex_enums";
import { PicoBgColor, PicoColor } from "../core/@orvex_types";

/**
 * OrvexTerm class provides ways to log information about the app to the terminal.(`LOG`, `WARN`, `ERROR`)
 *
 * Example: `[Orvex] [WARN]: Missing delegate() method for middleware <function_name_here> (HINT: please add a delegate method to remove this warning)`
 */
export class OrvexTerm {
  /**
   * Wraps text in a foreground color.
   * Example: logger.setColor("red", "something went wrong")
   */
  public setColor(color: PicoColor, message: string): string {
    return pc[color](message);
  }

  /**
   * Wraps text in a background color.
   * Example: logger.setBg("bgCyan", "middleware name")
   */
  public setBg(color: PicoBgColor, message: string): string {
    return pc[color](message);
  }

  private getStyledLevel(logLevel: LogLevel): string {
    switch (logLevel) {
      case LogLevel.ERROR:
        return pc.red(pc.bold(`[${logLevel.toUpperCase()}]`));
      case LogLevel.WARN:
        return pc.yellow(`[${logLevel.toUpperCase()}]`);
      case LogLevel.LOG:
        return pc.blue(`[${logLevel.toUpperCase()}]`);
      default:
        return `[${logLevel}]`;
    }
  }

  private getLogMethod(logLevel: LogLevel): (...args: any[]) => void {
    const methods = {
      [LogLevel.ERROR]: console.error,
      [LogLevel.WARN]: console.warn,
      [LogLevel.LOG]: console.log,
    };
    return methods[logLevel] ?? console.log;
  }

  /**
   * Prints a styled log message.
   * @param level   - LogLevel.ERROR | WARN | LOG
   * @param tag     - Label shown in cyan e.g. "Orvex"
   * @param message - The main message
   * @param hint    - Optional gray hint shown at the end
   *
   * Example: logger.print(LogLevel.WARN, "Orvex", "something is off", "try this fix")
   */
  public print(level: LogLevel, tag: string, message: string, hint?: string): void {
    const prefix = pc.cyan(`[${tag}]`);
    const styledLevel = this.getStyledLevel(level);
    const remediation = hint ? pc.gray(` (HINT: ${hint})`) : "";
    const logMethod = this.getLogMethod(level);

    logMethod(`${prefix} ${styledLevel}: ${message}${remediation}`);
  }
}
