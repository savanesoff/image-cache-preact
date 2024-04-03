import Logger, { LogLevel } from "./logger/logger";
import { UNITS, UnitsType } from "./units";

interface MemoryProps {
  size?: number;
  units?: UnitsType;
  logLevel?: LogLevel;
  name: string;
}

export default class Memory extends Logger {
  private bytes = 0;
  private readonly units: UnitsType;
  private readonly size: number;
  private count = 0;

  constructor({
    size = 1,
    units = "GB",
    logLevel = "verbose",
    name,
  }: MemoryProps) {
    super({
      name,
      logLevel: logLevel,
    });
    this.units = units;
    this.size = size;
  }

  private toUnits(bytes: number): number {
    return bytes / UNITS[this.units];
  }

  getStatus(): string {
    const ram = this.toUnits(this.bytes);
    const percent = Math.round((ram / this.size) * 100);
    return `Used: ${percent}% (${ram.toFixed(3)}/${this.size} ${
      this.units
    }), Count: ${this.count}, Average: ${(ram / this.count).toFixed(3)} ${
      this.units
    }`;
  }

  add(bytes: number) {
    this.count++;
    this.bytes += bytes;
    const ram = this.toUnits(this.bytes);

    this.log.info(
      [
        `Added: ${this.toUnits(bytes).toFixed(3)} ${this.units}`,
        this.getStatus(),
      ],
      this.styles.info
    );

    if (ram > this.size) {
      this.log.error([`Overflow!`, this.getStatus()], this.styles.error);
      this.emit("overflow", this);
    }
  }

  isOverflow(): boolean {
    return this.toUnits(this.bytes) > this.size;
  }

  remove(bytes: number) {
    this.count--;
    this.bytes -= bytes;
    this.log.info(
      [
        `Removed: ${this.toUnits(bytes).toFixed(3)} ${this.units}`,
        this.getStatus(),
      ],
      this.styles.info
    );
  }

  clear() {
    this.bytes = 0;
    this.log.info([`Cleared`], this.styles.info);
  }

  print() {
    this.log.info([this.getStatus()], this.styles.info);
  }
}
