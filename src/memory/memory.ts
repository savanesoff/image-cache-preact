import { Logger, LogLevel } from "@/logger";
import { UNITS, UnitsType } from "../units";

type Events = "overflow" | "available" | "clear";
interface MemoryProps {
  /** Size of memory in <units> */
  size?: number;
  /** Units of memory used with size */
  units?: UnitsType;
  logLevel?: LogLevel;
  name?: string;
}

/**
 * Represents a memory/size object in bytes.
 * Its and abstraction that represents memory usage.
 * Emits events when size is overflowed, available or cleared.
 */
export class Memory extends Logger {
  private bytes = 0;
  private readonly units: UnitsType;
  private readonly size: number;
  private count = 0;

  constructor({
    size = 1,
    units = "GB",
    logLevel = "verbose",
    name = "Memory",
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

  /**
   * Compiles a string with the status of the memory object you can log
   * @returns Returns a string with the status of the memory object
   */
  getStatus(): string {
    const { percent, consumed } = this.getState();
    return `Used: ${percent}% (${consumed.toFixed(3)}/${this.size} ${
      this.units
    }), Count: ${this.count}, Average: ${(consumed / this.count).toFixed(3)} ${
      this.units
    }`;
  }

  getState() {
    const consumed = this.toUnits(this.bytes);
    const percent = Math.round((consumed / this.size) * 100);
    return { percent, consumed, size: this.size, units: this.units };
  }

  /**
   * Adds bytes to the memory object and logs the status
   * Emits overflow event if the memory object is overflowed
   * @param bytes - The number of bytes to add to the memory object
   */
  add(bytes: number) {
    this.count++;
    this.bytes += bytes;

    this.log.info(
      [
        `Added: ${this.toUnits(bytes).toFixed(3)} ${this.units}`,
        this.getStatus(),
      ],
      this.styles.info
    );

    if (this.isOverflow()) {
      this.log.error([`Overflow!`, this.getStatus()], this.styles.error);
      this.emit("overflow");
    }
  }

  /**
   * Checks if the memory object is overflowed
   * @returns Returns true if the memory object is overflowed
   */
  isOverflow(): boolean {
    return this.toUnits(this.bytes) > this.size;
  }

  /**
   * Removes bytes from the memory object and logs the status
   * Emits available event if the memory object is not overflowed
   * @param bytes - The number of bytes to remove from the memory object
   */
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

    if (!this.isOverflow()) {
      this.emit("available");
    }
  }

  /**
   * Clears the memory object and logs the status
   * Emits clear event
   */
  clear() {
    this.bytes = 0;
    this.count = 0;
    this.log.info([`Cleared`], this.styles.info);
    this.emit("clear");
  }

  /**
   * Logs the status of the memory object
   */
  print() {
    this.log.info([this.getStatus()], this.styles.info);
  }

  on(event: Events, listener: () => void): this {
    super.on(event, listener);
    return this;
  }

  emit(event: Events): boolean {
    return super.emit(event, this);
  }
}
