import pc from "picocolors";
import { LogLevel } from "../enums/yalo.enums";
import { TPicoOptions } from "../types/yalo.types";

export class PicoWrapper {
  private loggerMethod: (...args: any[]) => void;

  constructor(
    private readonly options: TPicoOptions = {
      type: LogLevel.LOG,
    },
  ) {
    const methods = {
      [LogLevel.ERROR]: console.error,
      [LogLevel.WARN]: console.warn,
      [LogLevel.LOG]: console.log,
    };
    this.loggerMethod = methods[this.options.type] || console.log;
  }

  private getStyledLevel = (logLevel: LogLevel): string => {
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
  };

  public print = (tag: string, message: string, hint?: string) => {
    const prefix = pc.cyan(`[${tag}]`);
    const level = this.getStyledLevel(this.options.type);
    const remediation = hint ? pc.gray(` (HINT: ${hint})`) : "";

    this.loggerMethod(`${prefix} ${level}: ${message}${remediation}`);
  };

  // TODO: need to make this more generic (for all colors).
  public bgCyan(message: string) {
    return pc.bgCyan(message);
  }
}
