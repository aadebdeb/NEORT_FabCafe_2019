export class Timer {

  private startMillisecs: number = 0.0;
  private lastObservedMillisecs: number = 0.0;

  start(): void {
    this.startMillisecs = performance.now();
    this.lastObservedMillisecs = this.startMillisecs;
  }

  getElapsedSecs(): number {
    return (performance.now() - this.startMillisecs) * 0.001;
  }

  getElapsedDeltaSecs(): number {
    const prevLastOverservedMillisecs = this.lastObservedMillisecs;
    this.lastObservedMillisecs = performance.now();
    return (this.lastObservedMillisecs - prevLastOverservedMillisecs) * 0.001;
  }
}
