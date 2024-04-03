import { EventEmitter } from "events";

export type LogLevel = "none" | "verbose" | "info" | "warn" | "error";
type DataType = unknown;
type ConsoleType = "log" | "info" | "error" | "warn";
type Styles = {
  log?: string;
  info?: string;
  warn?: string;
  error?: string;
};
interface LoggerProps {
  logLevel?: LogLevel;
  name?: string;
  styles?: Styles;
}

export default class Logger extends EventEmitter {
  protected level: LogLevel = "none";
  protected name = "Logger";
  readonly styles: Styles = {
    log: "color: white;",
    info: "color: skyblue;",
    warn: "color: orange;",
    error: "color: red;",
  };

  private readonly levelGates = {
    verbose: "verbose",
    info: "info, verbose",
    warn: "warn, info, verbose",
    error: "error, warn, info, verbose",
  };

  readonly log = {
    info: (data: DataType[], style?: string) => this.info(data, style),
    warn: (data: DataType[], style?: string) => this.warn(data, style),
    error: (data: DataType[], style?: string) => this.error(data, style),
    verbose: (data: DataType[], style?: string) => this.verbose(data, style),
  };

  constructor({ logLevel, name, styles }: LoggerProps = {} as LoggerProps) {
    super();
    this.level = logLevel || this.level;
    this.name = name || this.name;
    this.styles = { ...this.styles, ...styles };
  }

  setLogLevel(level: LogLevel) {
    this.level = level;
  }

  private console(
    type: ConsoleType,
    styles = "color: white;",
    data: DataType[]
  ) {
    console[type](
      [`%c${this.name}:`, ...data.map((v) => `\t${v}`)].join("\n"),
      styles
    );
  }

  private verbose(data: DataType[], style = this.styles.log) {
    this.levelGates.verbose.match(this.level) &&
      this.console("log", style, data);
  }

  private info(data: DataType[], style = this.styles.info) {
    this.levelGates.info.match(this.level) && this.console("info", style, data);
  }

  private warn(data: DataType[], style = this.styles.warn) {
    this.levelGates.warn.match(this.level) && this.console("warn", style, data);
  }

  private error(data: DataType[], style = this.styles.error) {
    this.levelGates.error.match(this.level) &&
      this.console("error", style, data);
  }
}
