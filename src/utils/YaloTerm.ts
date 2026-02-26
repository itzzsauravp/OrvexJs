import pc from "picocolors";
import { LogLevel } from "../core/@yalo_enums";
import { PicoBgColor, PicoColor } from "../core/@yalo_types";

export class YaloTerm {
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
   * @param tag     - Label shown in cyan e.g. "Yalo"
   * @param message - The main message
   * @param hint    - Optional gray hint shown at the end
   *
   * Example: logger.print(LogLevel.WARN, "Yalo", "something is off", "try this fix")
   */
  public print(level: LogLevel, tag: string, message: string, hint?: string): void {
    const prefix = pc.cyan(`[${tag}]`);
    const styledLevel = this.getStyledLevel(level);
    const remediation = hint ? pc.gray(` (HINT: ${hint})`) : "";
    const logMethod = this.getLogMethod(level);

    logMethod(`${prefix} ${styledLevel}: ${message}${remediation}`);
  }
}
