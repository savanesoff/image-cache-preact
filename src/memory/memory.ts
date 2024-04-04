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
/**
 * Represents a Memory object that tracks the usage of memory.
 */
export class Memory extends Logger {
  private bytes = 0;
  readonly units: UnitsType;
  readonly size: number;
  private count = 0;

  /**
   * Creates a new Memory object.
   * @param size - The size of the memory object.
   * @param units - The units of the memory object size.
   * @param logLevel - The log level for the memory object.
   * @param name - The name of the memory object.
   */
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
   * Compiles a string with the status of the memory object that can be logged.
   * @returns A string with the status of the memory object.
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

  /**
   * Gets the free space in the memory object.
   * @returns An object with the free space in bytes, units, and percentage.
   */
  getFreeSpace() {
    const unitUsed = this.toUnits(this.bytes);
    const prsUsed = (unitUsed / this.size) * 100;
    return {
      bytes: this.getBytesSpace(),
      units: this.size - unitUsed,
      prs: 100 - prsUsed,
    };
  }

  /**
   * Gets the used space in the memory object.
   * @returns An object with the used space in bytes, units, and percentage.
   */
  getUsedSpace() {
    const unitUsed = this.toUnits(this.bytes);
    const prsUsed = (unitUsed / this.size) * 100;
    return {
      bytes: this.bytes,
      units: unitUsed,
      prs: prsUsed,
    };
  }

  /**
   * Gets the average space in the memory object.
   * @returns An object with the average space in bytes, units, and percentage.
   */
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

  /**
   * Gets the state of the memory object.
   * @returns An object with the count, size, units, and size in bytes of the memory object.
   */
  getState() {
    return {
      count: this.count,
      size: this.size,
      units: this.units,
      sizeBytes: this.size * UNITS[this.units],
    };
  }

  /**
   * Adds bytes to the memory object and logs the status.
   * If adding bytes will overflow the memory object, no new bytes will be added.
   * @param bytes - The number of bytes to add to the memory object.
   * @returns The remaining bytes. If negative, the memory object is overflowed.
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
   * Adds units to the memory object.
   * @param units - The number of units to add to the memory object.
   * @returns The remaining units. If negative, the memory object is overflowed.
   */
  addUnits(units: number): number {
    const remainingBytes = this.addBytes(units * UNITS[this.units]);
    return remainingBytes != 0 ? remainingBytes / UNITS[this.units] : 0;
  }

  /**
   * Calculates the remaining space in the memory object.
   * @param withBytes - The number of bytes to add to the memory object.
   * @returns The remaining bytes. If negative, the memory object is overflowed.
   */
  getBytesSpace(withBytes = 0): number {
    const remaining = this.size * UNITS[this.units] - (this.bytes + withBytes);
    return remaining;
  }

  /**
   * Removes bytes from the memory object and logs the status.
   * Emits an "available" event if the memory object is not overflowed.
   * @param bytes - The number of bytes to remove from the memory object.
   * @returns The remaining bytes.
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
   * Clears the memory object and logs the status.
   * Emits a "clear" event.
   */
  clear() {
    this.bytes = 0;
    this.count = 0;
    this.log.info([`Cleared`], this.styles.info);
    this.emit("clear");
  }

  /**
   * Logs the status of the memory object.
   */
  print() {
    this.log.info([this.getStatus()], this.styles.info);
  }

  /**
   * Overrides the `on` method to add event listeners to the memory object.
   * @param event - The event to listen for.
   * @param listener - The listener function to be called when the event is emitted.
   * @returns The memory object itself.
   */
  on(event: Events, listener: () => void): this {
    super.on(event, listener);
    return this;
  }

  /**
   * Overrides the `emit` method to emit events from the memory object.
   * @param event - The event to emit.
   * @param value - The value to pass to the event listeners.
   * @returns A boolean indicating whether the event was emitted successfully.
   */
  emit(event: Events, value?: unknown): boolean {
    return super.emit(event, this, value);
  }
}
