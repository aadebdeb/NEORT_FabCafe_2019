type ConstructorOptions = {
  loopSecs?: number,
}

export class TimelineTrigger {

  private currentSecs = 0;
  private events: [number, (triggerSec: number, deltaSecs: number) => void][] = [];
  private loopSecs: number;

  constructor( {
    loopSecs = 30.0,
  }: ConstructorOptions = {}) {
    this.loopSecs = loopSecs;
  }

  add(triggerSec: number, callback: (triggerSec: number, deltaSecs: number) => void): void {
    this.events.push([triggerSec, callback]);
  }

  update(deltaSecs: number): void {
    const nextSecs = this.currentSecs + deltaSecs;
    this.events.forEach(event => {
      if (event[0] >= this.currentSecs && event[0] < nextSecs) {
        event[1](event[0], deltaSecs);
      }
    });
    this.currentSecs = nextSecs;
    if (this.currentSecs > this.loopSecs) {
      this.currentSecs %= this.loopSecs;
      this.events.forEach(event => {
        if (event[0] < this.currentSecs) {
          event[1](event[0], deltaSecs);
        }
      });
    }
  }
}