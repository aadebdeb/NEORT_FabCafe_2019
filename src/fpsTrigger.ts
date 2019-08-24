export class FpsTrigger {
  private elapsedSecs: number = 0.0;
  private accumSecs: number = 0.0;
  private stepSecs: number;

  constructor(readonly fps: number) {
    this.stepSecs = 1.0 / fps;
  }

  addDeltaSecs(deltaSecs: number, callback: (stepSecs: number, elapsedSecs: number) => void): void {
    this.accumSecs += deltaSecs;
    while(this.accumSecs > this.stepSecs) {
      this.accumSecs -= this.stepSecs;
      this.elapsedSecs += this.stepSecs;
      callback(this.stepSecs, this.elapsedSecs);
    }
  }
}