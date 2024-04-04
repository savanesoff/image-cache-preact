import { Logger, LogLevel } from "@/logger";
import { UNITS, UnitsType } from "../units";

type Events = "overflow" | "clear";
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
  readonly units: UnitsType;
  readonly size: number;
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
    return JSON.stringify(
      {
        state: this.getState(),
        free: this.getFreeSpace(),
        used: this.getUsedSpace(),
      },
      null,
      2
    );
  }

  getFreeSpace() {
    const unitUsed = this.toUnits(this.bytes);
    const prsUsed = (unitUsed / this.size) * 100;
    return {
      bytes: this.getBytesSpace(),
      units: this.size - unitUsed,
      prs: 100 - prsUsed,
    };
  }

  getUsedSpace() {
    const unitUsed = this.toUnits(this.bytes);
    const prsUsed = (unitUsed / this.size) * 100;
    return {
      bytes: this.bytes,
      units: unitUsed,
      prs: prsUsed,
    };
  }

  getAverage() {
    const unitUsed = this.toUnits(this.bytes);
    const prsUsed = (unitUsed / this.size) * 100;
    const isZero = unitUsed === 0 || this.count === 0;
    return {
      bytes: !isZero ? this.bytes / this.count : 0,
      units: !isZero ? unitUsed / this.count : 0,
      prs: !isZero ? prsUsed / this.count : 0,
    };
  }

  getState() {
    return {
      count: this.count,
      size: this.size,
      units: this.units,
      sizeBytes: this.size * UNITS[this.units],
    };
  }

  /**
   * Adds bytes to the memory object and logs the status
   * If adding bytes will overflow the memory object, not new bytes will be added.
   * @param bytes - The number of bytes to add to the memory object
   * @returns Returns the remaining bytes. If negative, the memory object is overflowed
   */
  addBytes(bytes: number): number {
    const remainingBytes = this.getBytesSpace(bytes);
    if (remainingBytes < 0) {
      this.log.warn(
        [`Cannot add, will overflow!`, this.getStatus()],
        this.styles.error
      );
      this.emit("overflow", -remainingBytes);
      return remainingBytes;
    }

    this.count++;
    this.bytes += bytes;

    this.log.info(
      [
        `Added: ${this.toUnits(bytes).toFixed(3)} ${this.units}`,
        this.getStatus(),
      ],
      this.styles.info
    );
    return remainingBytes;
  }

  /**
   * Adds bytes in units to the memory object
   * @param units
   * @returns  Returns the remaining units. If negative, the memory object is overflowed
   */
  addUnits(units: number): number {
    const remainingBytes = this.addBytes(units * UNITS[this.units]);
    return remainingBytes != 0 ? remainingBytes / UNITS[this.units] : 0;
  }

  /**
   * Calculates the remaining space in the memory object
   * @param withBytes  - The number of bytes to add to the memory object
   * @returns Returns the remaining bytes. If negative, the memory object is overflowed
   */
  getBytesSpace(withBytes = 0): number {
    const remaining = this.size * UNITS[this.units] - (this.bytes + withBytes);
    return remaining;
  }

  /**
   * Removes bytes from the memory object and logs the status
   * Emits available event if the memory object is not overflowed
   * @param bytes - The number of bytes to remove from the memory object
   */
  removeBytes(bytes: number): number {
    this.count--;
    this.bytes -= bytes;
    this.log.info(
      [
        `Removed: ${this.toUnits(bytes).toFixed(3)} ${this.units}`,
        this.getStatus(),
      ],
      this.styles.info
    );

    return this.getBytesSpace();
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

  emit(event: Events, value?: unknown): boolean {
    return super.emit(event, this, value);
  }
}
